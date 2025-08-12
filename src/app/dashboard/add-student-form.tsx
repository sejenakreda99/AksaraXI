
'use client';

import { useRef, useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { createStudent, CreateStudentInput } from '@/ai/flows/create-student-flow';

export function AddStudentForm({ onStudentAdded }: { onStudentAdded: () => void }) {
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: 'Email dan kata sandi harus diisi.',
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
      const studentData: CreateStudentInput = {
        email,
        password,
      };

      const result = await createStudent(studentData);

      toast({
        title: 'Berhasil',
        description: `Akun siswa untuk ${email} berhasil dibuat.`,
      });
      formRef.current?.reset();
      onStudentAdded(); // Refresh the list
    } catch (error: any) {
      console.error('Error creating user via flow:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Akun',
        description: error.message || 'Terjadi kesalahan yang tidak diketahui.',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tambah Siswa Baru</CardTitle>
        <CardDescription>
          Buat akun untuk siswa agar mereka dapat masuk ke platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Siswa</Label>
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
            {isPending ? 'Menambahkan...' : 'Tambah Siswa'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
