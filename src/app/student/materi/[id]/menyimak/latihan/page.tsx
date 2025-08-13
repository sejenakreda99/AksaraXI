
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Loader2, Save, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateFeedback } from '@/ai/flows/generate-feedback-flow';

type LatihanStatement = {
    statement: string;
};
type MenyimakContent = {
  latihan: {
    youtubeUrl: string;
    statements: LatihanStatement[];
  }
};
type AnswersLatihan = Record<string, { choice: string; analysis: string }>;

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

export default function MenyimakLatihanPage() {
    const params = useParams();
    const router = useRouter();
    const chapterId = params.id as string;
    const [user] = useAuthState(auth);
    const { toast } = useToast();

    const [content, setContent] = useState<MenyimakContent | null>(null);
    const [answers, setAnswers] = useState<AnswersLatihan>({});
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<Record<string, string>>({});
    const [isGeneratingFeedback, setIsGeneratingFeedback] = useState<Record<string, boolean>>({});

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
                    if (submissionData.answers?.latihan) {
                        setAnswers(submissionData.answers.latihan);
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
    
    const handleFeedbackRequest = async (questionKey: string, questionText: string, studentAnswer: string) => {
        if (!studentAnswer) {
            toast({ variant: 'destructive', title: 'Jawaban Kosong', description: 'Harap isi jawaban Anda sebelum meminta umpan balik.' });
            return;
        }
        setIsGeneratingFeedback(prev => ({ ...prev, [questionKey]: true }));
        try {
            const result = await generateFeedback({ question: questionText, answer: studentAnswer });
            setFeedback(prev => ({ ...prev, [questionKey]: result.feedback }));
        } catch (error) {
            console.error('Error generating feedback:', error);
            toast({ variant: 'destructive', title: 'Gagal Mendapatkan Umpan Balik' });
        } finally {
            setIsGeneratingFeedback(prev => ({ ...prev, [questionKey]: false }));
        }
    };

    const handleFinish = async () => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_menyimak`);
            await setDoc(submissionRef, {
                answers: {
                    latihan: answers,
                }
            }, { merge: true });
            
            toast({ title: "Latihan Selesai!", description: "Selamat, Anda telah menyelesaikan semua kegiatan menyimak!" });
            router.push(`/student/materi/${chapterId}`);
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
    
    if (!content || !content.latihan) {
         return (
             <AuthenticatedLayout>
                 <div className="flex flex-col h-full items-center justify-center">
                    <p>Konten latihan belum tersedia.</p>
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
                        <h1 className="text-2xl font-bold text-foreground">Latihan Mandiri & Umpan Balik AI</h1>
                        <p className="text-muted-foreground mt-1 text-justify">Untuk memantapkan pemahaman Anda, simaklah video berikut. Kemudian, tentukan apakah pernyataan-pernyataan di bawahnya benar atau salah, berikan analisis singkat Anda, dan dapatkan umpan balik dari AI.</p>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Video Latihan: "Pesona Danau Toba"</CardTitle>
                            </CardHeader>
                             <CardContent className="space-y-6">
                                {content.latihan.youtubeUrl && (
                                    <div className="aspect-video w-full rounded-lg overflow-hidden border">
                                        <iframe className="w-full h-full" src={getYoutubeEmbedUrl(content.latihan.youtubeUrl)} title="YouTube: Danau Toba" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Tugas Latihan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(content.latihan.statements || []).map((stmt, index) => {
                                    const answerKey = index.toString();
                                    const currentAnswer = answers[answerKey] || { choice: '', analysis: '' };
                                    const questionText = stmt.statement;

                                    return (
                                        <div key={index} className="border p-4 rounded-lg bg-slate-50/50 space-y-4">
                                            <p className="font-semibold text-justify">{index + 1}. {questionText}</p>
                                            <div>
                                                <Label className="font-medium">Jawaban Anda:</Label>
                                                <RadioGroup className="flex gap-4 mt-2" onValueChange={(value) => handleAnswerChange(answerKey, { ...currentAnswer, choice: value })} value={currentAnswer.choice}>
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="benar" id={`r3-${index}-benar`} /><Label htmlFor={`r3-${index}-benar`}>Benar</Label></div>
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="salah" id={`r3-${index}-salah`} /><Label htmlFor={`r3-${index}-salah`}>Salah</Label></div>
                                                </RadioGroup>
                                            </div>
                                            <div>
                                                <Label htmlFor={`a3-${index}`} className="font-medium">Jika tidak, seharusnya bagaimana? Berikan analisis singkat Anda.</Label>
                                                <Textarea id={`a3-${index}`} className="mt-2 bg-white" placeholder="Tuliskan analisis singkat Anda..." rows={4} onChange={(e) => handleAnswerChange(answerKey, { ...currentAnswer, analysis: e.target.value })} value={currentAnswer.analysis} />
                                            </div>
                                            
                                            <div className="pt-2">
                                                <Button type="button" variant="outline" size="sm" onClick={() => handleFeedbackRequest(`latihan-${index}`, questionText, currentAnswer.analysis)} disabled={isGeneratingFeedback[`latihan-${index}`]}>
                                                    {isGeneratingFeedback[`latihan-${index}`] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                                    Minta Umpan Balik AI
                                                </Button>
                                                {feedback[`latihan-${index}`] && (
                                                    <div className="mt-3 text-sm p-3 bg-green-50 border border-green-200 text-green-800 rounded-md">
                                                        <p className="font-semibold">Umpan Balik:</p>
                                                        <p>{feedback[`latihan-${index}`]}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        <div className="flex justify-between">
                             <Button variant="outline" onClick={() => router.push(`/student/materi/${chapterId}/menyimak/kegiatan-2`)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Kegiatan 2
                            </Button>
                            <Button onClick={handleFinish} size="lg" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                Selesaikan Bagian Menyimak
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
