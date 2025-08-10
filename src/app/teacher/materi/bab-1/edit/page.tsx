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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type ChapterContent = {
  introduction: string;
  learningObjective: string;
  keywords: string[];
};

export default function EditBab1Page() {
  const [content, setContent] = useState<ChapterContent>({ introduction: '', learningObjective: '', keywords: [] });
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchContent() {
      try {
        const docRef = doc(db, 'chapters', '1');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data() as ChapterContent);
        } else {
          // You can set default values if the document doesn't exist
          const defaultContent = {
            introduction: `Tuhan Maha Pemurah karena bangsa Indonesia dianugerahi dengan alam yang sangat indah...`,
            learningObjective: `Pada bab ini, kalian akan mempelajari bagaimana mengevaluasi gagasan...`,
            keywords: ['teks deskripsi', 'gagasan', 'pandangan'],
          };
          setContent(defaultContent);
          await setDoc(docRef, defaultContent);
        }
      } catch (error) {
        console.error("Failed to fetch chapter content:", error);
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
    const formData = new FormData(event.currentTarget);
    const introduction = formData.get('introduction') as string;
    const learningObjective = formData.get('learningObjective') as string;
    const keywords = (formData.get('keywords') as string).split(',').map(k => k.trim()).filter(Boolean);

    startTransition(async () => {
      try {
        const docRef = doc(db, 'chapters', '1');
        await setDoc(docRef, { introduction, learningObjective, keywords }, { merge: true });
        toast({
          title: "Berhasil",
          description: "Konten berhasil diperbarui.",
        });
        router.push('/teacher/materi/bab-1');
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
          <TeacherHeader title="Edit Bab 1" description="Mengubah konten pengantar dan tujuan pembelajaran." />
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
                    <Skeleton className="h-24 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-10 w-full" />
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
          title="Edit Bab 1"
          description="Ubah konten pengantar dan tujuan pembelajaran untuk Bab 1."
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Button asChild variant="outline">
                <Link href="/teacher/materi/bab-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Struktur Bab
                </Link>
              </Button>
            </div>
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Formulir Konten Bab 1</CardTitle>
                  <CardDescription>
                    Perbarui teks di bawah ini. Perubahan akan langsung terlihat oleh siswa.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="introduction">Pengantar Bab</Label>
                    <Textarea
                      id="introduction"
                      name="introduction"
                      defaultValue={content.introduction}
                      rows={8}
                      className="min-h-[150px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="learningObjective">Tujuan Pembelajaran</Label>
                    <Textarea
                      id="learningObjective"
                      name="learningObjective"
                      defaultValue={content.learningObjective}
                      rows={4}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keywords">Kata Kunci</Label>
                    <Input
                      id="keywords"
                      name="keywords"
                      defaultValue={content.keywords.join(', ')}
                      placeholder="pisahkan dengan koma, contoh: teks, gagasan"
                    />
                    <p className="text-xs text-muted-foreground">Pisahkan setiap kata kunci dengan koma.</p>
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
