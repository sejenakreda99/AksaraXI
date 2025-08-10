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
import { Textarea } from '@/components/ui/textarea';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

type ReadingContent = {
  learningObjective: string;
  text: string;
  questions: string[];
};

export default function EditMembacaPage() {
  const [content, setContent] = useState<ReadingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchContent() {
      try {
        const docRef = doc(db, 'chapters', '1');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().membaca) {
          setContent(docSnap.data().membaca);
        } else {
          setContent({
            learningObjective: '',
            text: '',
            questions: ['']
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

  const handleQuestionChange = (index: number, value: string) => {
    if (!content) return;
    const newQuestions = [...content.questions];
    newQuestions[index] = value;
    setContent({ ...content, questions: newQuestions });
  };
  
  const addQuestion = () => {
    if (!content) return;
    setContent({ ...content, questions: [...content.questions, ''] });
  };

  const removeQuestion = (index: number) => {
    if (!content) return;
    const newQuestions = content.questions.filter((_, i) => i !== index);
    setContent({ ...content, questions: newQuestions });
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content) return;

    const finalContent = {
        ...content,
        questions: content.questions.filter(q => q.trim() !== '')
    };

    startTransition(async () => {
      try {
        const docRef = doc(db, 'chapters', '1');
        await setDoc(docRef, { membaca: finalContent }, { merge: true });

        toast({
          title: "Berhasil",
          description: "Konten Membaca berhasil diperbarui.",
        });
        router.push('/teacher/materi/bab-1/membaca');
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
          <TeacherHeader title="Edit Konten Membaca" description="Ubah konten teks dan pertanyaan untuk bagian Membaca." />
          <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
              <Skeleton className="h-10 w-40 mb-4" />
              <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-6"><Skeleton className="h-96 w-full" /></CardContent></Card>
            </div>
          </main>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader title="Edit Konten Membaca" description="Ubah konten teks dan pertanyaan untuk bagian Membaca." />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Button asChild variant="outline">
                <Link href="/teacher/materi/bab-1/membaca">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Pratinjau
                </Link>
              </Button>
            </div>
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader><CardTitle>Formulir Konten Membaca</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="learningObjective">Tujuan Pembelajaran</Label>
                    <Textarea id="learningObjective" value={content.learningObjective} onChange={(e) => setContent({...content, learningObjective: e.target.value})} rows={3} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="text">Isi Teks Deskripsi</Label>
                    <Textarea id="text" value={content.text} onChange={(e) => setContent({...content, text: e.target.value})} placeholder="Tulis atau salin tempel teks deskripsi di sini..." rows={15} />
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Daftar Pertanyaan Pemahaman</Label>
                    {content.questions.map((question, index) => (
                      <Card key={index} className="p-4 bg-slate-50">
                        <div className="flex justify-between items-start">
                           <Label>Pertanyaan #{index + 1}</Label>
                           <Button type="button" variant="destructive" size="icon" onClick={() => removeQuestion(index)} className="w-8 h-8"><Trash2 className="h-4 w-4" /><span className="sr-only">Hapus</span></Button>
                        </div>
                        <Textarea value={question} onChange={(e) => handleQuestionChange(index, e.target.value)} placeholder={`Isi pertanyaan...`} className="mt-2" rows={2}/>
                      </Card>
                    ))}
                    <Button type="button" variant="outline" onClick={addQuestion}><PlusCircle className="mr-2 h-4 w-4" />Tambah Pertanyaan</Button>
                  </div>
                  <Separator />
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
