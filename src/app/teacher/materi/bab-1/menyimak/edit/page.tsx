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
import { Textarea } from '@/components/ui/textarea';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type Statement = {
  no: number;
  statement: string;
}

type MenyimakContent = {
  learningObjective: string;
  youtubeUrl: string;
  statements: Statement[];
};

export default function EditMenyimakPage() {
  const [content, setContent] = useState<MenyimakContent | null>(null);
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
          setContent(docSnap.data().menyimak);
        } else {
          // Initialize with some default structure if it doesn't exist
          setContent({
            learningObjective: '',
            youtubeUrl: '',
            statements: [{ no: 1, statement: '' }]
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

  const handleStatementChange = (index: number, value: string) => {
    if (!content) return;
    const newStatements = [...content.statements];
    newStatements[index].statement = value;
    setContent({ ...content, statements: newStatements });
  };

  const addStatement = () => {
    if (!content) return;
    const newStatements = [...content.statements, { no: content.statements.length + 1, statement: '' }];
    // Re-number the 'no' property to ensure it's sequential
    const renumberedStatements = newStatements.map((stmt, index) => ({ ...stmt, no: index + 1 }));
    setContent({ ...content, statements: renumberedStatements });
  };

  const removeStatement = (index: number) => {
    if (!content) return;
    const newStatements = content.statements.filter((_, i) => i !== index);
     // Re-number the 'no' property after removal
    const renumberedStatements = newStatements.map((stmt, index) => ({ ...stmt, no: index + 1 }));
    setContent({ ...content, statements: renumberedStatements });
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content) return;

    // Filter out any empty statements before saving
    const finalStatements = content.statements.filter(s => s.statement.trim() !== '');

    startTransition(async () => {
      try {
        const docRef = doc(db, 'chapters', '1');
        await setDoc(docRef, { 
            menyimak: {
                ...content,
                statements: finalStatements
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
  
  if (loading || !content) {
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
                    <Skeleton className="h-10 w-full mb-2" />
                    <Skeleton className="h-10 w-full mb-2" />
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
                      value={content.learningObjective}
                      onChange={(e) => setContent({...content, learningObjective: e.target.value})}
                      rows={4}
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="youtubeUrl">Tautan Video YouTube</Label>
                    <Input
                      id="youtubeUrl"
                      name="youtubeUrl"
                      value={content.youtubeUrl}
                      onChange={(e) => setContent({...content, youtubeUrl: e.target.value})}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Daftar Pernyataan</Label>
                    {content.statements.map((statement, index) => (
                      <div key={index} className="flex items-center gap-2">
                         <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                        <Input
                          type="text"
                          value={statement.statement}
                          onChange={(e) => handleStatementChange(index, e.target.value)}
                          placeholder={`Pernyataan #${index + 1}`}
                          className="flex-grow"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeStatement(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                           <span className="sr-only">Hapus</span>
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addStatement}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Tambah Pernyataan
                    </Button>
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
