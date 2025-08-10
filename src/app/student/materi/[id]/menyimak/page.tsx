
'use client';

import { useEffect, useState, useMemo } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Youtube, ArrowLeft, Loader2, Send, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Separator } from '@/components/ui/separator';
import { useParams } from 'next/navigation';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';


// --- Type Definitions ---
type Statement = {
  no: number;
  statement: string;
  answer: 'benar' | 'salah';
  points: number;
  evidencePoints: number;
};

type LatihanStatement = {
    statement: string;
    answer: 'benar' | 'salah';
    points: number;
    analysisPoints: number;
}

type MenyimakContentData = {
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

type MenyimakAnswers = {
    kegiatan1: Record<string, { choice: 'benar' | 'salah' | ''; evidence: string }>;
    kegiatan2: Record<string, string>;
    latihan: Record<string, { choice: 'benar' | 'salah' | ''; analysis: string }>;
}

// --- Helper ---
function getYoutubeEmbedUrl(url: string) {
    if (!url) return '';
    if (url.includes('embed')) return url;
    try {
        const videoUrl = new URL(url);
        let videoId = videoUrl.searchParams.get('v');
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (videoUrl.hostname === 'youtu.be') {
            const shortId = videoUrl.pathname.slice(1);
            if (shortId) {
                return `https://www.youtube.com/embed/${shortId.split('?')[0]}`;
            }
        }
        const pathSegments = videoUrl.pathname.split('/');
        const shortId = pathSegments[pathSegments.length - 1];
        if (shortId && !shortId.includes('.be')) {
            return `https://www.youtube.com/embed/${shortId.split('?')[0]}`;
        }
    } catch (error) {
        console.error('Invalid YouTube URL', error);
        return url;
    }
    return url;
}


const steps = [
    { id: 'tujuan', title: 'Tujuan Pembelajaran' },
    { id: 'kegiatan1-tugas', title: 'Kegiatan 1: Video & Tugas' },
    { id: 'kegiatan1-umpan-balik', title: 'Kegiatan 1: Umpan Balik' },
    { id: 'kegiatan2', title: 'Kegiatan 2: Analisis & Dialog' },
    { id: 'latihan', title: 'Latihan Mandiri' },
];


// --- Main Page Component ---
export default function MenyimakSiswaPage() {
    const params = useParams();
    const chapterId = params.id as string;
    
    const [content, setContent] = useState<MenyimakContentData | null>(null);
    const [answers, setAnswers] = useState<MenyimakAnswers | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user] = useAuthState(auth);
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (!user || !chapterId) return;

        async function fetchInitialData() {
            setLoading(true);
            try {
                const contentRef = doc(db, 'chapters', chapterId);
                const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_menyimak`);

                const [contentSnap, submissionSnap] = await Promise.all([
                    getDoc(contentRef),
                    getDoc(submissionRef)
                ]);

                let fetchedContent: MenyimakContentData | null = null;
                if (contentSnap.exists() && contentSnap.data().menyimak) {
                    fetchedContent = contentSnap.data().menyimak as MenyimakContentData;
                    setContent(fetchedContent);
                }
                
                const initialAnswers: MenyimakAnswers = { kegiatan1: {}, kegiatan2: {}, latihan: {} };
                if (fetchedContent) {
                    fetchedContent.statements.forEach((stmt) => {
                        initialAnswers.kegiatan1[stmt.no.toString()] = { choice: '', evidence: '' };
                    });
                     (fetchedContent.latihan?.statements || []).forEach((_, index) => {
                        initialAnswers.latihan[(index + 1).toString()] = { choice: '', analysis: '' };
                    });
                     (fetchedContent.activity2Questions || []).forEach((q) => {
                         initialAnswers.kegiatan2[q] = '';
                     });
                     initialAnswers.kegiatan2['comparison'] = '';
                     initialAnswers.kegiatan2['dialogue-fix'] = '';

                }
                
                if (submissionSnap.exists()) {
                    const existingAnswers = submissionSnap.data().answers as MenyimakAnswers;
                    if (existingAnswers.kegiatan1) {
                        Object.keys(initialAnswers.kegiatan1).forEach(key => {
                            if (existingAnswers.kegiatan1[key]) initialAnswers.kegiatan1[key] = existingAnswers.kegiatan1[key];
                        });
                    }
                    if (existingAnswers.kegiatan2) {
                         initialAnswers.kegiatan2 = {...initialAnswers.kegiatan2, ...existingAnswers.kegiatan2};
                    }
                    if (existingAnswers.latihan) {
                         Object.keys(initialAnswers.latihan).forEach(key => {
                            if (existingAnswers.latihan[key]) initialAnswers.latihan[key] = existingAnswers.latihan[key];
                        });
                    }
                }
                setAnswers(initialAnswers);

            } catch (error) {
                console.error('Failed to fetch initial data:', error);
                toast({
                    variant: 'destructive',
                    title: 'Gagal Memuat',
                    description: 'Tidak dapat memuat konten atau data sebelumnya.',
                });
            } finally {
                setLoading(false);
            }
        }
        fetchInitialData();
    }, [chapterId, user, toast]);

    const handleAnswerChange = (kegiatan: keyof MenyimakAnswers, key: string, type: string, value: string) => {
        setAnswers(prev => {
            if (!prev) return null;
            const currentKegiatanAnswers = prev[kegiatan] || {};
            
            if (kegiatan === 'kegiatan2') {
                 return {
                    ...prev,
                    kegiatan2: {
                        ...prev.kegiatan2,
                        [key]: value
                    }
                };
            }

            const currentSubtaskAnswers = (currentKegiatanAnswers as any)[key] || {};
            
            return {
                ...prev,
                [kegiatan]: {
                    ...currentKegiatanAnswers,
                    [key]: {
                        ...currentSubtaskAnswers,
                        [type]: value,
                    }
                }
            };
        });
    };
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !answers) return toast({ variant: "destructive", title: "Anda harus masuk." });
        setIsSubmitting(true);
        try {
            const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_menyimak`);
            await setDoc(submissionRef, { 
                studentId: user.uid,
                chapterId: chapterId,
                activity: 'menyimak',
                answers, 
                lastSubmitted: serverTimestamp()
            }, { merge: true });
            
            toast({ title: "Berhasil!", description: "Seluruh jawaban Anda di bagian Menyimak telah berhasil disimpan." });
            setCurrentStep(steps.length); // Go to completion screen

        } catch (error) {
            toast({ variant: "destructive", title: "Gagal Menyimpan", description: "Terjadi kesalahan saat menyimpan jawaban Anda." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const progressPercentage = useMemo(() => {
      if (currentStep >= steps.length) return 100;
      return ((currentStep + 1) / (steps.length + 1)) * 100;
    }, [currentStep]);


    const renderStepContent = () => {
        if (loading || !content || !answers) {
            return <Card><CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-6 w-full" /><Skeleton className="aspect-video w-full" /><Skeleton className="h-48 w-full" /></CardContent></Card>;
        }

        if (currentStep >= steps.length) {
            return (
                <Card className="text-center p-8">
                    <CardHeader>
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                        <CardTitle className="text-2xl">Kegiatan Selesai!</CardTitle>
                        <CardDescription>Anda telah menyelesaikan seluruh kegiatan pada bagian Menyimak. Jawaban Anda sudah disimpan. Anda dapat kembali ke Peta Petualangan.</CardDescription>
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

        switch(steps[currentStep].id) {
            case 'tujuan':
                return (
                     <Card>
                        <CardHeader>
                            <CardTitle>Tujuan Pembelajaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-base text-justify">{content.learningObjective}</p>
                        </CardContent>
                    </Card>
                );
            case 'kegiatan1-tugas':
                return (
                    <>
                    <Card>
                        <CardHeader><CardTitle>Kegiatan 1: Menganalisis Teks Deskripsi</CardTitle><CardDescription className="text-justify">Simak video di bawah ini dengan saksama, lalu kerjakan tugas yang diberikan.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            {content.youtubeUrl ? (<div className="aspect-video w-full rounded-lg overflow-hidden border"><iframe className="w-full h-full" src={getYoutubeEmbedUrl(content.youtubeUrl)} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div>) : (<p className="text-muted-foreground">Video belum ditambahkan oleh guru.</p>)}
                            {content.youtubeUrl && (<Button asChild variant="outline"><Link href={content.youtubeUrl} target="_blank"><Youtube className="mr-2 h-4 w-4" /> Buka di YouTube</Link></Button>)}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Tugas: Penilaian Pernyataan</CardTitle><CardDescription className="text-justify">Tentukan apakah pernyataan berikut benar atau salah, dan berikan bukti informasi dari video yang telah Anda simak.</CardDescription></CardHeader>
                        <CardContent className="space-y-6">
                            {content.statements.map((stmt) => (
                                <div key={stmt.no} className="border p-4 rounded-lg bg-slate-50/50">
                                <p className="font-semibold text-justify">Pernyataan #{stmt.no}</p>
                                <p className="mt-1 text-sm text-justify">{stmt.statement}</p>
                                <div className="mt-4 space-y-4">
                                    <div>
                                    <Label className="font-medium">Tentukan jawaban Anda:</Label>
                                    <RadioGroup className="flex gap-4 mt-2" onValueChange={(value) => handleAnswerChange('kegiatan1', stmt.no.toString(), 'choice', value)} value={answers.kegiatan1[stmt.no.toString()]?.choice || ''}>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="benar" id={`r-${stmt.no}-benar`} /><Label htmlFor={`r-${stmt.no}-benar`}>Benar</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="salah" id={`r-${stmt.no}-salah`} /><Label htmlFor={`r-${stmt.no}-salah`}>Salah</Label></div>
                                    </RadioGroup>
                                    </div>
                                    <div>
                                    <Label htmlFor={`evidence-${stmt.no}`} className="font-medium">Tuliskan bukti informasinya:</Label>
                                    <Textarea id={`evidence-${stmt.no}`} className="mt-2 bg-white" placeholder="Tuliskan bukti pendukung dari video di sini..." rows={4} onChange={(e) => handleAnswerChange('kegiatan1', stmt.no.toString(), 'evidence', e.target.value)} value={answers.kegiatan1[stmt.no.toString()]?.evidence || ''} />
                                    </div>
                                </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    </>
                );
             case 'kegiatan1-umpan-balik':
                return (
                     <Card>
                        <CardHeader><CardTitle>Umpan Balik & Teks Transkrip</CardTitle><CardDescription className="text-justify">Setelah kalian menyatakan benar atau salah pernyataan tersebut yang disertai alasan atau bukti informasi, bandingkanlah jawaban kalian dengan penjelasan berikut. Teks deskripsi yang dilisankan dari laman YouTube tersebut dapat dituliskan sebagai berikut.</CardDescription></CardHeader>
                        <CardContent className="prose prose-sm max-w-none bg-slate-50/50 p-4 rounded-md text-justify">
                            <h4 className="font-bold text-center">Candi Borobudur</h4>
                            <p>Candi Borobudur adalah candi Budha yang paling besar dan mewah yang ada di Indonesia. Bentuk daripada candi ini nampak seperti piramida atau limas segi empat. Candi ini mempunyai banyak relief dan juga stupa. Karena kemegahan dan ukuran candi, membuat pesona candi bak gunung yang menjulang tinggi. Bahkan, dari arah kejauhan telah nampak dengan jelas akan pesona dari candi ini.</p>
                            <p>Tingkat pertama paling bawah disebut dengan Kamadatu. Pada bagian akhir tingkatan ini, terdapat relief yang berjumlah 160 buah. Relief tersebut mengandung kisah tentang Kamawibangga, berbagai macam kisah tentang dosa.</p>
                            <p>Tingkat kedua disebut Rupadatu, berupa empat buah teras. Teras itu seolah membentuk lorong yang berputar. Pada tingkat Rupadatu, terdapat 1300 relief. Pada tingkat kedua ini pula terdapat patung Budha berukuran kecil. Jumlah keseluruhan patung Budha sebanyak 432 patung. Patung itu terletak pada suatu relung terbuka yang ada di sepanjang pagar langkan. Pagar langkan adalah suatu bentuk peralihan dari Rupadatu ke Arupadatu.</p>
                            <p>Tingkat paling atas dinamakan Arupadatu. Khusus untuk tingkat ini, sama sekali tidak ada hiasan relief pada dindingnya. Bentuk dari lantai Arupadatu berupa lingkaran. Di sini, ada 72 stupa kecil. Semua stupa kecil tersebut tersusun atas tiga buah barisan yang seolah mengelilingi stupa induk. Bentuk dari stupa kecil menyerupai lonceng. Di dalam stupa, terdapat patung Budha. Di bagian tengah Arupadatu, terdapat stupa induk. Stupa ini memiliki patung-patung Budha dan mempunyai ukuran paling besar daripada stupa lainnya.</p>
                        </CardContent>
                    </Card>
                );
             case 'kegiatan2':
                 return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Kegiatan 2: Mengevaluasi Gagasan & Membandingkan</CardTitle>
                            <CardDescription className="text-justify">
                                Simaklah kembali teks deskripsi “Candi Borobudur” melalui tautan video pada Kegiatan 1 jika perlu. Setelah itu, jawablah pertanyaan-pertanyaan di bawah ini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                {(content.activity2Questions || []).map((q, i) => (
                                    <div key={i}>
                                        <Label htmlFor={`activity2-q${i}`} className="font-semibold text-justify">{i + 1}. {q}</Label>
                                        <Textarea id={`activity2-q${i}`} className="mt-2" placeholder="Tuliskan jawaban Anda di sini..." onChange={e => handleAnswerChange('kegiatan2', q, 'answer', e.target.value)} value={answers.kegiatan2[q] || ''} />
                                    </div>
                                ))}
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm text-foreground text-justify">Selanjutnya, simaklah tayangan dalam laman YouTube berikut. Lalu, bandingkan dengan teks deskripsi yang pertama kalian simak pada Kegiatan 1. Mana di antara kedua teks tersebut yang lebih baik deskripsinya?</p>
                                <div className="mt-4 space-y-4">
                                    {content.comparisonVideoUrl && <div className="aspect-video w-full rounded-lg overflow-hidden border"><iframe className="w-full h-full" src={getYoutubeEmbedUrl(content.comparisonVideoUrl)} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe></div>}
                                    <Label htmlFor="comparison" className="font-semibold">Jawaban Perbandingan Anda:</Label>
                                    <Textarea id="comparison" placeholder="Tuliskan hasil perbandingan Anda di sini..." rows={5} onChange={e => handleAnswerChange('kegiatan2', 'comparison', 'answer', e.target.value)} value={answers.kegiatan2['comparison'] || ''} />
                                </div>
                            </div>
                            <Separator/>
                            <div className="prose prose-sm max-w-none text-foreground text-justify">
                                <p>Perhatikan dialog berikut. Apakah orang yang menggambarkan Candi Borobudur ini sudah berusaha menggambarkannya sebaik dan semenarik mungkin?</p>
                                <blockquote className="border-l-4 pl-4 italic">
                                    <p><strong>Amir:</strong> Waktu liburan tahun ajaran baru kemarin, kelas kami berwisata ke Candi Borobudur.</p>
                                    <p><strong>Usman:</strong> Wah, enak benar. Saya belum pernah ke sana. Seperti apa Candi Borobudur itu?</p>
                                    <p><strong>Amir:</strong> Ya, pokoknya Borobudur itu suatu candi.</p>
                                    <p><strong>Usman:</strong> Gambarannya seperti apa?</p>
                                    <p><strong>Amir:</strong> Ya, candi itu besar, tinggi. Banyak orang berkunjung ke sana. Ada yang foto-foto, berundak-undak, ada patungnya, dan ada reliefnya. Untuk mencapai ke atas, perlu tenaga. Lelah soalnya. Coba kamu berkunjung ke sana. Pokoknya, sulit digambarkan dengan kata-kata. Langsung saja lihat ke sana.</p>
                                    <p><strong>Usman:</strong> Oh, begitu.</p>
                                </blockquote>
                                <p>Apa yang kalian perhatikan dari dialog tersebut? Si Amir diminta menggambarkan objek Candi Borobudur. Namun, dia tidak begitu terampil menggambarkannya. Selanjutnya, coba kalian perbaiki teks tersebut agar sesuai dengan kriteria teks deskripsi.</p>
                            </div>
                            <div>
                                <Label htmlFor="dialogue-fix" className="font-semibold">Perbaikan Dialog oleh Kelompok Anda:</Label>
                                <Textarea id="dialogue-fix" placeholder="Tuliskan perbaikan dialog di sini..." rows={8} onChange={e => handleAnswerChange('kegiatan2', 'dialogue-fix', 'answer', e.target.value)} value={answers.kegiatan2['dialogue-fix'] || ''} />
                            </div>
                        </CardContent>
                    </Card>
                 );
            case 'latihan':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Latihan</CardTitle>
                            <CardDescription className="text-justify">
                                Simaklah tayangan deskripsi pada laman YouTube Info Sumut dengan kata kunci pencarian pesona Danau Toba. Setelah kalian menyimak tayangan tersebut, centanglah pernyataan benar atau salah dalam Tabel 1.2. Lalu, berikan analisis terhadap gagasan dan pandangan yang disampaikan narator dalam tayangan tersebut.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {content.latihan.youtubeUrl ? (
                                <div className="aspect-video w-full rounded-lg overflow-hidden border">
                                    <iframe className="w-full h-full" src={getYoutubeEmbedUrl(content.latihan.youtubeUrl)} title="Pesona Danau Toba" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                                </div>
                            ): (
                                <p className="text-muted-foreground">Video latihan belum ditambahkan oleh guru.</p>
                            )}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tabel 1.2 Pernyataan Penilaian</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">No.</TableHead>
                                                <TableHead>Pernyataan</TableHead>
                                                <TableHead className="w-[150px] text-center">Benar / Salah</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {content.latihan.statements.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>
                                                        <p className="text-justify">{item.statement}</p>
                                                        <Label className="mt-4 block font-medium">Jika tidak, seharusnya....</Label>
                                                        <Textarea
                                                            className="mt-2"
                                                            placeholder="Tuliskan analisis Anda..."
                                                            onChange={e => handleAnswerChange('latihan', String(index + 1), 'analysis', e.target.value)}
                                                            value={answers.latihan[String(index + 1)]?.analysis || ''}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <RadioGroup
                                                            className="flex flex-col space-y-2 items-center justify-center"
                                                            onValueChange={(value) => handleAnswerChange('latihan', String(index + 1), 'choice', value)}
                                                            value={answers.latihan[String(index + 1)]?.choice || ''}
                                                        >
                                                            <div className="flex items-center space-x-2"><RadioGroupItem value="benar" id={`l-${index}-benar`} /><Label htmlFor={`l-${index}-benar`}>Benar</Label></div>
                                                            <div className="flex items-center space-x-2"><RadioGroupItem value="salah" id={`l-${index}-salah`} /><Label htmlFor={`l-${index}-salah`}>Salah</Label></div>
                                                        </RadioGroup>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                );
            default: return null;
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
                        <h1 className="text-2xl font-bold text-foreground capitalize">A. Menyimak Teks Deskripsi</h1>
                        <p className="text-muted-foreground mt-1">Bab {chapterId}: Membicarakan Teks Deskripsi</p>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8">
                     <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                 
                        {/* Progress Indicator */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium text-muted-foreground">
                                <span>Langkah {currentStep >= steps.length ? steps.length + 1 : currentStep + 1} dari {steps.length + 1}</span>
                                <span>{steps[currentStep]?.title || 'Selesai'}</span>
                            </div>
                            <Progress value={progressPercentage} className="w-full" />
                        </div>
                        
                        <div>
                        {renderStepContent()}
                        </div>
                        
                        {/* Navigation Buttons */}
                        {currentStep < steps.length && (
                            <div className="flex justify-between items-center pt-4">
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
                                    <Button type="submit" disabled={isSubmitting || loading}>
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                        {isSubmitting ? 'Mengirim...' : 'Selesai & Kirim Semua Jawaban'}
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
