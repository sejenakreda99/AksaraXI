
'use client';

import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase/client';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, LogOut, User, Users, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

type GroupData = {
    groupName: string;
    className: string;
    members: string[];
    email: string;
}

export default function StudentProfilePage() {
    const [user, loadingAuth] = useAuthState(auth);
    const [groupData, setGroupData] = useState<GroupData | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const { toast } = useToast();
    const router = useRouter();


    useEffect(() => {
        async function fetchGroupData() {
            if (user) {
                try {
                    const docRef = doc(db, 'groups', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setGroupData(docSnap.data() as GroupData);
                    }
                } catch (error) {
                    console.error("Error fetching group data:", error);
                     toast({
                        variant: "destructive",
                        title: "Gagal memuat data",
                        description: "Tidak dapat mengambil data kelompok.",
                    });
                } finally {
                    setLoadingData(false);
                }
            } else if (!loadingAuth) {
                setLoadingData(false);
            }
        }

        fetchGroupData();
    }, [user, loadingAuth, toast]);
    
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


    const isLoading = loadingAuth || loadingData;

    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-full bg-slate-50">
                <header className="bg-background border-b p-4 sm:p-6">
                    <h1 className="text-2xl font-bold text-foreground">Profil Kelompok</h1>
                    <p className="text-muted-foreground mt-1">Lihat detail dan informasi kelompok Anda.</p>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    <div className="max-w-xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-6 h-6"/>
                                    Informasi Kelompok
                                </CardTitle>
                                <CardDescription>Berikut adalah data yang terdaftar untuk kelompok Anda.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isLoading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-6 w-3/4"/>
                                        <Skeleton className="h-5 w-1/2"/>
                                        <Separator/>
                                        <Skeleton className="h-16 w-full"/>
                                    </div>
                                ): groupData ? (
                                     <>
                                        <div>
                                            <h3 className="font-semibold text-lg">{groupData.groupName} - Kelas {groupData.className}</h3>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Mail className="w-4 h-4"/>
                                            <span>{groupData.email}</span>
                                        </div>
                                        <Separator/>
                                        <div>
                                            <h4 className="font-semibold flex items-center gap-2 mb-2">
                                                <Users className="w-5 h-5"/>
                                                Anggota Kelompok
                                            </h4>
                                            <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                                                {groupData.members.map((member) => <li key={member}>{member}</li>)}
                                            </ul>
                                        </div>
                                     </>
                                ) : (
                                    <p>Data kelompok tidak ditemukan.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Button 
                            variant="destructive" 
                            className="w-full mt-6 h-12 text-base"
                            onClick={handleSignOut}
                            disabled={isSigningOut}
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
