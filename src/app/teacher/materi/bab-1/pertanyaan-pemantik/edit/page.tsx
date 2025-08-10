'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { TeacherHeader } from '@/components/layout/teacher-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditPertanyaanPemantikPage() {
  const [questions, setQuestions] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchContent() {
      try {
        const docRef = doc(db, 'chapters', '1');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().sparkingQuestions) {
          setQuestions(docSnap.data().sparkingQuestions.join('\n'));
        }
      } catch (error) {
        console.error("Failed to fetch sparking questions:", error);
        toast({
          variant: "destructive",
          title: "Gagal Memuat Konten",
          description: "Tidak dapat mengambil data dari server."
        });
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [toast]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const questionsArray = questions.split('\n').map(q => q.trim()).filter(Boolean);

    startTransition(async () => {
      try {
        const docRef = doc(db, 'chapters', '1');
        await setDoc(docRef, { sparkingQuestions: questionsArray }, { merge: true });
        toast({
          title: "Berhasil",
          description: "Pertanyaan pemantik berhasil diperbarui.",
        });
        router.push('/teacher/materi/bab-1/pertanyaan-pemantik');
      } catch (error) {
        console.error("Error updating document:", error);
        toast({
          variant: "destructive",
          title: "Gagal",
          description: "Terjadi kesalahan saat menyimpan data.",
        });
      }
    });
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex flex-col h-full">
          <TeacherHeader title="Edit Pertanyaan Pemantik" description="Ubah daftar pertanyaan pemantik untuk Bab 1." />
          <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
              <Skeleton className="h-10 w-40 mb-4" />
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-48 w-full" />
                  </div>
                  <Skeleton className="h-10 w-48" />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="Edit Pertanyaan Pemantik"
          description="Ubah daftar pertanyaan pemantik untuk Bab 1."
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Button asChild variant="outline">
                <Link href="/teacher/materi/bab-1/pertanyaan-pemantik">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Link>
              </Button>
            </div>
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Formulir Pertanyaan Pemantik</CardTitle>
                  <CardDescription>
                    Masukkan satu pertanyaan per baris. Baris kosong akan diabaikan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="sparking-questions">Daftar Pertanyaan</Label>
                    <Textarea
                      id="sparking-questions"
                      name="sparking-questions"
                      value={questions}
                      onChange={(e) => setQuestions(e.target.value)}
                      rows={10}
                      className="min-h-[200px]"
                    />
                  </div>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
