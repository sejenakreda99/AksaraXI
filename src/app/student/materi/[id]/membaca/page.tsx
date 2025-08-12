
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save, CheckCircle, Check, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuthState } from 'react-firebase-hooks/auth';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


type ReadingStatement = {
  statement: string;
  answer: 'benar' | 'salah';
};

type LatihanStatement = {
  statement: string;
  answer: 'benar' | 'salah';
}

type ReadingContent = {
  learningObjective: string;
  kegiatan1MainText: string;
  kegiatan1Statements: ReadingStatement[];
  kegiatan1FeedbackText: string;
  kegiatan1InfoBoxText: string;
  kegiatan2Intro: string;
  latihanIntro: string;
  latihanMainText: string;
  latihanStatements: LatihanStatement[];
};

type ReadingAnswers = {
    kegiatan1: {
        [key: number]: {
            choice: 'benar' | 'salah' | '';
            evidence: string;
        }
    },
    latihan: {
        [key: number]: {
            choice: 'benar' | 'salah' | '';
            evidence: string;
        }
    },
    simpulan: string;
}

export default function MembacaSiswaPage() {
  const params = useParams();
  const chapterId = params.id as string;
  const [content, setContent] = useState<ReadingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [answers, setAnswers] = useState<ReadingAnswers>({kegiatan1: {}, latihan: {}, simpulan: ''});
  const [isCompleted, setIsCompleted] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);

  useEffect(() => {
    if (!user || !chapterId) return;

    async function fetchInitialData() {
        setLoading(true);
        try {
            const contentRef = doc(db, 'chapters', chapterId);
            const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_membaca`);

            const [contentSnap, submissionSnap] = await Promise.all([
                getDoc(contentRef),
                getDoc(submissionRef)
            ]);

            if (contentSnap.exists() && contentSnap.data().membaca) {
                setContent(contentSnap.data().membaca);
            }

            if (submissionSnap.exists()) {
                const submissionData = submissionSnap.data();
                setExistingSubmission(submissionData);
                setAnswers(submissionData.answers);
                setIsCompleted(true);
            }

        } catch (error) {
            console.error("Failed to fetch initial data:", error);
            toast({
                variant: "destructive",
                title: "Gagal Memuat Data",
                description: "Tidak dapat memuat konten atau progres Anda."
            });
        } finally {
            setLoading(false);
        }
    }
    fetchInitialData();
  }, [chapterId, user]);
  
  const handleAnswerChange = (kegiatan: 'kegiatan1' | 'latihan', index: number, type: 'choice' | 'evidence', value: string) => {
    setAnswers(prev => ({
        ...prev,
        [kegiatan]: {
            ...prev[kegiatan],
            [index]: {
                ...prev[kegiatan]?.[index],
                [type]: value
            }
        }
    }));
  };

  const handleSimpulanChange = (value: string) => {
      setAnswers(prev => ({...prev, simpulan: value}));
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "Anda harus masuk untuk mengirimkan jawaban." });
        return;
    }

    setIsSubmitting(true);
    try {
        const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_membaca`);
        
        const dataToSave = {
            studentId: user.uid,
            chapterId: chapterId,
            activity: 'membaca',
            answers,
            lastSubmitted: serverTimestamp(),
            ...(existingSubmission?.scores && { scores: existingSubmission.scores })
        };
        
        await setDoc(submissionRef, dataToSave, { merge: true });
        
        toast({
            title: "Berhasil!",
            description: "Jawaban Anda telah berhasil disimpan.",
        });
        setIsCompleted(true);

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
        <header className="bg-card border-b p-4 sm:p-6">
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

        <main className="flex-1 p-4 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                 
                {isCompleted && (
                    <Card className="bg-green-50 border-green-200">
                        <CardHeader className="flex-row items-center gap-4 space-y-0">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div>
                                <CardTitle className="text-green-800">Tugas Telah Dikumpulkan</CardTitle>
                                <CardDescription className="text-green-700">Anda dapat meninjau kembali materi atau memperbarui jawaban Anda jika perlu.</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                )}
                 
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-96 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                ) : content ? (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Tujuan Pembelajaran</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-base text-justify">{content.learningObjective}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Kegiatan 1: Menganalisis Teks Deskripsi (Suku Abuy)</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className="prose max-w-none prose-sm:prose-base whitespace-pre-wrap text-foreground text-justify">
                                    <h3 className="font-bold text-center mb-4">Keunikan Adat Istiadat Suku Abuy di Kampung Takpala Alor</h3>
                                    {content.kegiatan1MainText}
                                </div>
                                <Card className="bg-slate-50 border-slate-200">
                                    <CardHeader>
                                        <CardTitle>Tugas</CardTitle>
                                        <CardDescription className="text-justify">Setelah kalian menyimak teks tersebut, centanglah pernyataan benar atau salah dalam Tabel 1.3. Lalu, berikan bukti informasi yang mendukung analisis kalian.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {content.kegiatan1Statements.map((stmt, index) => (
                                            <div key={index} className="border p-4 rounded-lg bg-white">
                                                <p className="font-semibold text-justify">Pernyataan #{index+1}</p>
                                                <p className="mt-1 text-sm text-justify">{stmt.statement}</p>
                                                <div className="mt-4 space-y-4">
                                                    <div>
                                                    <Label className="font-medium">Tentukan jawaban Anda:</Label>
                                                    <RadioGroup className="flex gap-4 mt-2" onValueChange={(value) => handleAnswerChange('kegiatan1', index, 'choice', value)} value={answers?.kegiatan1?.[index]?.choice || ''}>
                                                        <div className="flex items-center space-x-2"><RadioGroupItem value="benar" id={`r-${index}-benar`} /><Label htmlFor={`r-${index}-benar`}>Benar</Label></div>
                                                        <div className="flex items-center space-x-2"><RadioGroupItem value="salah" id={`r-${index}-salah`} /><Label htmlFor={`r-${index}-salah`}>Salah</Label></div>
                                                    </RadioGroup>
                                                    </div>
                                                    <div>
                                                    <Label htmlFor={`evidence-${index}`} className="font-medium">Tuliskan bukti informasinya:</Label>
                                                    <Textarea id={`evidence-${index}`} className="mt-2 bg-white" placeholder="Tuliskan bukti pendukung dari teks di sini..." rows={4} onChange={(e) => handleAnswerChange('kegiatan1', index, 'evidence', e.target.value)} value={answers?.kegiatan1?.[index]?.evidence || ''} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <Separator/>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Umpan Balik & Pembahasan</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose max-w-none prose-sm:prose-base whitespace-pre-wrap text-foreground text-justify">{content.kegiatan1FeedbackText}</div>
                                        <Separator className="my-6" />
                                        <Card className="bg-primary/10 border-primary">
                                            <CardHeader><CardTitle className="text-primary text-base">Info</CardTitle></CardHeader>
                                            <CardContent className="text-primary/90 text-sm whitespace-pre-wrap text-justify">
                                                {content.kegiatan1InfoBoxText}
                                            </CardContent>
                                        </Card>
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Kegiatan 2 & Latihan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="prose max-w-none prose-sm:prose-base whitespace-pre-wrap text-foreground space-y-4 text-justify">
                                    <div className="p-4 bg-slate-50 rounded-lg border">
                                        <h4 className="font-bold not-prose">Kegiatan 2: Mengevaluasi gagasan dan pandangan</h4>
                                        <p>{content.kegiatan2Intro}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg border">
                                        <h4 className="font-bold not-prose">Latihan</h4>
                                        <p>{content.latihanIntro}</p>
                                    </div>
                                    <Separator/>
                                    <h3 className="font-bold text-center mb-4">Terminal Baru Bandara Sam Ratulangi Manado, Perpaduan Konsep Tradisional dan Modern</h3>
                                    {content.latihanMainText}
                                </div>
                                
                                <Card className="bg-slate-50 border-slate-200">
                                    <CardHeader>
                                        <CardTitle>Latihan: Identifikasi Ciri Teks Deskripsi</CardTitle>
                                        <CardDescription className="text-justify">Untuk memudahkan kalian membuktikan teks tersebut termasuk teks deskripsi atau bukan, gunakanlah Tabel 1.4. Centanglah pernyataan benar atau salah. Lalu, berikan buktikan informasi yang mendukung analisis kalian.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Ciri-Ciri Teks Deskripsi</TableHead>
                                                    <TableHead className="w-[150px] text-center">Benar / Salah</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {content.latihanStatements.map((stmt, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <p className="font-semibold text-justify">{stmt.statement}</p>
                                                            <Label htmlFor={`latihan-evidence-${index}`} className="font-medium mt-4 block">Bukti Informasi:</Label>
                                                            <Textarea id={`latihan-evidence-${index}`} className="mt-2 bg-white" placeholder="Tuliskan bukti pendukung dari teks di sini..." rows={4} onChange={(e) => handleAnswerChange('latihan', index, 'evidence', e.target.value)} value={answers?.latihan?.[index]?.evidence || ''} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <RadioGroup className="flex flex-col gap-4 mt-2 items-center" onValueChange={(value) => handleAnswerChange('latihan', index, 'choice', value)} value={answers?.latihan?.[index]?.choice || ''}>
                                                                <div className="flex items-center space-x-2"><RadioGroupItem value="benar" id={`l-r-${index}-benar`} /><Label htmlFor={`l-r-${index}-benar`}>Benar</Label></div>
                                                                <div className="flex items-center space-x-2"><RadioGroupItem value="salah" id={`l-r-${index}-salah`} /><Label htmlFor={`l-r-${index}-salah`}>Salah</Label></div>
                                                            </RadioGroup>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Simpulan</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Label htmlFor="simpulan" className="text-justify">Berdasarkan hasil analisis ciri-ciri teks deskripsi, maka teks berjudul “Terminal Baru Bandara Sam Ratulangi Manado, Perpaduan Konsep Tradisional dan Modern” ...</Label>
                                        <Textarea id="simpulan" className="mt-2" placeholder="termasuk/tidak termasuk teks deskripsi karena..." rows={6} value={answers?.simpulan || ''} onChange={(e) => handleSimpulanChange(e.target.value)} />
                                        <Separator className="my-6" />
                                        <p className="text-sm text-muted-foreground text-justify">Sampaikan secara lisan hasil analisis kalian di depan kelas. Buka kesempatan tanya jawab sehingga teman kalian yang menyimak memberikan tanggapan. Kalian yang mendapatkan giliran menyampaikan hasil analisis, kemudian menjawab tanggapan tersebut.</p>
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card><CardContent className="p-6 text-center text-muted-foreground">Konten untuk bagian ini belum disiapkan oleh guru.</CardContent></Card>
                )}

                <Button type="submit" onClick={e => handleSubmit(e as any)} disabled={isSubmitting || loading} className="w-full" size="lg">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSubmitting ? 'Menyimpan...' : 'Simpan & Kirim Jawaban'}
                </Button>
            </form>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
