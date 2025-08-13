
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save, Check, X, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateFeedback } from '@/ai/flows/generate-feedback-flow';

// --- TYPE DEFINITIONS ---
type Statement = {
  no: number;
  statement: string;
  answer: 'benar' | 'salah';
};
type LatihanStatement = {
    statement: string;
    answer: 'benar' | 'salah';
}
type MenyimakContent = {
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
    kegiatan1: Record<string, { choice: string; evidence: string }>;
    kegiatan2: Record<number, string>;
    latihan: Record<string, { choice: string; analysis: string }>;
};

// --- HELPER FUNCTIONS ---
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
        const pathSegments = videoUrl.pathname.split('/');
        const shortId = pathSegments[pathSegments.length - 1];
        if (shortId && !shortId.includes('.be')) return `https://www.youtube.com/embed/${shortId.split('?')[0]}`;
    } catch (error) {
        console.error('Invalid YouTube URL', error);
        return url;
    }
    return url;
}

// --- MAIN COMPONENT ---
export default function MenyimakSiswaPage() {
    const params = useParams();
    const chapterId = params.id as string;
    const [user] = useAuthState(auth);
    const { toast } = useToast();

    const [content, setContent] = useState<MenyimakContent | null>(null);
    const [answers, setAnswers] = useState<MenyimakAnswers>({ kegiatan1: {}, kegiatan2: {}, latihan: {} });
    const [existingSubmission, setExistingSubmission] = useState<any>(null);
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
                    const fetchedContent = contentSnap.data().menyimak as MenyimakContent;
                    setContent(fetchedContent);

                    // Safely initialize answers
                    const initialAnswers: MenyimakAnswers = { kegiatan1: {}, kegiatan2: {}, latihan: {} };
                    if (fetchedContent.statements) {
                        fetchedContent.statements.forEach(stmt => {
                            initialAnswers.kegiatan1[stmt.no.toString()] = { choice: '', evidence: '' };
                        });
                    }
                    if (fetchedContent.activity2Questions) {
                         fetchedContent.activity2Questions.forEach((_, index) => {
                             initialAnswers.kegiatan2[index] = '';
                         });
                    }
                    if (fetchedContent.latihan?.statements) {
                        fetchedContent.latihan.statements.forEach((_, index) => {
                            initialAnswers.latihan[index.toString()] = { choice: '', analysis: '' };
                        });
                    }
                    
                    if (submissionSnap.exists()) {
                        const submissionData = submissionSnap.data();
                        setExistingSubmission(submissionData);
                        // Merge saved answers with the initial structure
                        setAnswers(prev => ({
                            ...initialAnswers,
                            ...submissionData.answers
                        }));
                    } else {
                         setAnswers(initialAnswers);
                    }

                } else {
                     toast({ variant: 'destructive', title: 'Konten tidak ditemukan' });
                }

            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                toast({ variant: 'destructive', title: 'Gagal Memuat Data', description: "Terjadi kesalahan saat memuat konten atau progres Anda." });
            } finally {
                setLoading(false);
            }
        }
        fetchInitialData();
    }, [user, chapterId]);

    const handleAnswerChange = <T extends keyof MenyimakAnswers>(
        activity: T,
        key: string,
        value: any
    ) => {
        setAnswers(prev => ({
            ...prev,
            [activity]: {
                ...prev[activity],
                [key]: value
            }
        }));
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Anda harus masuk untuk menyimpan progres.' });
            return;
        }
        setIsSubmitting(true);
        
        try {
            const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_menyimak`);
            const dataToSave = {
                studentId: user.uid,
                chapterId: chapterId,
                activity: 'menyimak',
                answers: answers,
                lastSubmitted: serverTimestamp(),
            };
            await setDoc(submissionRef, dataToSave, { merge: true });
            toast({ title: "Progres Disimpan", description: "Semua jawaban Anda di halaman ini telah berhasil disimpan." });
        } catch (error) {
            console.error("Error submitting task:", error);
            toast({ variant: 'destructive', title: 'Gagal Menyimpan', description: 'Terjadi kesalahan saat menyimpan progres Anda.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (loading) {
        return (
            <AuthenticatedLayout>
                 <div className="flex flex-col h-full">
                     <header className="bg-card border-b p-4 sm:p-6"><Skeleton className="h-8 w-3/4" /></header>
                     <main className="flex-1 p-4 sm:p-6 md:p-8"><Skeleton className="h-96 w-full" /></main>
                 </div>
            </AuthenticatedLayout>
        );
    }
    
    if (!content) {
        return (
             <AuthenticatedLayout>
                 <div className="flex flex-col h-full">
                    <header className="bg-card border-b p-4 sm:p-6">
                         <Button asChild variant="outline" size="sm" className="mb-4"><Link href={`/student/materi/${chapterId}`}><ArrowLeft className="mr-2 h-4 w-4" />Kembali</Link></Button>
                         <h1 className="text-2xl font-bold">Konten Tidak Tersedia</h1>
                         <p className="text-muted-foreground mt-1">Materi untuk bagian ini belum disiapkan oleh guru.</p>
                    </header>
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
                            <Link href={`/student/materi/${chapterId}`}><ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Peta Petualangan</Link>
                        </Button>
                        <h1 className="text-2xl font-bold text-foreground">A. Menyimak Teks Deskripsi</h1>
                        <p className="text-muted-foreground mt-1">{content.learningObjective}</p>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Kegiatan 1: Menganalisis Teks Deskripsi "Candi Borobudur"</CardTitle>
                                <CardDescription className="text-justify">
                                    Pada kegiatan ini, kalian akan menyimak teks deskripsi dari video YouTube berikut. Setelah menyimak, jawablah pertanyaan-pertanyaan dalam tabel di bawahnya.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {content.youtubeUrl && (
                                    <div className="aspect-video w-full rounded-lg overflow-hidden border">
                                        <iframe className="w-full h-full" src={getYoutubeEmbedUrl(content.youtubeUrl)} title="YouTube: Candi Borobudur" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                    </div>
                                )}
                                 <Card className="bg-slate-50/50">
                                    <CardHeader>
                                        <CardTitle>Tugas: Pernyataan Benar/Salah</CardTitle>
                                        <CardDescription>Berdasarkan video, tentukan apakah pernyataan berikut benar atau salah, lalu berikan bukti informasinya.</CardDescription>
                                    </CardHeader>
                                     <CardContent className="space-y-4">
                                        {content.statements.map((stmt) => {
                                            const answerKey = stmt.no.toString();
                                            const currentAnswer = answers.kegiatan1[answerKey] || { choice: '', evidence: '' };
                                            return (
                                                <div key={stmt.no} className="border p-4 rounded-lg bg-white space-y-3">
                                                    <p className="font-semibold text-justify">{stmt.no}. {stmt.statement}</p>
                                                    <div>
                                                        <Label className="font-medium">Jawaban Anda:</Label>
                                                        <RadioGroup className="flex gap-4 mt-2" onValueChange={(value) => handleAnswerChange('kegiatan1', answerKey, { ...currentAnswer, choice: value })} value={currentAnswer.choice}>
                                                            <div className="flex items-center space-x-2"><RadioGroupItem value="benar" id={`r1-${stmt.no}-benar`} /><Label htmlFor={`r1-${stmt.no}-benar`}>Benar</Label></div>
                                                            <div className="flex items-center space-x-2"><RadioGroupItem value="salah" id={`r1-${stmt.no}-salah`} /><Label htmlFor={`r1-${stmt.no}-salah`}>Salah</Label></div>
                                                        </RadioGroup>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`e1-${stmt.no}`} className="font-medium">Bukti Informasi:</Label>
                                                        <Textarea id={`e1-${stmt.no}`} className="mt-2 bg-white" placeholder="Tuliskan bukti pendukung dari video..." rows={3} onChange={(e) => handleAnswerChange('kegiatan1', answerKey, { ...currentAnswer, evidence: e.target.value })} value={currentAnswer.evidence} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                     </CardContent>
                                 </Card>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Kegiatan 2: Mengevaluasi & Membandingkan Gagasan</CardTitle>
                                <CardDescription className="text-justify">
                                     Jawablah pertanyaan berikut untuk mengevaluasi gagasan dalam video pertama. Kemudian, bandingkan dengan video kedua.
                                </CardDescription>
                            </CardHeader>
                             <CardContent className="space-y-6">
                                {content.activity2Questions.map((question, index) => (
                                    <div key={index} className="space-y-2">
                                        <Label htmlFor={`q2-${index}`}>{index+1}. {question}</Label>
                                        <Textarea id={`q2-${index}`} placeholder="Tuliskan jawaban Anda..." rows={4} value={answers.kegiatan2[index] || ''} onChange={(e) => handleAnswerChange('kegiatan2', index.toString(), e.target.value)} />
                                    </div>
                                ))}
                                <Separator />
                                <CardTitle className="text-base">Video Perbandingan</CardTitle>
                                <CardDescription className="text-justify">Simaklah video berikut, lalu bandingkan dengan video Candi Borobudur sebelumnya. Mana yang menurut Anda lebih baik dalam mendeskripsikan objeknya? Jelaskan jawaban Anda pada kotak di bawah.</CardDescription>
                                {content.comparisonVideoUrl && (
                                     <div className="aspect-video w-full rounded-lg overflow-hidden border">
                                        <iframe className="w-full h-full" src={getYoutubeEmbedUrl(content.comparisonVideoUrl)} title="YouTube: Video Perbandingan" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                    </div>
                                )}
                                 <div className="space-y-2">
                                    <Label htmlFor="q2-comparison">Analisis Perbandingan Anda</Label>
                                    <Textarea id="q2-comparison" placeholder="Tuliskan perbandingan Anda di sini..." rows={5} value={answers.kegiatan2[content.activity2Questions.length] || ''} onChange={(e) => handleAnswerChange('kegiatan2', content.activity2Questions.length.toString(), e.target.value)} />
                                </div>
                             </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Latihan: Analisis Video "Pesona Danau Toba"</CardTitle>
                                <CardDescription className="text-justify">
                                    Untuk memantapkan pemahaman Anda, simaklah video berikut. Kemudian, tentukan apakah pernyataan-pernyataan di bawahnya benar atau salah, dan berikan analisis singkat Anda.
                                </CardDescription>
                            </CardHeader>
                             <CardContent className="space-y-6">
                                {content.latihan?.youtubeUrl && (
                                    <div className="aspect-video w-full rounded-lg overflow-hidden border">
                                        <iframe className="w-full h-full" src={getYoutubeEmbedUrl(content.latihan.youtubeUrl)} title="YouTube: Danau Toba" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                    </div>
                                )}
                                {content.latihan?.statements.map((stmt, index) => {
                                    const answerKey = index.toString();
                                    const currentAnswer = answers.latihan[answerKey] || { choice: '', analysis: '' };
                                    const questionText = stmt.statement;

                                    return (
                                        <div key={index} className="border p-4 rounded-lg bg-slate-50/50 space-y-4">
                                            <p className="font-semibold text-justify">{index + 1}. {questionText}</p>
                                            <div>
                                                <Label className="font-medium">Jawaban Anda:</Label>
                                                <RadioGroup className="flex gap-4 mt-2" onValueChange={(value) => handleAnswerChange('latihan', answerKey, { ...currentAnswer, choice: value })} value={currentAnswer.choice}>
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="benar" id={`r3-${index}-benar`} /><Label htmlFor={`r3-${index}-benar`}>Benar</Label></div>
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="salah" id={`r3-${index}-salah`} /><Label htmlFor={`r3-${index}-salah`}>Salah</Label></div>
                                                </RadioGroup>
                                            </div>
                                            <div>
                                                <Label htmlFor={`a3-${index}`} className="font-medium">Jika tidak, seharusnya bagaimana? Berikan analisis singkat Anda.</Label>
                                                <Textarea id={`a3-${index}`} className="mt-2 bg-white" placeholder="Tuliskan analisis singkat Anda..." rows={4} onChange={(e) => handleAnswerChange('latihan', answerKey, { ...currentAnswer, analysis: e.target.value })} value={currentAnswer.analysis} />
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


                        <Button type="submit" disabled={isSubmitting || loading} className="w-full" size="lg">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Semua Progres Latihan'}
                        </Button>
                    </form>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
