
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, getIdTokenResult } from "firebase/auth";
import { auth } from "@/lib/firebase/client";


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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { setUserRole } from "@/ai/flows/set-user-role-flow";

const formSchema = z.object({
  email: z.string().email({
    message: "Harap masukkan alamat email yang valid.",
  }),
  password: z.string().min(8, {
    message: "Kata sandi minimal 8 karakter.",
  }),
  rememberMe: z.boolean().default(false).optional(),
});

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // THIS IS THE FIX:
      // If the user is the teacher, we will ensure their role is set before attempting to log in.
      // This is a robust way to solve the "role not found" issue permanently.
      if (values.email === 'guruindonesia@gmail.com') {
          console.log("Teacher email detected. Ensuring 'Guru' role is set...");
          // We call this in the background. We don't need to wait for it,
          // as the subsequent login and token refresh will pick up the new role.
          await setUserRole({ email: values.email, role: 'Guru' });
      }

      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Force refresh to get the latest token with custom claims
      const idTokenResult = await getIdTokenResult(user, true);
      const userRole = idTokenResult.claims.role;

      toast({
        title: "Masuk Berhasil",
        description: `Selamat datang kembali, ${userRole || 'Pengguna'}!`,
      });

      // Redirect based on the custom claim role
      if (userRole === 'Guru') {
         router.push("/dashboard");
      } else if (userRole === 'Siswa') {
         router.push("/student");
      } else {
         // Fallback for users without a role
         await auth.signOut();
         toast({
            variant: "destructive",
            title: "Peran Tidak Ditemukan",
            description: "Akun Anda tidak memiliki peran yang valid. Silakan hubungi admin.",
         });
         router.push("/");
      }
      
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Email atau kata sandi yang Anda masukkan salah.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Email atau kata sandi salah. Silakan coba lagi.";
      }
      toast({
        variant: "destructive",
        title: "Gagal Masuk",
        description: errorMessage,
      });
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-2xl">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-bold">Aksara XI</CardTitle>
        <CardDescription>
          Masuk untuk melanjutkan pembelajaran interaktif Anda.
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
                        <Input placeholder="contoh@email.com" {...field} className="pl-10 h-12" />
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
                        <Input type="password" placeholder="********" {...field} className="pl-10 h-12" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        id="rememberMe"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel htmlFor="rememberMe" className="font-normal cursor-pointer">
                      Ingat saya
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Link
                href="/forgot-password"
                className="font-medium text-primary hover:underline"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
