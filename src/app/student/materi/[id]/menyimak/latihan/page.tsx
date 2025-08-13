
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PencilRuler, ArrowLeft, Loader2, Save, CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useParams, useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { generateFeedback } from '@/ai/flows/generate-feedback-flow';

type LatihanStatement = {
    statement: string;
};

type LatihanContent = {
  youtubeUrl: string;
  statements: LatihanStatement[];
};

type Answers = Record<string, { choice: 'benar' | 'salah' | ''; analysis: string }>;
type AiFeedback = Record<string, { feedback: string; isLoading: boolean }>;

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

export default function MenyimakLatihanPage() {
    const params = useParams();
    const router = useRouter();
    const chapterId = params.id as string;
    
    const [content, setContent] = useState<LatihanContent | null>(null);
    const [answers, setAnswers] = useState<Answers>({});
    const [aiFeedback, setAiFeedback] = useState<AiFeedback>({});
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
                
                if (contentSnap.exists() && contentSnap.data().menyimak?.latihan) {
                    setContent(contentSnap.data().menyimak.latihan);
                }

                if (submissionSnap.exists()) {
                    setAnswers(submissionSnap.data().answers?.latihan || {});
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

    const handleAnswerChange = (key: string, type: 'choice' | 'analysis', value: string) => {
        setAnswers(prev => ({
            ...prev,
            [key]: {
                ...(prev[key] || { choice: '', analysis: '' }),
                [type]: value
            }
        }));
    };
    
    const handleGenerateFeedback = async (key: string) => {
        const question = content?.statements[Number(key) - 1]?.statement;
        const answer = answers[key]?.analysis;

        if (!question || !answer) {
            toast({ variant: 'destructive', title: 'Jawaban Kosong', description: 'Harap isi analisis Anda sebelum meminta umpan balik.'});
            return;
        }

        setAiFeedback(prev => ({ ...prev, [key]: { feedback: '', isLoading: true } }));

        try {
            const result = await generateFeedback({ question, answer });
            setAiFeedback(prev => ({ ...prev, [key]: { feedback: result.feedback, isLoading: false } }));
        } catch (error) {
            console.error('Error generating feedback:', error);
            toast({ variant: 'destructive', title: 'Gagal', description: 'Tidak dapat menghasilkan umpan balik saat ini.'});
            setAiFeedback(prev => ({ ...prev, [key]: { feedback: '', isLoading: false } }));
        }
    }

    const handleSubmit = async () => {
        if (!user) return toast({ variant: "destructive", title: "Anda harus masuk." });
        
        setIsSubmitting(true);
        try {
            const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_menyimak`);
            
            // Get existing answers and merge new ones
            const submissionSnap = await getDoc(submissionRef);
            const existingAnswers = submissionSnap.exists() ? submissionSnap.data().answers : {};
            const mergedAnswers = { ...existingAnswers, latihan: answers };

             await setDoc(submissionRef, { 
                studentId: user.uid,
                chapterId: chapterId,
                activity: 'menyimak',
                lastSubmitted: serverTimestamp(),
                answers: mergedAnswers
            }, { merge: true });
            
            toast({
                title: "Latihan Selesai!",
                description: "Jawaban latihan Anda telah disimpan. Petualangan Menyimak telah selesai!",
                className: "bg-green-100 border-green-300 text-green-800",
                duration: 5000,
            });
            router.push(`/student/materi/${chapterId}`);

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
                            <PencilRuler className="w-8 h-8 text-primary" />
                            Latihan Mandiri
                        </h1>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8">
                     <div className="max-w-4xl mx-auto space-y-8">
                        
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader><CardTitle className="text-blue-800">Panduan Latihan</CardTitle></CardHeader>
                            <CardContent className="text-blue-700 space-y-2 text-sm">
                                <p><strong>Langkah 1:</strong> Simak video tentang pesona Danau Toba.</p>
                                <p><strong>Langkah 2:</strong> Untuk setiap pernyataan di Tabel 1.2, tentukan apakah narator dalam video menyampaikannya dengan benar atau salah.</p>
                                <p><strong>Langkah 3:</strong> Jika Anda menjawab "Salah", tuliskan analisis atau koreksi Anda pada kolom yang disediakan.</p>
                                <p><strong>Langkah 4 (Opsional):</strong> Klik tombol "Dapatkan Umpan Balik AI" untuk mendapatkan masukan otomatis tentang analisis Anda.</p>
                                <p><strong>Langkah 5:</strong> Setelah selesai, klik tombol "Selesaikan Latihan" di bagian bawah halaman.</p>
                            </CardContent>
                        </Card>

                        {loading ? (
                            <Skeleton className="h-96 w-full" />
                        ) : content ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Video Latihan: Pesona Danau Toba</CardTitle>
                                    <CardDescription>
                                        Simaklah tayangan deskripsi pada video berikut. Setelah itu, isi Tabel 1.2 untuk memberikan analisis Anda.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {content.youtubeUrl && (
                                        <div className="aspect-video w-full rounded-lg overflow-hidden border">
                                            <iframe className="w-full h-full" src={getYoutubeEmbedUrl(content.youtubeUrl)} title="Pesona Danau Toba" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                        </div>
                                    )}
                                    <Card className="bg-slate-50 border-slate-200">
                                        <CardHeader>
                                            <CardTitle>Tabel 1.2 Pernyataan Penilaian</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Pernyataan</TableHead>
                                                        <TableHead className="w-[150px] text-center">Benar / Salah</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {(content.statements || []).map((item, index) => {
                                                        const answerKey = String(index + 1);
                                                        const currentFeedback = aiFeedback[answerKey];
                                                        return (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <p className="text-justify">{index + 1}. {item.statement}</p>
                                                                <Label className="mt-4 block font-medium">Jika tidak, seharusnya....</Label>
                                                                <Textarea
                                                                    className="mt-2 bg-white"
                                                                    placeholder="Tuliskan analisis Anda..."
                                                                    onChange={e => handleAnswerChange(answerKey, 'analysis', e.target.value)}
                                                                    value={answers[answerKey]?.analysis || ''}
                                                                />
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    className="mt-2"
                                                                    onClick={() => handleGenerateFeedback(answerKey)}
                                                                    disabled={currentFeedback?.isLoading}
                                                                >
                                                                    {currentFeedback?.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4 text-yellow-500"/>}
                                                                    Dapatkan Umpan Balik AI
                                                                </Button>
                                                                {currentFeedback && (
                                                                    <Card className="mt-3 bg-indigo-50 border-indigo-200">
                                                                        <CardContent className="p-3 text-sm text-indigo-900">
                                                                            {currentFeedback.isLoading ? <Skeleton className="h-5 w-3/4" /> : currentFeedback.feedback}
                                                                        </CardContent>
                                                                    </Card>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <RadioGroup
                                                                    className="flex flex-col space-y-2 items-center justify-center"
                                                                    onValueChange={(value) => handleAnswerChange(answerKey, 'choice', value)}
                                                                    value={answers[answerKey]?.choice || ''}
                                                                >
                                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="benar" id={`l-${index}-benar`} /><Label htmlFor={`l-${index}-benar`}>Benar</Label></div>
                                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="salah" id={`l-${index}-salah`} /><Label htmlFor={`l-${index}-salah`}>Salah</Label></div>
                                                                </RadioGroup>
                                                            </TableCell>
                                                        </TableRow>
                                                    )})}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                </CardContent>
                            </Card>
                        ) : (
                             <Card><CardContent className="p-6 text-center text-muted-foreground">Konten untuk latihan ini belum tersedia.</CardContent></Card>
                        )}
                        
                         <div className="flex justify-between items-center">
                            <Button variant="outline" onClick={() => router.push(`/student/materi/${chapterId}/menyimak/kegiatan-2`)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Kegiatan 2
                            </Button>
                            <Button size="lg" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting || loading} onClick={handleSubmit}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                                Selesaikan Petualangan Menyimak
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
