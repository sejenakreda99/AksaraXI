'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createStudent } from './actions';

const initialState = {
  type: '',
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Menambahkan...' : 'Tambah Siswa'}
    </Button>
  );
}

export function AddStudentForm() {
  const [state, formAction] = useActionState(createStudent, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.type === 'success') {
      toast({
        title: 'Berhasil',
        description: state.message as string,
      });
    } else if (state?.type === 'error') {
       toast({
        variant: 'destructive',
        title: 'Gagal',
        description: typeof state.message === 'string' ? state.message : 'Silakan periksa kembali isian Anda.',
      });
    }
  }, [state, toast]);


  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Tambah Siswa Baru</CardTitle>
        <CardDescription>
          Buat akun untuk siswa agar mereka dapat masuk ke platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Siswa</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contoh@email.com"
              required
            />
             {typeof state.message !== 'string' && state.message?.email && (
              <p className="text-sm font-medium text-destructive">{state.message.email[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              required
            />
            {typeof state.message !== 'string' && state.message?.password && (
              <p className="text-sm font-medium text-destructive">{state.message.password[0]}</p>
            )}
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
