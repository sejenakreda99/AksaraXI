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
          setContent({
            learningObjective: '',
            youtubeUrl: '',
            statements: [{ no: 1, statement: '', answer: 'benar', points: 10, evidencePoints: 10 }]
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
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content) return;

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
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Formulir Konten Menyimak</CardTitle>
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
