
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Skeleton } from '@/components/ui/skeleton';

type AsesmenContent = {
    part1IntroText: string;
    part1Text: string;
    part1Questions: string[];
    part2IntroText: string;
    youtubeLinks: string[];
    part2Questions: string[];
}

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
    } catch (error) {
        console.error('Invalid YouTube URL', error);
        return url;
    }
    return url;
}

export default function AsesmenSiswaPage() {
    const params = useParams();
    const chapterId = params.id as string;
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user] = useAuthState(auth);
    const [content, setContent] = useState<AsesmenContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    
    useEffect(() => {
        async function fetchContent() {
            if (!chapterId) return;
            setLoading(true);
            try {
                const docRef = doc(db, 'chapters', chapterId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().asesmen) {
                    setContent(docSnap.data().asesmen);
                }
            } catch (error) {
                console.error("Failed to fetch asesmen content:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchContent();
    }, [chapterId]);

    const handleAnswerChange = (questionKey: string, value: string) => {
        setAnswers(prev => ({...prev, [questionKey]: value}));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Anda harus masuk untuk mengirimkan jawaban.' });
            return;
        }
        setIsSubmitting(true);
        
        try {
            const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_asesmen`);
            await setDoc(submissionRef, {
                studentId: user.uid,
                chapterId: chapterId,
                activity: 'asesmen',
                answers: answers,
                lastSubmitted: serverTimestamp()
            }, { merge: true });

            toast({
                title: "Asesmen Terkirim",
                description: "Jawaban asesmen Anda telah berhasil disimpan dan akan segera dinilai oleh guru.",
            });

        } catch (error) {
            console.error("Error submitting assessment: ", error);
            toast({
                variant: 'destructive',
                title: "Gagal Mengirim",
                description: "Terjadi kesalahan saat mengirim jawaban Anda.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

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
                        <h1 className="text-2xl font-bold text-foreground capitalize">E. Asesmen</h1>
                        <p className="text-muted-foreground mt-1">Bab {chapterId}: Membicarakan Teks Deskripsi</p>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                         {loading ? (
                             <div className="space-y-4">
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-48 w-full" />
                             </div>
                         ) : content ? (
                            <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Bagian I: Analisis Teks &quot;Keindahan Alam Indonesia&quot;</CardTitle>
                                    <CardDescription className="text-justify">{content.part1IntroText}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="prose prose-sm max-w-none bg-slate-50 border rounded-lg p-4 text-justify whitespace-pre-wrap">
                                        <h3 className="text-center font-bold">Keindahan Alam Indonesia</h3>
                                        {content.part1Text}
                                    </div>
                                    <div className="space-y-4">
                                    {content.part1Questions.map((q, i) => (
                                        <div key={i} className="space-y-2">
                                            <Label htmlFor={`q1-${i}`} className="text-justify">{i + 1}. {q}</Label>
                                            <Textarea id={`q1-${i}`} name={`q1-${i}`} placeholder="Tuliskan jawaban Anda di sini..." rows={4} required onChange={(e) => handleAnswerChange(`q1-${i}`, e.target.value)} />
                                        </div>
                                    ))}
                                    </div>
                                </CardContent>
                            </Card>

                             <Card>
                                <CardHeader>
                                    <CardTitle>Bagian II: Perbandingan Video Deskripsi</CardTitle>
                                    <CardDescription className="text-justify">{content.part2IntroText}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {content.youtubeLinks.map((link, i) => (
                                            link && <div key={i} className="aspect-video w-full rounded-lg overflow-hidden border">
                                                <iframe className="w-full h-full" src={getYoutubeEmbedUrl(link)} title={`YouTube video ${i+1}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-4">
                                    {content.part2Questions.map((q, i) => (
                                        <div key={i} className="space-y-2">
                                            <Label htmlFor={`q2-${i}`} className="text-justify">{i + 7}. {q}</Label>
                                            <Textarea id={`q2-${i}`} name={`q2-${i}`} placeholder="Tuliskan jawaban Anda di sini..." rows={4} required onChange={(e) => handleAnswerChange(`q2-${i}`, e.target.value)} />
                                        </div>
                                    ))}
                                    </div>
                                </CardContent>
                            </Card>
                            </>
                         ) : (
                              <Card><CardContent className="p-6 text-center text-muted-foreground">Konten asesmen belum tersedia.</CardContent></Card>
                         )}

                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || loading}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isSubmitting ? "Menyimpan..." : "Kirim Jawaban Asesmen"}
                        </Button>
                    </form>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
