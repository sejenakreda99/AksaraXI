
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { Mail, Lock, Phone } from "lucide-react";
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createStudent } from "@/ai/flows/create-student-flow";

const formSchema = z.object({
  email: z.string().email({
    message: "Harap masukkan alamat email yang valid.",
  }).refine(email => email.endsWith('@gmail.com'), {
    message: "Saat ini pendaftaran hanya mendukung email @gmail.com"
  }),
  phone: z.string().min(10, {
    message: "Nomor telepon minimal 10 digit.",
  }).max(15, {
    message: "Nomor telepon maksimal 15 digit."
  }),
  password: z.string().min(8, {
    message: "Kata sandi minimal 8 karakter.",
  }),
});

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      phone: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await createStudent({
          email: values.email,
          password: values.password,
          phone: values.phone,
      });

      toast({
        title: "Pendaftaran Berhasil",
        description: `Akun untuk ${result.email} telah dibuat. Silakan masuk.`,
      });

      router.push("/");
      
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Gagal Mendaftar",
        description: error.message || "Terjadi kesalahan. Silakan coba lagi.",
      });
    }
  }

  return (
     <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold">Daftar Akun Siswa</CardTitle>
            <CardDescription>
              Buat akun baru untuk memulai petualangan belajar Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                   <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="siswa@gmail.com" {...field} className="pl-10 h-12" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon Aktif</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="tel" placeholder="081234567890" {...field} className="pl-10 h-12" />
                          </div>
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
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="password" placeholder="Minimal 8 karakter" {...field} className="pl-10 h-12" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Memproses..." : "Daftar"}
                </Button>
                 <p className="text-sm text-muted-foreground text-center">
                    Sudah punya akun?{' '}
                    <Button variant="link" asChild className="p-0 h-auto">
                        <Link href="/">
                            Masuk di sini
                        </Link>
                    </Button>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
    </main>
  );
}
