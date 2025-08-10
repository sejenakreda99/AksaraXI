'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';

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
import { createGroup } from './actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const initialState = {
  type: '',
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Menambahkan...' : 'Tambah Kelompok'}
    </Button>
  );
}

export function AddGroupForm() {
  const [state, formAction] = useActionState(createGroup, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!state) return;
    if (state.type === 'success') {
      toast({
        title: 'Berhasil',
        description: state.message,
      });
      formRef.current?.reset();
    } else if (state.type === 'error') {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Tambah Kelompok Baru</CardTitle>
        <CardDescription>
          Buat akun untuk kelompok agar mereka dapat masuk ke platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
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
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
