
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
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

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
        if (!user) {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Anda harus masuk untuk mengirimkan jawaban.' });
            return;
        }
        setIsSubmitting(true);
        
        const formData = new FormData(e.currentTarget);
        const answers: { [key: string]: string } = {};
        formData.forEach((value, key) => {
            answers[key] = value as string;
        });

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
                                <CardDescription className="text-justify">Bacalah teks berjudul <strong>“Keindahan Alam Indonesia”</strong> untuk menjawab soal 1-6.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="prose prose-sm max-w-none bg-slate-50 border rounded-lg p-4 text-justify">
                                    <h3 className="text-center font-bold">Keindahan Alam Indonesia</h3>
                                    <p>Indonesia adalah negara dengan kekayaan alam yang melimpah ruah dari Sabang hingga Merauke. Keindahan alam Indonesia memang dinilai tak ada yang mampu menandingi di negara mana pun di dunia. Hampir semua pesona alam terdapat di Indonesia mulai dari daratan hingga laut. Oleh sebab itu, tidak heran apabila banyak wisatawan asing yang rela datang jauh-jauh ke Indonesia untuk menikmati keindahan alam bumi pertiwi.</p>
                                    <p>Selain keindahan alam yang disajikan ternyata di dalam keindahan tersebut terdapat banyak hal tersembunyi yang jarang diketahui seperti flora dan fauna yang sangat langka dan eksotis. Alam Indonesia yang paling tersohor di mata dunia adalah keindahan pantainya yang terbentang dari barat hingga ke timur. Banyaknya pulau yang ada di Indonesia membuat kekayaan laut dan pantai semakin berwarna.</p>
                                    <p>Selain pantai, keindahan dunia bawah laut juga menjadi incaran para wisatawan untuk masuk ke dalamnya dan ikut menikmati kehidupan bawah laut di Indonesia. Daerah yang memiliki keindahan pantai yang menakjubkan di Indonesia yang paling tersohor adalah Manado, Bali, dan Raja Ampat.</p>
                                    <p>Tidak hanya keindahan pantai, Indonesia juga merupakan negara dengan cangkupan hutan terbesar di Dunia. Oleh karena itu, Indonesia disebut sebagai paru-paru dunia sebab ⅓ hutan di dunia terdapat di Indonesia. Keindahan hutan di Indonesia memang tak perlu diragukan lagi, sebab memang hijau hamparan pohon membuat mata seakan terhipnotis. Selain itu, hewan dan tumbuhan endemik juga banyak yang menjadi buruan wisatawan yang hanya untuk berfoto untuk mengabadikan momen tersebut.</p>
                                     <p className="text-xs italic">Sumber: https://notepam.com/contoh-teks-deskripsi/</p>
                                </div>
                                <div className="space-y-4">
                                {assessmentQuestions1.map((q, i) => (
                                    <div key={i} className="space-y-2">
                                        <Label htmlFor={`q1-${i}`} className="text-justify">{i + 1}. {q}</Label>
                                        <Textarea id={`q1-${i}`} name={`q1-${i}`} placeholder="Tuliskan jawaban Anda di sini..." rows={4} required />
                                    </div>
                                ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bagian II */}
                         <Card>
                            <CardHeader>
                                <CardTitle>Bagian II: Perbandingan Video Deskripsi</CardTitle>
                                <CardDescription className="text-justify">Simaklah dua teks deskripsi pada youtube berikut ini untuk menjawab soal nomor 7-10.</CardDescription>
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
                                        <Label htmlFor={`q2-${i}`} className="text-justify">{i + 7}. {q}</Label>
                                        <Textarea id={`q2-${i}`} name={`q2-${i}`} placeholder="Tuliskan jawaban Anda di sini..." rows={4} required />
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
