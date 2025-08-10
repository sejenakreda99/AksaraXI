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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ReadingStatement = {
  statement: string;
  answer: 'benar' | 'salah';
  points: number;
  evidencePoints: number;
};

type LatihanStatement = {
  statement: string;
  answer: 'benar' | 'salah';
  points: number;
  evidencePoints: number;
}

type ReadingContent = {
  learningObjective: string;
  // Kegiatan 1
  kegiatan1MainText: string;
  kegiatan1Statements: ReadingStatement[];
  kegiatan1FeedbackText: string;
  kegiatan1InfoBoxText: string;
  // Kegiatan 2 & Latihan
  kegiatan2Intro: string;
  latihanIntro: string;
  latihanMainText: string;
  latihanStatements: LatihanStatement[];
};

const defaultContent: ReadingContent = {
    learningObjective: "Mengevaluasi gagasan dan pandangan berdasarkan kaidah logika berpikir dari membaca teks deskripsi.",
    // Kegiatan 1
    kegiatan1MainText: `TEMPO.CO, Jakarta - ...`,
    kegiatan1Statements: [{ statement: '', answer: 'benar', points: 10, evidencePoints: 10 }],
    kegiatan1FeedbackText: '',
    kegiatan1InfoBoxText: '',
    // Kegiatan 2
    kegiatan2Intro: '',
    latihanIntro: '',
    latihanMainText: '',
    latihanStatements: [{ statement: '', answer: 'benar', points: 10, evidencePoints: 10 }],
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
          const fetchedData = docSnap.data().membaca;
           // Ensure all fields from defaultContent exist
          const mergedContent = { ...defaultContent, ...fetchedData };
          setContent(mergedContent);
        } else {
          setContent(defaultContent);
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

  const handleStatementChange = (index: number, field: keyof ReadingStatement, value: string | number, type: 'kegiatan1' | 'latihan') => {
    if (!content) return;

    let newStatements;
    if (type === 'kegiatan1') {
      newStatements = [...content.kegiatan1Statements];
    } else {
      newStatements = [...content.latihanStatements];
    }

    const statementToUpdate = { ...newStatements[index] };
  
    if (field === 'statement') {
      statementToUpdate.statement = value as string;
    } else if (field === 'answer') {
      statementToUpdate.answer = value as 'benar' | 'salah';
    } else if (field === 'points' || field === 'evidencePoints') {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        statementToUpdate[field] = numValue;
      }
    }
    
    newStatements[index] = statementToUpdate;
    if (type === 'kegiatan1') {
       setContent({ ...content, kegiatan1Statements: newStatements as ReadingStatement[] });
    } else {
       setContent({ ...content, latihanStatements: newStatements as LatihanStatement[] });
    }
  };
  
  const addStatement = (type: 'kegiatan1' | 'latihan') => {
    if (!content) return;
    const newStatement = { statement: '', answer: 'benar' as 'benar' | 'salah', points: 10, evidencePoints: 10 };
     if (type === 'kegiatan1') {
        setContent({ ...content, kegiatan1Statements: [...content.kegiatan1Statements, newStatement] });
    } else {
        setContent({ ...content, latihanStatements: [...content.latihanStatements, newStatement] });
    }
  };

  const removeStatement = (index: number, type: 'kegiatan1' | 'latihan') => {
    if (!content) return;
     if (type === 'kegiatan1') {
        const newStatements = content.kegiatan1Statements.filter((_, i) => i !== index);
        setContent({ ...content, kegiatan1Statements: newStatements });
    } else {
        const newStatements = content.latihanStatements.filter((_, i) => i !== index);
        setContent({ ...content, latihanStatements: newStatements });
    }
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content) return;

    const finalContent: ReadingContent = {
        ...content,
        kegiatan1Statements: content.kegiatan1Statements.filter(q => q.statement.trim() !== ''),
        latihanStatements: content.latihanStatements.filter(q => q.statement.trim() !== ''),
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
                </CardContent>
              </Card>

              <Card>
                  <CardHeader><CardTitle>Kegiatan 1: Menganalisis Teks Deskripsi (Suku Abuy)</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="kegiatan1MainText">Teks Utama</Label>
                      <Textarea id="kegiatan1MainText" value={content.kegiatan1MainText} onChange={(e) => setContent({...content, kegiatan1MainText: e.target.value})} placeholder="Tulis atau salin tempel teks deskripsi di sini..." rows={15} />
                    </div>
                    <Label className="text-base font-semibold">Tugas: Pernyataan Benar/Salah</Label>
                    {content.kegiatan1Statements.map((stmt, index) => (
                      <Card key={index} className="p-4 bg-slate-50/50">
                        <div className="flex justify-between items-start gap-4">
                           <div className="flex-1 space-y-2">
                               <Label htmlFor={`stmt-text-${index}`}>Pernyataan #{index + 1}</Label>
                               <Textarea id={`stmt-text-${index}`} value={stmt.statement} onChange={(e) => handleStatementChange(index, 'statement', e.target.value, 'kegiatan1')} placeholder={`Isi pernyataan...`} rows={2}/>
                           </div>
                           <Button type="button" variant="ghost" size="icon" onClick={() => removeStatement(index, 'kegiatan1')} className="mt-7 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /><span className="sr-only">Hapus</span></Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className='space-y-2'>
                                <Label>Kunci Jawaban</Label>
                                <Select value={stmt.answer} onValueChange={(value) => handleStatementChange(index, 'answer', value, 'kegiatan1')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih jawaban"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="benar">Benar</SelectItem>
                                        <SelectItem value="salah">Salah</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className='space-y-2'>
                                <Label>Poin Jawaban</Label>
                                <Input type="number" value={stmt.points || ''} onChange={(e) => handleStatementChange(index, 'points', e.target.value, 'kegiatan1')} />
                            </div>
                             <div className='space-y-2'>
                                <Label>Poin Bukti</Label>
                                <Input type="number" value={stmt.evidencePoints || ''} onChange={(e) => handleStatementChange(index, 'evidencePoints', e.target.value, 'kegiatan1')} />
                            </div>
                        </div>
                      </Card>
                    ))}
                    <Button type="button" variant="outline" onClick={() => addStatement('kegiatan1')}><PlusCircle className="mr-2 h-4 w-4" />Tambah Pernyataan</Button>
                    <div className="space-y-2">
                        <Label htmlFor="kegiatan1FeedbackText">Teks Umpan Balik & Pembahasan</Label>
                        <Textarea id="kegiatan1FeedbackText" value={content.kegiatan1FeedbackText} onChange={(e) => setContent({...content, kegiatan1FeedbackText: e.target.value})} rows={10} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="kegiatan1InfoBoxText">Teks untuk Kotak Info</Label>
                        <Textarea id="kegiatan1InfoBoxText" value={content.kegiatan1InfoBoxText} onChange={(e) => setContent({...content, kegiatan1InfoBoxText: e.target.value})} rows={4} />
                    </div>
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader><CardTitle>Kegiatan 2 & Latihan (Bandara Manado)</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="kegiatan2Intro">Pengantar Kegiatan 2</Label>
                        <Textarea id="kegiatan2Intro" value={content.kegiatan2Intro} onChange={(e) => setContent({...content, kegiatan2Intro: e.target.value})} rows={4} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="latihanIntro">Pengantar Latihan</Label>
                        <Textarea id="latihanIntro" value={content.latihanIntro} onChange={(e) => setContent({...content, latihanIntro: e.target.value})} rows={4} />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="latihanMainText">Teks Utama Latihan</Label>
                      <Textarea id="latihanMainText" value={content.latihanMainText} onChange={(e) => setContent({...content, latihanMainText: e.target.value})} placeholder="Tulis atau salin tempel teks deskripsi di sini..." rows={15} />
                    </div>

                    <Label className="text-base font-semibold">Tugas: Tabel Identifikasi</Label>
                     {content.latihanStatements.map((stmt, index) => (
                      <Card key={index} className="p-4 bg-slate-50/50">
                        <div className="flex justify-between items-start gap-4">
                           <div className="flex-1 space-y-2">
                               <Label htmlFor={`latihan-stmt-text-${index}`}>Ciri-Ciri Teks Deskripsi #{index + 1}</Label>
                               <Textarea id={`latihan-stmt-text-${index}`} value={stmt.statement} onChange={(e) => handleStatementChange(index, 'statement', e.target.value, 'latihan')} placeholder={`Isi ciri-ciri...`} rows={2}/>
                           </div>
                           <Button type="button" variant="ghost" size="icon" onClick={() => removeStatement(index, 'latihan')} className="mt-7 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /><span className="sr-only">Hapus</span></Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className='space-y-2'>
                                <Label>Kunci Jawaban</Label>
                                <Select value={stmt.answer} onValueChange={(value) => handleStatementChange(index, 'answer', value, 'latihan')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih jawaban"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="benar">Benar</SelectItem>
                                        <SelectItem value="salah">Salah</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className='space-y-2'>
                                <Label>Poin Jawaban</Label>
                                <Input type="number" value={stmt.points || ''} onChange={(e) => handleStatementChange(index, 'points', e.target.value, 'latihan')} />
                            </div>
                             <div className='space-y-2'>
                                <Label>Poin Bukti</Label>
                                <Input type="number" value={stmt.evidencePoints || ''} onChange={(e) => handleStatementChange(index, 'evidencePoints', e.target.value, 'latihan')} />
                            </div>
                        </div>
                      </Card>
                    ))}
                    <Button type="button" variant="outline" onClick={() => addStatement('latihan')}><PlusCircle className="mr-2 h-4 w-4" />Tambah Ciri</Button>
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
