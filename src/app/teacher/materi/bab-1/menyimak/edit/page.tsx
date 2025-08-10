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

type MenyimakContent = {
  learningObjective: string;
  youtubeUrl: string;
  statements: string[]; // Store as array of strings for easier editing in textarea
};

export default function EditMenyimakPage() {
  const [content, setContent] = useState<MenyimakContent>({ learningObjective: '', youtubeUrl: '', statements: [] });
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchContent() {
      try {
        const docRef = doc(db, 'chapters', '1');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().menyimak) {
          const fetchedData = docSnap.data().menyimak;
          // Convert statement objects to a simple string array for the textarea
          const statementStrings = (fetchedData.statements || []).map((s: any) => s.statement || '');
          setContent({
            learningObjective: fetchedData.learningObjective || '',
            youtubeUrl: fetchedData.youtubeUrl || '',
            statements: statementStrings
          });
        }
      } catch (error) {
        console.error("Failed to fetch content:", error);
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

  const handleStatementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent({ ...content, statements: e.target.value.split('\n') });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const learningObjective = formData.get('learningObjective') as string;
    const youtubeUrl = formData.get('youtubeUrl') as string;
    const statementsText = formData.get('statements') as string;

    const statementsArray = statementsText.split('\n').map(s => s.trim()).filter(Boolean);

    // Convert back to the object structure for Firestore
    const statementsForDb = statementsArray.map((stmt, index) => ({
      no: index + 1,
      statement: stmt
    }));

    startTransition(async () => {
      try {
        const docRef = doc(db, 'chapters', '1');
        await setDoc(docRef, { 
            menyimak: {
                learningObjective,
                youtubeUrl,
                statements: statementsForDb
            } 
        }, { merge: true });

        toast({
          title: "Berhasil",
          description: "Konten Menyimak berhasil diperbarui.",
        });
        router.push('/teacher/materi/bab-1/menyimak');
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
          <TeacherHeader title="Edit Konten Menyimak" description="Ubah konten untuk bagian Menyimak Teks Deskripsi." />
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
                    <Skeleton className="h-10 w-full" />
                  </div>
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
          title="Edit Konten Menyimak"
          description="Ubah konten untuk bagian Menyimak Teks Deskripsi."
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Button asChild variant="outline">
                <Link href="/teacher/materi/bab-1/menyimak">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Link>
              </Button>
            </div>
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Formulir Konten Menyimak</CardTitle>
                  <CardDescription>
                    Perbarui teks dan tautan di bawah ini.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="learningObjective">Tujuan Pembelajaran</Label>
                    <Textarea
                      id="learningObjective"
                      name="learningObjective"
                      defaultValue={content.learningObjective}
                      rows={4}
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="youtubeUrl">Tautan Video YouTube</Label>
                    <Input
                      id="youtubeUrl"
                      name="youtubeUrl"
                      defaultValue={content.youtubeUrl}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="statements">Daftar Pernyataan</Label>
                    <Textarea
                      id="statements"
                      name="statements"
                      defaultValue={content.statements.join('\n')}
                      rows={10}
                      className="min-h-[200px]"
                    />
                    <p className="text-xs text-muted-foreground">Masukkan satu pernyataan per baris. Baris kosong akan diabaikan.</p>
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
