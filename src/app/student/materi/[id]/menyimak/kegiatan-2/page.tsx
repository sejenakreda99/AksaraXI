
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type MenyimakContent = {
    activity2Questions: string[];
    comparisonVideoUrl: string;
};
type AnswersKegiatan2 = Record<number, string>;

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
    } catch (error) {
        console.error('Invalid YouTube URL', error);
    }
    return url;
}

export default function MenyimakKegiatan2Page() {
    const params = useParams();
    const router = useRouter();
    const chapterId = params.id as string;
    const [user] = useAuthState(auth);
    const { toast } = useToast();

    const [content, setContent] = useState<MenyimakContent | null>(null);
    const [answers, setAnswers] = useState<AnswersKegiatan2>({});
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user || !chapterId) return;

        async function fetchInitialData() {
            setLoading(true);
            try {
                const contentRef = doc(db, 'chapters', chapterId);
                const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_menyimak`);

                const [contentSnap, submissionSnap] = await Promise.all([getDoc(contentRef), getDoc(submissionRef)]);

                if (contentSnap.exists() && contentSnap.data().menyimak) {
                    setContent(contentSnap.data().menyimak);
                }
                
                if (submissionSnap.exists()) {
                    const submissionData = submissionSnap.data();
                    if (submissionData.answers?.kegiatan2) {
                        setAnswers(submissionData.answers.kegiatan2);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchInitialData();
    }, [user, chapterId]);

    const handleAnswerChange = (index: number, value: string) => {
        setAnswers(prev => ({ ...prev, [index]: value }));
    };

    const handleSaveAndContinue = async () => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_menyimak`);
            await setDoc(submissionRef, {
                answers: {
                    kegiatan2: answers,
                }
            }, { merge: true });
            
            toast({ title: "Progres Disimpan", description: "Jawaban Anda untuk Kegiatan 2 telah disimpan." });
            router.push(`/student/materi/${chapterId}/menyimak/latihan`);
        } catch (error) {
            console.error("Error saving progress:", error);
            toast({ variant: 'destructive', title: 'Gagal Menyimpan' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="flex-1 p-4 md:p-8"><Skeleton className="h-96 w-full" /></div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-full">
                <header className="bg-card border-b p-4 sm:p-6">
                    <div className="max-w-4xl mx-auto">
                        <Button asChild variant="outline" size="sm" className="mb-4">
                            <Link href={`/student/materi/${chapterId}/menyimak`}><ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Peta Menyimak</Link>
                        </Button>
                        <h1 className="text-2xl font-bold text-foreground">Kegiatan 2: Mengevaluasi & Membandingkan Gagasan</h1>
                        <p className="text-muted-foreground mt-1 text-justify">Jawablah pertanyaan berikut untuk mengevaluasi gagasan dalam video pertama. Kemudian, bandingkan dengan video kedua.</p>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <Card>
                             <CardHeader>
                                <CardTitle>Evaluasi Video "Candi Borobudur"</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-6">
                                {(content?.activity2Questions || []).map((question, index) => (
                                    <div key={index} className="space-y-2">
                                        <Label htmlFor={`q2-${index}`}>{index+1}. {question}</Label>
                                        <Textarea id={`q2-${index}`} placeholder="Tuliskan jawaban Anda..." rows={4} value={answers[index] || ''} onChange={(e) => handleAnswerChange(index, e.target.value)} />
                                    </div>
                                ))}
                             </CardContent>
                        </Card>
                        <Card>
                             <CardHeader>
                                <CardTitle>Perbandingan Video</CardTitle>
                                <CardDescription className="text-justify">Simaklah video berikut, lalu bandingkan dengan video Candi Borobudur sebelumnya. Mana yang menurut Anda lebih baik dalam mendeskripsikan objeknya? Jelaskan jawaban Anda pada kotak di bawah.</CardDescription>
                             </CardHeader>
                             <CardContent className="space-y-6">
                                {content?.comparisonVideoUrl && (
                                     <div className="aspect-video w-full rounded-lg overflow-hidden border">
                                        <iframe className="w-full h-full" src={getYoutubeEmbedUrl(content.comparisonVideoUrl)} title="YouTube: Video Perbandingan" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                    </div>
                                )}
                                 <div className="space-y-2">
                                    <Label htmlFor="q2-comparison">Analisis Perbandingan Anda</Label>
                                    <Textarea id="q2-comparison" placeholder="Tuliskan perbandingan Anda di sini..." rows={5} value={answers[content?.activity2Questions?.length || 0] || ''} onChange={(e) => handleAnswerChange(content?.activity2Questions?.length || 0, e.target.value)} />
                                </div>
                             </CardContent>
                        </Card>

                         <div className="flex justify-between">
                            <Button variant="outline" onClick={() => router.push(`/student/materi/${chapterId}/menyimak/kegiatan-1`)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Kegiatan 1
                            </Button>
                            <Button onClick={handleSaveAndContinue} size="lg" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Simpan & Lanjut ke Latihan
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
