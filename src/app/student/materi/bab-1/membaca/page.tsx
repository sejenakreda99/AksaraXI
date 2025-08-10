'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save, PlusCircle, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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

type ReadingAnswers = {
    [key: number]: {
        choice: 'benar' | 'salah' | '';
        evidence: string;
    }
}

export default function MembacaSiswaPage() {
  const [content, setContent] = useState<ReadingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [answers, setAnswers] = useState<ReadingAnswers>({});
  const chapterId = '1';

  useEffect(() => {
    async function fetchContent() {
      setLoading(true);
      try {
        const docRef = doc(db, 'chapters', chapterId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().membaca) {
          const fetchedContent = docSnap.data().membaca as ReadingContent;
          setContent(fetchedContent);
          // Initialize answers state
          const initialAnswers: ReadingAnswers = {};
          fetchedContent.statements.forEach((_, index) => {
              initialAnswers[index] = { choice: '', evidence: '' };
          });
          setAnswers(initialAnswers);
        } else {
          console.error("Content for 'membaca' not found!");
        }
      } catch (error) {
        console.error("Failed to fetch content:", error);
        toast({
          variant: "destructive",
          title: "Gagal Memuat Konten",
          description: "Materi untuk bagian ini belum tersedia."
        });
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [toast]);
  
  const handleAnswerChange = (index: number, type: 'choice' | 'evidence', value: string) => {
    setAnswers(prev => ({
        ...prev,
        [index]: {
            ...prev[index],
            [type]: value
        }
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "Anda harus masuk untuk mengirimkan jawaban." });
        return;
    }

    setIsSubmitting(true);
    try {
        const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_membaca`);
        
        await setDoc(submissionRef, {
            studentId: user.uid,
            chapterId: chapterId,
            activity: 'membaca',
            kegiatan1: { answers },
            lastSubmitted: serverTimestamp()
        }, { merge: true });
        
        toast({
            title: "Berhasil!",
            description: "Jawaban Anda telah berhasil disimpan.",
        });

    } catch (error) {
        console.error("Error submitting answers:", error);
        toast({
            variant: "destructive",
            title: "Gagal Menyimpan",
            description: "Terjadi kesalahan saat menyimpan jawaban Anda.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <header className="bg-card border-b p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <Button asChild variant="outline" size="sm" className="mb-4">
              <Link href={`/student/materi/${chapterId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Peta Petualangan
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground capitalize">B. Membaca Teks Deskripsi</h1>
            <p className="text-muted-foreground mt-1">
              Bab {chapterId}: Membicarakan Teks Deskripsi
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                 {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                 ) : content ? (
                    <div className="space-y-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>Tujuan Pembelajaran</CardTitle>
                                <CardDescription>{content.learningObjective}</CardDescription>
                            </CardHeader>
                        </Card>

                        <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="item-1">
                            <Card>
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="p-6 text-lg font-semibold text-left">Langkah 1: Baca Teks Deskripsi</AccordionTrigger>
                                    <AccordionContent className="p-6 pt-0">
                                        <div className="prose max-w-none prose-sm sm:prose-base whitespace-pre-wrap text-foreground">
                                            <h3 className="font-bold text-center mb-4">Keunikan Adat Istiadat Suku Abuy di Kampung Takpala Alor</h3>
                                            {content.mainText}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>
                            <Card>
                                 <AccordionItem value="item-2">
                                    <AccordionTrigger className="p-6 text-lg font-semibold text-left">Langkah 2: Kerjakan Tugas</AccordionTrigger>
                                    <AccordionContent className="p-6 pt-0">
                                        <p className="mb-4 text-sm ">Setelah kalian menyimak teks tersebut, centanglah pernyataan benar atau salah dalam Tabel 1.3. Lalu, berikan bukti informasi yang mendukung analisis kalian.</p>
                                        <div className="space-y-6">
                                            {content.statements.map((stmt, index) => (
                                                 <div key={index} className="border p-4 rounded-lg bg-slate-50/50">
                                                    <p className="font-semibold">Pernyataan #{index+1}</p>
                                                    <p className="mt-1 text-sm">{stmt.statement}</p>
                                                    <div className="mt-4 space-y-4">
                                                        <div>
                                                        <Label className="font-medium">Tentukan jawaban Anda:</Label>
                                                        <RadioGroup className="flex gap-4 mt-2" onValueChange={(value) => handleAnswerChange(index, 'choice', value)} value={answers[index]?.choice}>
                                                            <div className="flex items-center space-x-2"><RadioGroupItem value="benar" id={`r-${index}-benar`} /><Label htmlFor={`r-${index}-benar`}>Benar</Label></div>
                                                            <div className="flex items-center space-x-2"><RadioGroupItem value="salah" id={`r-${index}-salah`} /><Label htmlFor={`r-${index}-salah`}>Salah</Label></div>
                                                        </RadioGroup>
                                                        </div>
                                                        <div>
                                                        <Label htmlFor={`evidence-${index}`} className="font-medium">Tuliskan bukti informasinya:</Label>
                                                        <Textarea id={`evidence-${index}`} className="mt-2 bg-white" placeholder="Tuliskan bukti pendukung dari teks di sini..." rows={4} onChange={(e) => handleAnswerChange(index, 'evidence', e.target.value)} value={answers[index]?.evidence} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>
                             <Card>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger className="p-6 text-lg font-semibold text-left">Langkah 3: Umpan Balik & Pembahasan</AccordionTrigger>
                                    <AccordionContent className="p-6 pt-0">
                                         <div className="prose max-w-none prose-sm sm:prose-base whitespace-pre-wrap text-foreground">{content.feedbackText}</div>
                                         <Separator className="my-6" />
                                          <Card className="bg-primary/10 border-primary">
                                              <CardHeader><CardTitle className="text-primary text-base">Info</CardTitle></CardHeader>
                                              <CardContent className="text-primary/90 text-sm whitespace-pre-wrap">
                                                  {content.infoBoxText}
                                              </CardContent>
                                          </Card>
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>
                        </Accordion>
                        <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isSubmitting ? 'Mengirim...' : `Simpan & Kirim Jawaban`}
                        </Button>
                    </div>
                 ) : (
                    <Card><CardHeader><CardTitle>Konten Tidak Tersedia</CardTitle></CardHeader><CardContent><p>Materi untuk bagian ini belum disiapkan oleh guru.</p></CardContent></Card>
                 )}
            </form>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
