
'use client';

import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase/client';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Loader2, LogOut, User, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function StudentProfilePage() {
    const [user, loadingAuth] = useAuthState(auth);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
          await signOut(auth);
          toast({
            title: "Berhasil Keluar",
            description: "Anda telah berhasil keluar dari aplikasi.",
          });
          router.push("/");
        } catch (error) {
           toast({
            variant: "destructive",
            title: "Gagal Keluar",
            description: "Terjadi kesalahan saat mencoba keluar.",
          });
        } finally {
            setIsSigningOut(false);
        }
    };

    const isLoading = loadingAuth;

    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-full bg-slate-50">
                <header className="bg-background border-b p-4 sm:p-6">
                    <h1 className="text-2xl font-bold text-foreground">Profil Siswa</h1>
                    <p className="text-muted-foreground mt-1">Lihat detail akun Anda.</p>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    <div className="max-w-xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-6 h-6"/>
                                    Informasi Akun
                                </CardTitle>
                                <CardDescription>Berikut adalah data yang terdaftar untuk akun Anda.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isLoading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-6 w-3/4"/>
                                        <Skeleton className="h-5 w-1/2"/>
                                    </div>
                                ): user ? (
                                     <>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Mail className="w-4 h-4"/>
                                            <span>{user.email}</span>
                                        </div>
                                     </>
                                ) : (
                                    <p>Data pengguna tidak ditemukan.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Button 
                            variant="destructive" 
                            className="w-full mt-6 h-12 text-base"
                            onClick={handleSignOut}
                            disabled={isSigningOut || isLoading}
                        >
                            {isSigningOut ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogOut className="mr-2 h-5 w-5" />}
                            {isSigningOut ? 'Proses keluar...' : 'Keluar dari Akun'}
                        </Button>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
