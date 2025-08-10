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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ReadingStatement = {
  statement: string;
  answer: 'benar' | 'salah';
};

type ReadingContent = {
  learningObjective: string;
  mainText: string;
  statements: ReadingStatement[];
  feedbackText: string;
  infoBoxText: string;
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
            mainText: '',
            statements: [{ statement: '', answer: 'benar' }],
            feedbackText: '',
            infoBoxText: ''
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

  const handleStatementChange = (index: number, field: 'statement' | 'answer', value: string) => {
    if (!content) return;
    const newStatements = [...content.statements];
    newStatements[index][field] = value as any;
    setContent({ ...content, statements: newStatements });
  };
  
  const addStatement = () => {
    if (!content) return;
    setContent({ ...content, statements: [...content.statements, { statement: '', answer: 'benar' }] });
  };

  const removeStatement = (index: number) => {
    if (!content) return;
    const newStatements = content.statements.filter((_, i) => i !== index);
    setContent({ ...content, statements: newStatements });
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content) return;

    const finalContent = {
        ...content,
        statements: content.statements.filter(q => q.statement.trim() !== '')
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Konten Umum</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="learningObjective">Tujuan Pembelajaran</Label>
                    <Textarea id="learningObjective" value={content.learningObjective} onChange={(e) => setContent({...content, learningObjective: e.target.value})} rows={2} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="mainText">Teks Utama (Keunikan Adat Istiadat Suku Abuy)</Label>
                    <Textarea id="mainText" value={content.mainText} onChange={(e) => setContent({...content, mainText: e.target.value})} placeholder="Tulis atau salin tempel teks deskripsi di sini..." rows={20} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                  <CardHeader><CardTitle>Tugas: Pernyataan Benar/Salah</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Label className="text-base font-semibold">Daftar Pernyataan</Label>
                    {content.statements.map((stmt, index) => (
                      <Card key={index} className="p-4 bg-slate-50/50">
                        <div className="flex justify-between items-start gap-4">
                           <div className="flex-1 space-y-2">
                               <Label htmlFor={`stmt-text-${index}`}>Pernyataan #{index + 1}</Label>
                               <Textarea id={`stmt-text-${index}`} value={stmt.statement} onChange={(e) => handleStatementChange(index, 'statement', e.target.value)} placeholder={`Isi pernyataan...`} rows={2}/>
                           </div>
                           <div className="space-y-2">
                                <Label htmlFor={`stmt-answer-${index}`}>Kunci Jawaban</Label>
                                <Select value={stmt.answer} onValueChange={(value) => handleStatementChange(index, 'answer', value)}>
                                    <SelectTrigger id={`stmt-answer-${index}`}>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="benar">Benar</SelectItem>
                                        <SelectItem value="salah">Salah</SelectItem>
                                    </SelectContent>
                                </Select>
                           </div>
                           <Button type="button" variant="ghost" size="icon" onClick={() => removeStatement(index)} className="mt-7 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /><span className="sr-only">Hapus</span></Button>
                        </div>
                      </Card>
                    ))}
                    <Button type="button" variant="outline" onClick={addStatement}><PlusCircle className="mr-2 h-4 w-4" />Tambah Pernyataan</Button>
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader><CardTitle>Umpan Balik & Info Tambahan</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="feedbackText">Teks Umpan Balik & Pembahasan</Label>
                        <Textarea id="feedbackText" value={content.feedbackText} onChange={(e) => setContent({...content, feedbackText: e.target.value})} rows={10} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="infoBoxText">Teks untuk Kotak Info</Label>
                        <Textarea id="infoBoxText" value={content.infoBoxText} onChange={(e) => setContent({...content, infoBoxText: e.target.value})} rows={4} />
                    </div>
                  </CardContent>
              </Card>

              <Button type="submit" disabled={isPending} className="w-full" size="lg">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isPending ? 'Menyimpan...' : 'Simpan Semua Perubahan Materi Membaca'}
              </Button>
            </form>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
