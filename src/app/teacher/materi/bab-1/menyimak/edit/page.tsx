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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

type Statement = {
  no: number;
  statement: string;
  answer: 'benar' | 'salah';
  points: number;
  evidencePoints: number;
};

type LatihanStatement = {
    statement: string;
}

type MenyimakContent = {
  learningObjective: string;
  youtubeUrl: string;
  statements: Statement[];
  activity2Questions: string[];
  comparisonVideoUrl: string;
  latihan: {
    youtubeUrl: string;
    statements: LatihanStatement[];
  }
};

const defaultContent: MenyimakContent = {
  learningObjective: "Mengevaluasi gagasan dan pandangan berdasarkan kaidah logika berpikir dari menyimak teks deskripsi.",
  youtubeUrl: "https://youtu.be/waYM6QorBxw?si=NWLa7VRmk9QOYDxF",
  statements: [
    { no: 1, statement: "Teks tersebut secara umum mendeskripsikan Candi Borobudur...", answer: 'benar', points: 10, evidencePoints: 10 },
  ],
  activity2Questions: [
      "Seandainya kalian belum pernah secara langsung berkunjung ke Candi Borobudur, dapatkah kalian seolah-olah mengindra (melihat, mendengar, merasakan) Candi Borobudur setelah menyimak teks tersebut?",
      "Apa yang menarik dari penggambaran objek Candi Borobudur setelah menyimak teks tersebut?",
      "Mengapa narator mendeskripsikan Candi Borobudur itu mulai dari tingkat bawah sampai ke tingkat paling atas candi?",
      "Apakah narator berhasil menggambarkan secara rinci objek sehingga pembaca seakan-akan melihat, mendengar, atau merasakan objek yang dideskripsikan? Tunjukkan buktinya."
  ],
  comparisonVideoUrl: "https://www.youtube.com/embed/u1yo-uJDsU4",
  latihan: {
    youtubeUrl: "https://www.youtube.com/embed/nVLkAFx519M",
    statements: [
        { statement: "Teks tersebut secara umum mendeskripsikan Danau Toba. Kemudian, narator mendeskripsikan bagian-bagiannya yang terkait dengan Danau Toba." },
        { statement: "Dalam mendeskripsikan Danau Toba dan bagian-bagiannya, narator menyampaikannya dengan menggunakan pengindraan (melihat, mendengar, merasa) sehingga seolah-olah penyimak dapat mengindra objek-objek tersebut." },
        { statement: "Narator mendeskripsikan Danau Toba dengan kesan agar penyimak tertarik sehingga ingin mengunjungi objek tersebut." },
        { statement: "Narator mendeskripsikan Danau Toba dengan cukup detail sehingga penyimak merasa mendapatkan gambaran Danau Toba secara lengkap." },
        { statement: "Narator mendeskripsikan Danau Toba secara sistematis sehingga penyimak mudah memahaminya." }
    ]
  }
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
        let currentContent = docSnap.exists() ? docSnap.data().menyimak : null;

        if (!currentContent) {
            await setDoc(docRef, { menyimak: defaultContent }, { merge: true });
            setContent(defaultContent);
        } else {
            const contentToSet = { ...defaultContent, ...currentContent };
             if (
                !currentContent.activity2Questions ||
                !currentContent.comparisonVideoUrl ||
                !currentContent.latihan
            ) {
                await setDoc(docRef, { menyimak: contentToSet }, { merge: true });
            }
            setContent(contentToSet);
        }
      } catch (error) {
        console.error("Failed to fetch content:", error);
        toast({
          variant: "destructive",
          title: "Gagal Memuat Konten",
          description: "Tidak dapat mengambil data dari server."
        });
        setContent(defaultContent);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [toast]);

  const handleStatementChange = (index: number, field: keyof Statement, value: string | number) => {
    if (!content) return;
    const newStatements = [...content.statements];
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
    setContent({ ...content, statements: newStatements });
  };
  
  const addStatement = () => {
    if (!content) return;
    const newStatement: Statement = {
      no: content.statements.length + 1,
      statement: '',
      answer: 'benar',
      points: 10,
      evidencePoints: 10
    };
    const newStatements = [...content.statements, newStatement];
    const renumberedStatements = newStatements.map((stmt, index) => ({ ...stmt, no: index + 1 }));
    setContent({ ...content, statements: renumberedStatements });
  };

  const removeStatement = (index: number) => {
    if (!content) return;
    const newStatements = content.statements.filter((_, i) => i !== index);
    const renumberedStatements = newStatements.map((stmt, index) => ({ ...stmt, no: index + 1 }));
    setContent({ ...content, statements: renumberedStatements });
  };

  const handleLatihanStatementChange = (index: number, value: string) => {
    if (!content) return;
    const newStatements = [...content.latihan.statements];
    newStatements[index] = { statement: value };
    setContent({ ...content, latihan: { ...content.latihan, statements: newStatements } });
  };

  const addLatihanStatement = () => {
    if (!content) return;
    const newStatements = [...content.latihan.statements, { statement: '' }];
    setContent({ ...content, latihan: { ...content.latihan, statements: newStatements } });
  };

  const removeLatihanStatement = (index: number) => {
    if (!content) return;
    const newStatements = content.latihan.statements.filter((_, i) => i !== index);
    setContent({ ...content, latihan: { ...content.latihan, statements: newStatements } });
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content) return;

    const finalContent = {
        ...content,
        statements: content.statements.filter(s => s.statement.trim() !== ''),
        latihan: {
            ...content.latihan,
            statements: content.latihan.statements.filter(s => s.statement.trim() !== '')
        }
    };

    startTransition(async () => {
      try {
        const docRef = doc(db, 'chapters', '1');
        await setDoc(docRef, { menyimak: finalContent }, { merge: true });

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
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent className="space-y-6"><Skeleton className="h-96 w-full" /></CardContent>
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
          title="Edit Konten & Penilaian Menyimak"
          description="Ubah konten, kunci jawaban, dan skor untuk kegiatan menyimak."
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Button asChild variant="outline">
                <Link href="/teacher/materi/bab-1/menyimak">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Pratinjau
                </Link>
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kegiatan 1: Video & Pernyataan</CardTitle>
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
                    <Label htmlFor="youtubeUrl">Tautan Video YouTube (Kegiatan 1)</Label>
                    <Input
                      id="youtubeUrl"
                      name="youtubeUrl"
                      value={content.youtubeUrl}
                      onChange={(e) => setContent({...content, youtubeUrl: e.target.value})}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  
                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Daftar Pernyataan & Penilaian</Label>
                    {content.statements.map((statement, index) => (
                      <Card key={index} className="p-4 bg-slate-50">
                        <div className="flex justify-between items-start">
                           <Label className="text-base">Pernyataan #{index + 1}</Label>
                           <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeStatement(index)}
                              className="w-8 h-8"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Hapus Pernyataan</span>
                            </Button>
                        </div>
                        <Textarea
                          value={statement.statement}
                          onChange={(e) => handleStatementChange(index, 'statement', e.target.value)}
                          placeholder={`Isi pernyataan...`}
                          className="mt-2"
                          rows={3}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className='space-y-2'>
                                <Label>Kunci Jawaban</Label>
                                <Select 
                                 value={statement.answer}
                                 onValueChange={(value) => handleStatementChange(index, 'answer', value)}
                                >
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
                                <Input 
                                  type="number"
                                  value={statement.points}
                                  onChange={(e) => handleStatementChange(index, 'points', e.target.value)}
                                />
                            </div>
                             <div className='space-y-2'>
                                <Label>Poin Bukti</Label>
                                <Input 
                                  type="number"
                                  value={statement.evidencePoints}
                                  onChange={(e) => handleStatementChange(index, 'evidencePoints', e.target.value)}
                                />
                            </div>
                        </div>
                      </Card>
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
                </CardContent>
              </Card>

              <Card>
                 <CardHeader>
                  <CardTitle>Kegiatan 2: Analisis & Perbandingan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="activity2Questions">Pertanyaan Evaluasi Gagasan</Label>
                        <Textarea
                            id="activity2Questions"
                            value={(content.activity2Questions || []).join('\n')}
                            onChange={(e) => setContent({...content, activity2Questions: e.target.value.split('\n')})}
                            rows={8}
                            placeholder="Masukkan satu pertanyaan per baris..."
                        />
                         <p className="text-xs text-muted-foreground">Satu pertanyaan per baris.</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="comparisonVideoUrl">Tautan Video Perbandingan (Kegiatan 2)</Label>
                        <Input
                            id="comparisonVideoUrl"
                            value={content.comparisonVideoUrl}
                            onChange={(e) => setContent({...content, comparisonVideoUrl: e.target.value})}
                            placeholder="https://www.youtube.com/embed/..."
                        />
                    </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Latihan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="space-y-2">
                    <Label htmlFor="latihanYoutubeUrl">Tautan Video YouTube (Latihan)</Label>
                    <Input
                      id="latihanYoutubeUrl"
                      value={content.latihan.youtubeUrl}
                      onChange={(e) => setContent({...content, latihan: {...content.latihan, youtubeUrl: e.target.value}})}
                      placeholder="https://www.youtube.com/embed/..."
                    />
                  </div>
                  <Separator />
                   <div className="space-y-4">
                    <Label className="text-lg font-semibold">Daftar Pernyataan Latihan</Label>
                    {content.latihan.statements.map((statement, index) => (
                      <Card key={index} className="p-4 bg-slate-50">
                        <div className="flex justify-between items-start">
                           <Label className="text-base">Pernyataan #{index + 1}</Label>
                           <Button type="button" variant="destructive" size="icon" onClick={() => removeLatihanStatement(index)} className="w-8 h-8"><Trash2 className="h-4 w-4" /><span className="sr-only">Hapus</span></Button>
                        </div>
                        <Textarea value={statement.statement} onChange={(e) => handleLatihanStatementChange(index, e.target.value)} placeholder={`Isi pernyataan...`} className="mt-2" rows={2}/>
                      </Card>
                    ))}
                    <Button type="button" variant="outline" onClick={addLatihanStatement}><PlusCircle className="mr-2 h-4 w-4" />Tambah Pernyataan Latihan</Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-6">
                  <Button type="submit" disabled={isPending} size="lg" className="w-full">
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isPending ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                  </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
