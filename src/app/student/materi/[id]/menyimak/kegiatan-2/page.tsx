
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { GitCompareArrows, ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Separator } from '@/components/ui/separator';
import { useParams, useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/app/(authenticated)/layout';

type MenyimakContentData = {
  activity2Questions: string[];
  comparisonVideoUrl: string;
};

type Answers = Record<string, string>;

function getYoutubeEmbedUrl(url: string) {
    if (!url) return '';
    if (url.includes('embed')) return url;
    try {
        const videoUrl = new URL(url);
        let videoId = videoUrl.searchParams.get('v');
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        if (videoUrl.hostname === 'youtu.be') {
            const shortId = videoUrl.pathname.slice(1);
            if (shortId) return `https://www.youtube.com/embed/${shortId.split('?')[0]}`;
        }
    } catch (error) { console.error('Invalid YouTube URL', error); }
    return url;
}

export default function MenyimakKegiatan2Page() {
    const params = useParams();
    const router = useRouter();
    const chapterId = params.id as string;
    
    const [content, setContent] = useState<MenyimakContentData | null>(null);
    const [answers, setAnswers] = useState<Answers>({});
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user] = useAuthState(auth);
    const { toast } = useToast();
    
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
                
                if (contentSnap.exists() && contentSnap.data().menyimak) {
                    setContent(contentSnap.data().menyimak);
                }

                if (submissionSnap.exists()) {
                    setAnswers(submissionSnap.data().answers?.kegiatan2 || {});
                }

            } catch (error) {
                console.error('Failed to fetch initial data:', error);
                toast({ variant: 'destructive', title: 'Gagal Memuat', description: 'Gagal memuat konten atau data sebelumnya.' });
            } finally {
                setLoading(false);
            }
        }
        fetchInitialData();
    }, [chapterId, user]);

    const handleAnswerChange = (key: string, value: string) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };
    
    const handleSubmit = async () => {
        if (!user) return toast({ variant: "destructive", title: "Anda harus masuk." });
        
        setIsSubmitting(true);
        try {
            const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_menyimak`);
             await setDoc(submissionRef, { 
                answers: { kegiatan2: answers } 
            }, { merge: true });
            
            toast({ title: "Progres Disimpan!", description: "Jawaban Anda untuk Kegiatan 2 telah disimpan." });
            router.push(`/student/materi/${chapterId}/menyimak/latihan`);

        } catch (error) {
            toast({ variant: "destructive", title: "Gagal Menyimpan", description: "Terjadi kesalahan saat menyimpan jawaban Anda." });
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
                            <Link href={`/student/materi/${chapterId}/menyimak`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Peta Menyimak
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold text-foreground capitalize flex items-center gap-3">
                            <GitCompareArrows className="w-8 h-8 text-primary" />
                            Kegiatan 2: Membandingkan & Mengevaluasi
                        </h1>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8">
                     <div className="max-w-4xl mx-auto space-y-8">
                        
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader><CardTitle className="text-blue-800">Panduan Belajar</CardTitle></CardHeader>
                            <CardContent className="text-blue-700 space-y-2 text-sm">
                                <p><strong>Langkah 1:</strong> Jawab pertanyaan-pertanyaan evaluasi berdasarkan pemahaman Anda dari video di Kegiatan 1.</p>
                                <p><strong>Langkah 2:</strong> Simak video pembanding, lalu tuliskan analisis perbandingan Anda antara video pertama dan kedua.</p>
                                <p><strong>Langkah 3:</strong> Baca dialog contoh, lalu coba perbaiki dialog tersebut agar menjadi teks deskripsi yang lebih baik dan menarik.</p>
                            </CardContent>
                        </Card>

                        {loading ? (
                            <Skeleton className="h-96 w-full" />
                        ) : content ? (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Evaluasi Gagasan</CardTitle>
                                        <CardDescription>Jawablah pertanyaan-pertanyaan di bawah ini berdasarkan pemahaman Anda dari video Candi Borobudur di Kegiatan 1.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {(content.activity2Questions || []).map((q, i) => (
                                            <div key={i}>
                                                <Label htmlFor={`activity2-q${i}`} className="font-semibold text-justify">{i + 1}. {q}</Label>
                                                <Textarea id={`activity2-q${i}`} className="mt-2" placeholder="Tuliskan jawaban Anda di sini..." onChange={e => handleAnswerChange(`q${i}`, e.target.value)} value={answers[`q${i}`] || ''} rows={4}/>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Analisis Perbandingan</CardTitle>
                                        <CardDescription>Simak tayangan berikut. Lalu, bandingkan dengan video pada Kegiatan 1. Mana yang deskripsinya lebih baik menurut Anda?</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {content.comparisonVideoUrl && <div className="aspect-video w-full rounded-lg overflow-hidden border"><iframe className="w-full h-full" src={getYoutubeEmbedUrl(content.comparisonVideoUrl)} title="YouTube video player 2" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div>}
                                        <Label htmlFor="comparison" className="font-semibold">Jawaban Perbandingan Anda:</Label>
                                        <Textarea id="comparison" placeholder="Tuliskan hasil perbandingan Anda di sini..." rows={5} onChange={e => handleAnswerChange('comparison', e.target.value)} value={answers['comparison'] || ''} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Evaluasi Dialog</CardTitle>
                                        <CardDescription>Perhatikan dialog berikut. Apakah Amir sudah berusaha menggambarkan Candi Borobudur dengan baik? Coba Anda perbaiki agar menjadi teks deskripsi yang lebih menarik.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose prose-sm max-w-none text-foreground text-justify bg-slate-50 p-4 rounded-md border">
                                            <blockquote className="border-l-4 pl-4 italic not-italic my-0">
                                                <p><strong>Amir:</strong> Waktu liburan tahun ajaran baru kemarin, kelas kami berwisata ke Candi Borobudur.</p>
                                                <p><strong>Usman:</strong> Wah, enak benar. Saya belum pernah ke sana. Seperti apa Candi Borobudur itu?</p>
                                                <p><strong>Amir:</strong> Ya, pokoknya Borobudur itu suatu candi.</p>
                                                <p><strong>Usman:</strong> Gambarannya seperti apa?</p>
                                                <p><strong>Amir:</strong> Ya, candi itu besar, tinggi. Banyak orang berkunjung ke sana. Ada yang foto-foto, berundak-undak, ada patungnya, dan ada reliefnya. Untuk mencapai ke atas, perlu tenaga. Lelah soalnya. Coba kamu berkunjung ke sana. Pokoknya, sulit digambarkan dengan kata-kata. Langsung saja lihat ke sana.</p>
                                                <p><strong>Usman:</strong> Oh, begitu.</p>
                                            </blockquote>
                                        </div>
                                         <div className="mt-4">
                                            <Label htmlFor="dialogue-fix" className="font-semibold">Perbaikan Dialog oleh Anda:</Label>
                                            <Textarea id="dialogue-fix" placeholder="Tuliskan perbaikan dialog di sini..." rows={8} onChange={e => handleAnswerChange('dialogue-fix', e.target.value)} value={answers['dialogue-fix'] || ''} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <Card><CardContent className="p-6 text-center text-muted-foreground">Konten untuk kegiatan ini belum tersedia.</CardContent></Card>
                        )}
                        
                        <div className="flex justify-between items-center">
                            <Button variant="outline" onClick={() => router.push(`/student/materi/${chapterId}/menyimak/kegiatan-1`)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Kegiatan 1
                            </Button>
                            <Button size="lg" disabled={isSubmitting || loading} onClick={handleSubmit}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Simpan & Lanjut ke Latihan
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
