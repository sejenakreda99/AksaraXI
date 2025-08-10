'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export function AddGroupForm({ onGroupAdded }: { onGroupAdded: () => void }) {
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const className = formData.get('className') as string;
    const groupName = formData.get('groupName') as string;

    if (!email || !password || !className || !groupName) {
        toast({
            variant: 'destructive',
            title: 'Gagal',
            description: 'Semua kolom harus diisi.',
        });
        setIsPending(false);
        return;
    }
     if (password.length < 8) {
        toast({
            variant: 'destructive',
            title: 'Gagal',
            description: 'Kata sandi minimal 8 karakter.',
        });
        setIsPending(false);
        return;
    }


    try {
      // Create a temporary auth instance to create the user
      // This is a workaround to create a user without signing them in on the admin's device.
      const { app: tempApp } = await import('@/lib/firebase');
      const { getAuth: getTempAuth } = await import('firebase/auth');
      const tempAuth = getTempAuth(tempApp);

      const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
      const user = userCredential.user;

      // Set displayName for role distinction
      await updateProfile(user, { displayName: "Siswa" });

      // Save group info to Firestore
      await setDoc(doc(db, 'groups', user.uid), {
        className,
        groupName,
        email,
      });

      toast({
        title: 'Berhasil',
        description: `Kelompok ${groupName} berhasil dibuat.`,
      });
      formRef.current?.reset();
      onGroupAdded(); // Refresh the list
    } catch (error: any) {
      let message = 'Terjadi kesalahan yang tidak diketahui.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Email ini sudah terdaftar. Silakan gunakan email lain.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Kata sandi terlalu lemah. Gunakan minimal 8 karakter.';
      }
      console.error('Error creating user:', error);
       toast({
        variant: 'destructive',
        title: 'Gagal',
        description: message,
      });
    } finally {
        setIsPending(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Tambah Kelompok Baru</CardTitle>
        <CardDescription>
          Buat akun untuk kelompok agar mereka dapat masuk ke platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="className">Kelas</Label>
            <Select name="className" required>
              <SelectTrigger id="className">
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XI-2">XI-2</SelectItem>
                <SelectItem value="XI-3">XI-3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="groupName">Nama Kelompok</Label>
            <Select name="groupName" required>
              <SelectTrigger id="groupName">
                <SelectValue placeholder="Pilih Kelompok" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 6 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={`Kelompok ${num}`}>
                    Kelompok {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Kelompok</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contoh@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              minLength={8}
              required
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Menambahkan...' : 'Tambah Kelompok'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
