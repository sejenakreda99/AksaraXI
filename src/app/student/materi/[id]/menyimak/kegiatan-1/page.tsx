
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Youtube, ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Separator } from '@/components/ui/separator';
import { useParams, useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/app/(authenticated)/layout';

type Statement = {
  no: number;
  statement: string;
};

type MenyimakContentData = {
  youtubeUrl: string;
  statements: Statement[];
};

type Answers = Record<string, { choice: 'benar' | 'salah' | ''; evidence: string }>;

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

export default function MenyimakKegiatan1Page() {
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
                    setAnswers(submissionSnap.data().answers?.kegiatan1 || {});
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

    const handleAnswerChange = (key: string, type: 'choice' | 'evidence', value: string) => {
        setAnswers(prev => ({
            ...prev,
            [key]: {
                ...(prev[key] || { choice: '', evidence: '' }),
                [type]: value,
            }
        }));
    };
    
    const handleSubmit = async () => {
        if (!user) return toast({ variant: "destructive", title: "Anda harus masuk." });
        
        setIsSubmitting(true);
        try {
            const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_menyimak`);
            await setDoc(submissionRef, { 
                studentId: user.uid,
                chapterId: chapterId,
                activity: 'menyimak',
                lastSubmitted: serverTimestamp(),
                answers: { kegiatan1: answers } 
            }, { merge: true });
            
            toast({ title: "Progres Disimpan!", description: "Jawaban Anda untuk Kegiatan 1 telah disimpan." });
            router.push(`/student/materi/${chapterId}/menyimak/kegiatan-2`);

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
                            <Youtube className="w-8 h-8 text-primary" />
                            Kegiatan 1: Menganalisis Video
                        </h1>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8">
                     <div className="max-w-4xl mx-auto space-y-8">
                        
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-blue-800">Panduan Belajar</CardTitle>
                            </CardHeader>
                            <CardContent className="text-blue-700 space-y-2 text-sm">
                                <p><strong>Langkah 1:</strong> Simak video tentang Candi Borobudur dengan saksama.</p>
                                <p><strong>Langkah 2:</strong> Baca setiap pernyataan pada bagian "Tugas" di bawah ini.</p>
                                <p><strong>Langkah 3:</strong> Tentukan apakah pernyataan tersebut "Benar" atau "Salah" berdasarkan informasi dari video.</p>
                                <p><strong>Langkah 4:</strong> Tuliskan bukti atau alasan singkat dari video yang mendukung jawaban Anda di kolom yang tersedia.</p>
                            </CardContent>
                        </Card>

                        {loading ? (
                            <div className="space-y-4">
                               <Skeleton className="h-64 w-full" />
                               <Skeleton className="h-48 w-full" />
                            </div>
                        ) : content ? (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Video Pembelajaran</CardTitle>
                                        <CardDescription>Simak video di bawah ini untuk dapat mengerjakan tugas.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {content.youtubeUrl && (
                                            <div className="aspect-video w-full rounded-lg overflow-hidden border">
                                                <iframe className="w-full h-full" src={getYoutubeEmbedUrl(content.youtubeUrl)} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tugas: Penilaian Pernyataan</CardTitle>
                                        <CardDescription>Tentukan apakah pernyataan berikut benar atau salah, dan berikan buktinya.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {(content.statements || []).map((stmt) => (
                                            <div key={stmt.no} className="border p-4 rounded-lg bg-slate-50">
                                                <p className="font-semibold text-justify">Pernyataan #{stmt.no}</p>
                                                <p className="mt-1 text-sm text-justify">{stmt.statement}</p>
                                                <div className="mt-4 space-y-4">
                                                    <div>
                                                        <Label className="font-medium">Jawaban Anda:</Label>
                                                        <RadioGroup className="flex gap-4 mt-2" onValueChange={(value) => handleAnswerChange(stmt.no.toString(), 'choice', value)} value={answers[stmt.no.toString()]?.choice || ''}>
                                                            <div className="flex items-center space-x-2"><RadioGroupItem value="benar" id={`r-${stmt.no}-benar`} /><Label htmlFor={`r-${stmt.no}-benar`}>Benar</Label></div>
                                                            <div className="flex items-center space-x-2"><RadioGroupItem value="salah" id={`r-${stmt.no}-salah`} /><Label htmlFor={`r-${stmt.no}-salah`}>Salah</Label></div>
                                                        </RadioGroup>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`evidence-${stmt.no}`} className="font-medium">Bukti/Alasan dari Video:</Label>
                                                        <Textarea id={`evidence-${stmt.no}`} className="mt-2 bg-white" placeholder="Tuliskan bukti pendukung dari video di sini..." rows={3} onChange={(e) => handleAnswerChange(stmt.no.toString(), 'evidence', e.target.value)} value={answers[stmt.no.toString()]?.evidence || ''} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <Card><CardContent className="p-6 text-center text-muted-foreground">Konten untuk kegiatan ini belum tersedia.</CardContent></Card>
                        )}
                        
                        <div className="flex justify-between items-center">
                             <Button variant="outline" onClick={() => router.push(`/student/materi/${chapterId}/menyimak/tujuan`)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Tujuan
                            </Button>
                            <Button size="lg" disabled={isSubmitting || loading} onClick={handleSubmit}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Simpan & Lanjut ke Kegiatan 2
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
