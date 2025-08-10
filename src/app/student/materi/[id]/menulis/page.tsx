
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, Save, CheckCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

// --- Types ---
type ChecklistItem = {
    text: string;
};

type MenulisContent = {
    learningObjective: string;
    kegiatan1Intro: string;
    kegiatan1Steps: { title: string; description: string }[];
    latihanIntro: string;
    latihanGuidelines: string[];
    checklistItems: ChecklistItem[];
    kegiatan2Intro: string;
    kegiatan2Tips: string[];
    youtubeLinks: string[];
};

type MenulisAnswers = {
    checklist: Record<number, boolean>;
    finalText: string;
    submissionLink: string;
}

const steps = [
    { id: 'tujuan', title: 'Tujuan & Pengantar' },
    { id: 'langkah', title: 'Langkah Menulis' },
    { id: 'panduan', title: 'Panduan Latihan' },
    { id: 'checklist', title: 'Cek Mandiri' },
    { id: 'pengumpulan', title: 'Pengumpulan Karya' },
    { id: 'publikasi', title: 'Tips Publikasi' },
];

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

// --- Main Component ---
export default function MenulisSiswaPage() {
    const params = useParams();
    const chapterId = params.id as string;
    const [content, setContent] = useState<MenulisContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user] = useAuthState(auth);
    const { toast } = useToast();
    const [answers, setAnswers] = useState<MenulisAnswers>({ checklist: {}, finalText: '', submissionLink: '' });
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        async function fetchContent() {
            if (!chapterId) return;
            setLoading(true);
            try {
                const docRef = doc(db, 'chapters', chapterId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().menulis) {
                    setContent(docSnap.data().menulis as MenulisContent);
                } else {
                    console.error("Content for 'menulis' not found!");
                }
            } catch (error) {
                console.error("Failed to fetch content:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchContent();
    }, [chapterId]);
    
    const handleChecklistChange = (index: number, checked: boolean) => {
        setAnswers(prev => ({
            ...prev,
            checklist: { ...prev.checklist, [index]: checked }
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user) return toast({ variant: "destructive", title: "Error", description: "Anda harus masuk untuk mengirimkan jawaban." });
        
        if (answers.finalText.trim() === '' && answers.submissionLink.trim() === '') {
            return toast({ variant: "destructive", title: "Tugas Belum Lengkap", description: "Anda harus mengisi teks deskripsi atau memberikan tautan publikasi." });
        }
        
        setIsSubmitting(true);
        try {
            const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_menulis`);
            await setDoc(submissionRef, {
                studentId: user.uid,
                chapterId: chapterId,
                activity: 'menulis',
                answers,
                lastSubmitted: serverTimestamp()
            }, { merge: true });
            
            toast({ title: "Berhasil!", description: "Tugas menulis Anda telah berhasil dikumpulkan." });
            setCurrentStep(steps.length);
        } catch (error) {
            console.error("Error submitting task:", error);
            toast({ variant: "destructive", title: "Gagal Menyimpan", description: "Terjadi kesalahan saat mengumpulkan tugas." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const progressPercentage = useMemo(() => {
        if (currentStep >= steps.length) return 100;
        return ((currentStep + 1) / (steps.length + 1)) * 100;
    }, [currentStep]);

    const renderStepContent = () => {
        if (loading || !content) {
            return <Card><CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent></Card>;
        }

        if (currentStep >= steps.length) {
            return (
                <Card className="text-center p-8">
                    <CardHeader>
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                        <CardTitle className="text-2xl">Kegiatan Selesai!</CardTitle>
                        <CardDescription>Anda telah menyelesaikan kegiatan Menulis Teks Deskripsi. Jawaban Anda sudah disimpan dan akan dinilai oleh guru.</CardDescription>
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
            );
        }
        
        switch (steps[currentStep].id) {
            case 'tujuan':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>C. Menulis Teks Deskripsi</CardTitle>
                            <CardDescription>{content.learningObjective}</CardDescription>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none whitespace-pre-wrap">
                            <p>{content.kegiatan1Intro}</p>
                        </CardContent>
                    </Card>
                );
            case 'langkah':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Kegiatan 1: Langkah-Langkah Menulis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {content.kegiatan1Steps.map((step, index) => (
                                <div key={index} className="p-4 bg-slate-50 border rounded-lg">
                                    <h3 className="font-semibold text-primary">{index + 1}. {step.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{step.description}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                );
            case 'panduan':
                 return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Latihan: Panduan Menulis</CardTitle>
                            <CardDescription>{content.latihanIntro}</CardDescription>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none text-justify">
                           <ol className="list-decimal list-outside pl-5 space-y-2">
                               {content.latihanGuidelines.map((item, index) => <li key={index}>{item}</li>)}
                           </ol>
                        </CardContent>
                    </Card>
                );
            case 'checklist':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tabel 1.5: Memeriksa Unsur Tulisan</CardTitle>
                            <CardDescription>Gunakan tabel ini untuk memeriksa kembali hasil karangan kalian. Centang "Ya" jika sudah sesuai.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Unsur yang Diperiksa</TableHead>
                                        <TableHead className="w-[100px] text-center">Ya</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {content.checklistItems.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.text}</TableCell>
                                            <TableCell className="text-center">
                                                <Checkbox id={`check-${index}`} checked={answers.checklist[index] || false} onCheckedChange={(checked) => handleChecklistChange(index, !!checked)} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                );
            case 'pengumpulan':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pengumpulan Karya</CardTitle>
                            <CardDescription>Tulis teks deskripsi Anda di bawah ini, atau tempelkan tautan ke karya Anda jika dipublikasikan di media lain.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div>
                                <Label htmlFor="finalText" className="font-semibold">Teks Deskripsi Anda</Label>
                                <Textarea id="finalText" className="mt-2 min-h-[250px]" placeholder="Mulai tulis teks deskripsi Anda di sini..." value={answers.finalText} onChange={e => setAnswers(prev => ({...prev, finalText: e.target.value}))}/>
                            </div>
                            <Separator>
                               <span className="bg-background px-2 text-sm text-muted-foreground">ATAU</span>
                            </Separator>
                             <div>
                                <Label htmlFor="submissionLink" className="font-semibold">Tautan Publikasi (Opsional)</Label>
                                <Input id="submissionLink" className="mt-2" placeholder="https://tiktok.com/..." value={answers.submissionLink} onChange={e => setAnswers(prev => ({...prev, submissionLink: e.target.value}))}/>
                                <p className="text-xs text-muted-foreground mt-1">Tempelkan tautan ke TikTok, YouTube, Instagram, Blog, dll.</p>
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'publikasi':
                 return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Kegiatan 2: Menyempurnakan Teks untuk Publikasi</CardTitle>
                            <CardDescription className="whitespace-pre-wrap">{content.kegiatan2Intro}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             {(content.kegiatan2Tips && content.kegiatan2Tips.length > 0 && content.kegiatan2Tips[0]) && (
                                <div className="prose prose-sm max-w-none text-justify">
                                    <h4 className="font-semibold">Tips Publikasi</h4>
                                    <ol className="list-decimal list-outside pl-5 space-y-2">
                                        {content.kegiatan2Tips.map((tip, index) => <li key={index}>{tip}</li>)}
                                    </ol>
                                </div>
                             )}
                            {(content.youtubeLinks && content.youtubeLinks.length > 0 && content.youtubeLinks[0]) && <Separator />}
                            {(content.youtubeLinks && content.youtubeLinks.length > 0 && content.youtubeLinks[0]) && (
                                <div>
                                    <h4 className="font-semibold mb-4">Video Referensi</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {content.youtubeLinks.map((link, index) => (
                                            link && <div key={index} className="aspect-video w-full rounded-lg overflow-hidden border">
                                                <iframe className="w-full h-full" src={getYoutubeEmbedUrl(link)} title={`YouTube video ${index+1}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-full">
                <header className="bg-card border-b p-4 sm:p-6 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <Button asChild variant="outline" size="sm" className="mb-4">
                            <Link href={`/student/materi/${chapterId}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Peta Petualangan
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold text-foreground capitalize">C. Menulis Teks Deskripsi</h1>
                        <p className="text-muted-foreground mt-1">Bab {chapterId}: Membicarakan Teks Deskripsi</p>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium text-muted-foreground">
                                <span>Langkah {currentStep >= steps.length ? steps.length + 1 : currentStep + 1} dari {steps.length + 1}</span>
                                <span>{steps[currentStep]?.title || 'Selesai'}</span>
                            </div>
                            <Progress value={progressPercentage} className="w-full" />
                        </div>
                        
                        <div>{renderStepContent()}</div>
                        
                        {currentStep < steps.length && (
                            <div className="flex justify-between items-center">
                                <Button type="button" variant="outline" onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 0}>
                                    <ArrowLeft className="mr-2 h-4 w-4"/>
                                    Kembali
                                </Button>
                                {steps[currentStep].id !== 'publikasi' ? (
                                    <Button type="button" onClick={() => setCurrentStep(s => s + 1)}>
                                        Lanjut
                                        <ArrowRight className="ml-2 h-4 w-4"/>
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={isSubmitting || loading}>
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        {isSubmitting ? 'Mengirim...' : 'Selesai & Kirim Tugas'}
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

    