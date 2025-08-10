
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, Save, CheckCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuthState } from 'react-firebase-hooks/auth';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';


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

const steps = [
    { id: 'tujuan', title: 'Tujuan Pembelajaran' },
    { id: 'baca', title: 'Baca Teks' },
    { id: 'tugas', title: 'Kerjakan Tugas' },
    { id: 'umpan-balik', title: 'Umpan Balik' },
];

export default function MembacaSiswaPage() {
  const params = useParams();
  const chapterId = params.id as string;
  const [content, setContent] = useState<ReadingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [answers, setAnswers] = useState<ReadingAnswers>({});
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    async function fetchContent() {
      if (!chapterId) return;
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
  }, [chapterId, toast]);
  
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
        setCurrentStep(steps.length); // Move to completion view

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

  const progressPercentage = useMemo(() => {
    if (currentStep >= steps.length) return 100;
    return ((currentStep + 1) / steps.length) * 100;
  }, [currentStep]);


  const renderStepContent = () => {
    if (loading) {
         return (
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!content) {
         return <Card><CardHeader><CardTitle>Konten Tidak Tersedia</CardTitle></CardHeader><CardContent><p>Materi untuk bagian ini belum disiapkan oleh guru.</p></CardContent></Card>;
    }

    if (currentStep >= steps.length) {
        return (
             <Card className="text-center p-8">
                <CardHeader>
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <CardTitle className="text-2xl">Kegiatan Selesai!</CardTitle>
                    <CardDescription>Anda telah menyelesaikan kegiatan Membaca Teks Deskripsi. Jawaban Anda sudah disimpan. Anda dapat kembali ke Peta Petualangan.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild>
                      <Link href={`/student/materi/${chapterId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Peta Petualangan
                      </Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }
    
    switch (steps[currentStep].id) {
        case 'tujuan':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Tujuan Pembelajaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-base">{content.learningObjective}</CardDescription>
                    </CardContent>
                </Card>
            )
        case 'baca':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Langkah 1: Baca Teks Deskripsi</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none prose-sm:prose-base whitespace-pre-wrap text-foreground">
                        <h3 className="font-bold text-center mb-4">Keunikan Adat Istiadat Suku Abuy di Kampung Takpala Alor</h3>
                        {content.mainText}
                    </CardContent>
                </Card>
            )
        case 'tugas':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Langkah 2: Kerjakan Tugas</CardTitle>
                        <CardDescription>Setelah kalian menyimak teks tersebut, centanglah pernyataan benar atau salah dalam Tabel 1.3. Lalu, berikan bukti informasi yang mendukung analisis kalian.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                    </CardContent>
                </Card>
            )
        case 'umpan-balik':
             return (
                <Card>
                    <CardHeader>
                        <CardTitle>Langkah 3: Umpan Balik & Pembahasan</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="prose max-w-none prose-sm:prose-base whitespace-pre-wrap text-foreground">{content.feedbackText}</div>
                         <Separator className="my-6" />
                          <Card className="bg-primary/10 border-primary">
                              <CardHeader><CardTitle className="text-primary text-base">Info</CardTitle></CardHeader>
                              <CardContent className="text-primary/90 text-sm whitespace-pre-wrap">
                                  {content.infoBoxText}
                              </CardContent>
                          </Card>
                    </CardContent>
                </Card>
            )
        default:
            return null;
    }
  }


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
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                 
                 {/* Progress Indicator */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium text-muted-foreground">
                        <span>Langkah {currentStep + 1} dari {steps.length}</span>
                        <span>{steps[currentStep]?.title}</span>
                    </div>
                    <Progress value={progressPercentage} className="w-full" />
                </div>
                 
                <div>
                  {renderStepContent()}
                </div>
                 
                {/* Navigation Buttons */}
                 {currentStep < steps.length && (
                     <div className="flex justify-between items-center">
                         <Button type="button" variant="outline" onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 0}>
                            <ArrowLeft className="mr-2 h-4 w-4"/>
                            Kembali
                         </Button>

                         {currentStep < steps.length - 1 ? (
                              <Button type="button" onClick={() => setCurrentStep(s => s + 1)}>
                                Lanjut
                                <ArrowRight className="ml-2 h-4 w-4"/>
                              </Button>
                         ): (
                             <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {isSubmitting ? 'Mengirim...' : 'Selesai & Kirim Jawaban'}
                            </Button>
                         )}
                     </div>
                 )}
            </form>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}

    