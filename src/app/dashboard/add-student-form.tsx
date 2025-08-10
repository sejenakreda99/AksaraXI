'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createGroup } from './actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
        <CardTitle>Tambah Kelompok Baru</CardTitle>
        <CardDescription>
          Buat akun untuk kelompok agar mereka dapat masuk ke platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="className">Kelas</Label>
            <Input type="hidden" name="className" id="classNameInput" />
            <Select name="className">
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XI-2">XI-2</SelectItem>
                <SelectItem value="XI-3">XI-3</SelectItem>
              </SelectContent>
            </Select>
            {typeof state.message !== 'string' && state.message?.className && (
              <p className="text-sm font-medium text-destructive">{state.message.className[0]}</p>
            )}
          </div>
           <div className="space-y-2">
            <Label htmlFor="groupName">Nama Kelompok</Label>
            <Input type="hidden" name="groupName" id="groupNameInput" />
            <Select name="groupName">
              <SelectTrigger>
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
            {typeof state.message !== 'string' && state.message?.groupName && (
              <p className="text-sm font-medium text-destructive">{state.message.groupName[0]}</p>
            )}
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
