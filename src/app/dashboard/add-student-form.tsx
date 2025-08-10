'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createGroup } from './actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  email: z.string().email({ message: 'Alamat email tidak valid.' }),
  password: z.string().min(8, { message: 'Kata sandi minimal 8 karakter.' }),
  className: z.string().min(1, { message: 'Kelas harus dipilih.' }),
  groupName: z.string().min(1, { message: 'Nama kelompok harus dipilih.' }),
});


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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      className: '',
      groupName: '',
    },
  });

  // This useEffect handles the response from the server action
  useEffect(() => {
    if (!state) return;
    if (state.type === 'success') {
      toast({
        title: 'Berhasil',
        description: state.message,
      });
      form.reset();
    } else if (state.type === 'error') {
       toast({
        variant: 'destructive',
        title: 'Gagal',
        description: state.message,
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
            action={formAction}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="className"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kelas</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="groupName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kelompok</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormMessage />
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
                    <FormMessage />
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
                     <FormMessage />
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
