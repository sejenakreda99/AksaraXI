'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createGroup } from './actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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
  const form = useForm();

  useEffect(() => {
    if (state?.type === 'success') {
      toast({
        title: 'Berhasil',
        description: state.message as string,
      });
      form.reset({ email: '', password: '', className: undefined, groupName: undefined });
    } else if (state?.type === 'error') {
       toast({
        variant: 'destructive',
        title: 'Gagal',
        description: typeof state.message === 'string' ? state.message : 'Silakan periksa kembali isian Anda.',
      });
    }
  }, [state, toast, form]);


  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Tambah Kelompok Baru</CardTitle>
        <CardDescription>
          Buat akun untuk kelompok agar mereka dapat masuk ke platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            action={(formData) => {
              const data = form.getValues();
              formData.set('className', data.className || '');
              formData.set('groupName', data.groupName || '');
              formAction(formData);
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="className"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kelas</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kelas" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="XI-2">XI-2</SelectItem>
                      <SelectItem value="XI-3">XI-3</SelectItem>
                    </SelectContent>
                  </Select>
                  {typeof state.message !== 'string' && state.message?.className && (
                    <p className="text-sm font-medium text-destructive">{state.message.className[0]}</p>
                  )}
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="groupName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kelompok</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kelompok" />
                      </SelectTrigger>
                    </FormControl>
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
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                 <FormItem>
                    <FormLabel>Email Kelompok</FormLabel>
                    <FormControl>
                        <Input
                            {...field}
                            type="email"
                            placeholder="contoh@email.com"
                        />
                    </FormControl>
                    {typeof state.message !== 'string' && state.message?.email && (
                        <p className="text-sm font-medium text-destructive">{state.message.email[0]}</p>
                    )}
                 </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                 <FormItem>
                    <FormLabel>Kata Sandi</FormLabel>
                    <FormControl>
                        <Input
                            {...field}
                            type="password"
                            placeholder="********"
                        />
                    </FormControl>
                    {typeof state.message !== 'string' && state.message?.password && (
                        <p className="text-sm font-medium text-destructive">{state.message.password[0]}</p>
                    )}
                 </FormItem>
              )}
            />
            <SubmitButton />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}