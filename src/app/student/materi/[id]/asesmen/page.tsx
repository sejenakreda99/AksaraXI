
'use client';

import { useState } from 'react';
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
    
    // In a real app, this would be fetched from Firestore
    const assessmentQuestions1 = [
        "Apa sebenarnya gagasan dan pandangan yang ingin disampaikan penulis dalam teks tersebut?",
        "Apakah gagasan dan pandangan yang disampaikan penulis itu tertata dengan sistematetis dan logis?",
        "Sudah cukup kuatkah penulis menyampaikan argumennya dalam upaya menjaga lingkungan hidup?",
        "Apakah fakta atau realita yang dikemukakannya dapat mendukung gagasan dan pandangan yang ingin disampaikan?",
        "Apakah bahasa yang digunakan sudah tepat untuk menyampaikan gagasan dan pandangan penulis dalam teks tersebut?",
        "Tulislah kembali teks tersebut menjadi teks deksripsi."
    ];

    const assessmentQuestions2 = [
      "Apa gagasan dalam teks 2?",
      "Apa pandangan dalam teks 2?",
      "Bandingkan gagasan teks deskripsi 1 dan 2, mana teks yang menyampaiakan gagasan dengan lengkap menggunakan data dan mana yang kurang lengkap? Berikan buktinya.",
      "Bandingkan pandangan dari kedua teks tersebut, mana yang lebih menarik menurut kalian? Berikan alasan."
    ]

    const youtubeLinks = [
      "https://youtu.be/u1yo-uJDsU4",
      "https://youtu.be/waYM6QorBxw"
    ]


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        // TODO: Implement Firebase submission logic
        console.log("Submitting assessment...");

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
            title: "Asesmen Disimpan",
            description: "Jawaban asesmen Anda telah berhasil disimpan dan akan segera dinilai oleh guru.",
        });

        setIsSubmitting(false);
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
                        <h1 className="text-2xl font-bold text-foreground capitalize">E. Asesmen</h1>
                        <p className="text-muted-foreground mt-1">Bab {chapterId}: Membicarakan Teks Deskripsi</p>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8">
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                         {/* Bagian I */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Bagian I: Analisis Teks "Keindahan Alam Indonesia"</CardTitle>
                                <CardDescription>Bacalah teks berikut dengan saksama dan jawablah pertanyaan di bawahnya.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="prose prose-sm max-w-none bg-slate-50 border rounded-lg p-4">
                                    <h3 className="text-center">Keindahan Alam Indonesia</h3>
                                    <p>Indonesia adalah negara dengan kekayaan alam yang melimpah ruah dari Sabang hingga Merauke. Keindahan alam Indonesia memang dinilai tak ada yang mampu menandingi di negara mana pun di dunia...</p>
                                    <p>(Teks lengkap ditampilkan di sini)</p>
                                </div>
                                <div className="space-y-4">
                                {assessmentQuestions1.map((q, i) => (
                                    <div key={i} className="space-y-2">
                                        <Label htmlFor={`q1-${i}`}>{i + 1}. {q}</Label>
                                        <Textarea id={`q1-${i}`} placeholder="Tuliskan jawaban Anda di sini..." rows={4} />
                                    </div>
                                ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bagian II */}
                         <Card>
                            <CardHeader>
                                <CardTitle>Bagian II: Perbandingan Video Deskripsi</CardTitle>
                                <CardDescription>Simaklah dua video berikut, lalu jawablah pertanyaan perbandingannya.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {youtubeLinks.map((link, i) => (
                                        <div key={i} className="aspect-video w-full rounded-lg overflow-hidden border">
                                            <iframe className="w-full h-full" src={getYoutubeEmbedUrl(link)} title={`YouTube video ${i+1}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                {assessmentQuestions2.map((q, i) => (
                                    <div key={i} className="space-y-2">
                                        <Label htmlFor={`q2-${i}`}>{i + 7}. {q}</Label>
                                        <Textarea id={`q2-${i}`} placeholder="Tuliskan jawaban Anda di sini..." rows={4} />
                                    </div>
                                ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isSubmitting ? "Menyimpan..." : "Kirim Jawaban Asesmen"}
                        </Button>
                    </form>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
