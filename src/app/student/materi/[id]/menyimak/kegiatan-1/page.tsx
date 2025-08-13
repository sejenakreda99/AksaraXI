
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Statement = {
  no: number;
  statement: string;
};
type MenyimakContent = {
  youtubeUrl: string;
  statements: Statement[];
};
type AnswersKegiatan1 = Record<string, { choice: string; evidence: string }>;

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

export default function MenyimakKegiatan1Page() {
    const params = useParams();
    const router = useRouter();
    const chapterId = params.id as string;
    const [user] = useAuthState(auth);
    const { toast } = useToast();

    const [content, setContent] = useState<MenyimakContent | null>(null);
    const [answers, setAnswers] = useState<AnswersKegiatan1>({});
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
                    if (submissionData.answers?.kegiatan1) {
                        setAnswers(submissionData.answers.kegiatan1);
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

    const handleAnswerChange = (key: string, value: any) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveAndContinue = async () => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_menyimak`);
            await setDoc(submissionRef, {
                studentId: user.uid,
                chapterId: chapterId,
                activity: 'menyimak',
                lastSubmitted: serverTimestamp(),
                answers: {
                    kegiatan1: answers,
                }
            }, { merge: true });
            
            toast({ title: "Progres Disimpan", description: "Jawaban Anda untuk Kegiatan 1 telah disimpan." });
            router.push(`/student/materi/${chapterId}/menyimak/kegiatan-2`);
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
    
    if (!content) {
         return (
             <AuthenticatedLayout>
                 <div className="flex flex-col h-full items-center justify-center">
                    <p>Konten tidak tersedia.</p>
                     <Button asChild variant="outline" className="mt-4">
                        <Link href={`/student/materi/${chapterId}/menyimak`}>Kembali</Link>
                    </Button>
                 </div>
            </AuthenticatedLayout>
        )
    }

    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-full">
                <header className="bg-card border-b p-4 sm:p-6">
                    <div className="max-w-4xl mx-auto">
                        <Button asChild variant="outline" size="sm" className="mb-4">
                            <Link href={`/student/materi/${chapterId}/menyimak`}><ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Peta Menyimak</Link>
                        </Button>
                        <h1 className="text-2xl font-bold text-foreground">Kegiatan 1: Menganalisis Video "Candi Borobudur"</h1>
                        <p className="text-muted-foreground mt-1 text-justify">Pada kegiatan ini, Anda akan menyimak teks deskripsi dari video YouTube berikut. Setelah menyimak, jawablah pertanyaan-pertanyaan dalam tabel di bawahnya.</p>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <Card>
                            <CardContent className="pt-6">
                                {content.youtubeUrl && (
                                    <div className="aspect-video w-full rounded-lg overflow-hidden border">
                                        <iframe className="w-full h-full" src={getYoutubeEmbedUrl(content.youtubeUrl)} title="YouTube: Candi Borobudur" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Tugas: Pernyataan Benar/Salah</CardTitle>
                                <CardDescription>Berdasarkan video, tentukan apakah pernyataan berikut benar atau salah, lalu berikan bukti informasinya.</CardDescription>
                            </CardHeader>
                             <CardContent className="space-y-4">
                                {content.statements.map((stmt) => {
                                    const answerKey = stmt.no.toString();
                                    const currentAnswer = answers[answerKey] || { choice: '', evidence: '' };
                                    return (
                                        <div key={stmt.no} className="border p-4 rounded-lg bg-slate-50/50 space-y-3">
                                            <p className="font-semibold text-justify">{stmt.no}. {stmt.statement}</p>
                                            <div>
                                                <Label className="font-medium">Jawaban Anda:</Label>
                                                <RadioGroup className="flex gap-4 mt-2" onValueChange={(value) => handleAnswerChange(answerKey, { ...currentAnswer, choice: value })} value={currentAnswer.choice}>
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="benar" id={`r1-${stmt.no}-benar`} /><Label htmlFor={`r1-${stmt.no}-benar`}>Benar</Label></div>
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="salah" id={`r1-${stmt.no}-salah`} /><Label htmlFor={`r1-${stmt.no}-salah`}>Salah</Label></div>
                                                </RadioGroup>
                                            </div>
                                            <div>
                                                <Label htmlFor={`e1-${stmt.no}`} className="font-medium">Bukti Informasi:</Label>
                                                <Textarea id={`e1-${stmt.no}`} className="mt-2 bg-white" placeholder="Tuliskan bukti pendukung dari video..." rows={3} onChange={(e) => handleAnswerChange(answerKey, { ...currentAnswer, evidence: e.target.value })} value={currentAnswer.evidence} />
                                            </div>
                                        </div>
                                    );
                                })}
                             </CardContent>
                         </Card>
                         <div className="flex justify-end">
                            <Button onClick={handleSaveAndContinue} size="lg" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Simpan & Lanjut ke Kegiatan 2
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
