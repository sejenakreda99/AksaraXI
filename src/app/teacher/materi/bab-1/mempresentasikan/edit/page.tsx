
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { TeacherHeader } from '@/components/layout/teacher-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save, PlusCircle, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type PresentasiContent = {
    assessmentCriteria: string[];
}

const defaultContent: PresentasiContent = {
    assessmentCriteria: [
        "Kriteria memerinci objek",
        "Kejelasan ekspresi",
        "Teks deskripsi dimulai dengan gambaran umum",
        "Teks memuat deskripsi bagian",
        "Teks mengandung kesan-kesan yang menyenangkan",
        "Teks sudah memperhatikan kaidah kebahasaan deskripsi"
    ]
};

export default function EditMempresentasikanPage() {
    const [content, setContent] = useState<PresentasiContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        async function fetchContent() {
            setLoading(true);
            try {
                const docRef = doc(db, 'chapters', '1');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().mempresentasikan) {
                    setContent(docSnap.data().mempresentasikan);
                } else {
                    setContent(defaultContent);
                }
            } catch (error) {
                console.error("Failed to fetch content:", error);
                toast({ variant: "destructive", title: "Gagal Memuat Konten" });
                setContent(defaultContent);
            } finally {
                setLoading(false);
            }
        }
        fetchContent();
    }, [toast]);
    
    const handleCriteriaChange = (index: number, value: string) => {
        if (!content) return;
        const newCriteria = [...content.assessmentCriteria];
        newCriteria[index] = value;
        setContent({ ...content, assessmentCriteria: newCriteria });
    };

    const addCriteria = () => {
        if (!content) return;
        setContent({ ...content, assessmentCriteria: [...content.assessmentCriteria, ''] });
    };

    const removeCriteria = (index: number) => {
        if (!content) return;
        const newCriteria = content.assessmentCriteria.filter((_, i) => i !== index);
        setContent({ ...content, assessmentCriteria: newCriteria });
    };


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!content) return;

        const finalContent = {
            ...content,
            assessmentCriteria: content.assessmentCriteria.filter(c => c.trim() !== '')
        };

        startTransition(async () => {
            try {
                const docRef = doc(db, 'chapters', '1');
                await setDoc(docRef, { mempresentasikan: finalContent }, { merge: true });
                toast({ title: "Berhasil", description: "Kriteria penilaian berhasil diperbarui." });
                router.push('/teacher/materi/bab-1/mempresentasikan');
            } catch (error) {
                console.error("Error updating document:", error);
                toast({ variant: "destructive", title: "Gagal Menyimpan Data" });
            }
        });
    };
    
    if (loading || !content) {
        return (
          <AuthenticatedLayout>
            <div className="flex flex-col h-full">
              <TeacherHeader title="Edit Kriteria Penilaian" description="Ubah kriteria untuk penilaian membaca nyaring." />
              <main className="flex-1 p-4 md:p-8"><div className="max-w-4xl mx-auto"><Skeleton className="h-96 w-full" /></div></main>
            </div>
          </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-full">
                <TeacherHeader title="Edit Kriteria Penilaian" description="Kelola kriteria yang digunakan siswa untuk menilai presentasi temannya." />
                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-4">
                            <Button asChild variant="outline">
                                <Link href="/teacher/materi/bab-1/mempresentasikan"><ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Pratinjau</Link>
                            </Button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Formulir Kriteria Penilaian</CardTitle>
                                    <CardDescription>Ubah, tambah, atau hapus unsur yang akan dinilai. Perubahan akan langsung diterapkan pada formulir penilaian siswa.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     {content.assessmentCriteria.map((criteria, index) => (
                                          <div key={index} className="flex items-center gap-2">
                                            <Label htmlFor={`criteria-${index}`} className="flex-none w-16 text-sm text-muted-foreground">#{index+1}</Label>
                                            <Input
                                                id={`criteria-${index}`}
                                                value={criteria}
                                                onChange={(e) => handleCriteriaChange(index, e.target.value)}
                                                placeholder="Tuliskan kriteria penilaian..."
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeCriteria(index)} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                                          </div>
                                        ))}
                                    <Button type="button" variant="outline" onClick={addCriteria}><PlusCircle className="mr-2 h-4 w-4" />Tambah Kriteria</Button>
                                </CardContent>
                            </Card>

                            <Button type="submit" disabled={isPending} className="w-full" size="lg">
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {isPending ? 'Menyimpan...' : 'Simpan Kriteria'}
                            </Button>
                        </form>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
