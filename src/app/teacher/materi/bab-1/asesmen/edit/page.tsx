
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { TeacherHeader } from '@/components/layout/teacher-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

type AsesmenContent = {
    part1IntroText: string;
    part1Text: string;
    part1Questions: string[];
    part2IntroText: string;
    youtubeLinks: string[];
    part2Questions: string[];
}

const defaultContent: AsesmenContent = {
    part1IntroText: 'Bacalah teks berjudul “Keindahan Alam Indonesia” untuk menjawab soal 1-6.',
    part1Text: `Indonesia adalah negara dengan kekayaan alam yang melimpah ruah dari Sabang hingga Merauke. Keindahan alam Indonesia memang dinilai tak ada yang mampu menandingi di negara mana pun di dunia...\n\n(Teks lengkap seperti di pratinjau)`,
    part1Questions: [
        "Apa sebenarnya gagasan dan pandangan yang ingin disampaikan penulis dalam teks tersebut?",
        "Apakah gagasan dan pandangan yang disampaikan penulis itu tertata dengan sistematetis dan logis?",
        "Sudah cukup kuatkah penulis menyampaikan argumennya dalam upaya menjaga lingkungan hidup?",
        "Apakah fakta atau realita yang dikemukakannya dapat mendukung gagasan dan pandangan yang ingin disampaikan?",
        "Apakah bahasa yang digunakan sudah tepat untuk menyampaikan gagasan dan pandangan penulis dalam teks tersebut?",
        "Tulislah kembali teks tersebut menjadi teks deksripsi."
    ],
    part2IntroText: 'Simaklah dua teks deskripsi pada kode QR atau youtube berikut ini untuk menjawab soal nomor 7-10.',
    youtubeLinks: [
        'https://youtu.be/u1yo-uJDsU4',
        'https://youtu.be/waYM6QorBxw'
    ],
    part2Questions: [
        "Apa gagasan dalam teks 2?",
        "Apa pandangan dalam teks 2?",
        "Bandingkan gagasan teks deskripsi 1 dan 2, mana teks yang menyampaiakan gagasan dengan lengkap menggunakan data dan mana yang kurang lengkap? Berikan buktinya.",
        "Bandingkan pandangan dari kedua teks tersebut, mana yang lebih menarik menurut kalian? Berikan alasan."
    ]
};

export default function EditAsesmenPage() {
    const [content, setContent] = useState<AsesmenContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        async function fetchContent() {
            setLoading(true);
            try {
                const docRef = doc(db, 'chapters', '1');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().asesmen) {
                    setContent(docSnap.data().asesmen);
                } else {
                    setContent(defaultContent);
                }
            } catch (error) {
                console.error("Failed to fetch content:", error);
                toast({ variant: "destructive", title: "Gagal Memuat Konten" });
            } finally {
                setLoading(false);
            }
        }
        fetchContent();
    }, [toast]);
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!content) return;

        const finalContent = {
            ...content,
            part1Questions: content.part1Questions.filter(q => q.trim() !== ''),
            part2Questions: content.part2Questions.filter(q => q.trim() !== ''),
            youtubeLinks: content.youtubeLinks.filter(l => l.trim() !== ''),
        };

        startTransition(async () => {
            try {
                const docRef = doc(db, 'chapters', '1');
                await setDoc(docRef, { asesmen: finalContent }, { merge: true });
                toast({ title: "Berhasil", description: "Konten Asesmen berhasil diperbarui." });
                router.push('/teacher/materi/bab-1/asesmen');
            } catch (error) {
                toast({ variant: "destructive", title: "Gagal Menyimpan Data" });
                console.error("Error updating document:", error);
            }
        });
    };

    if (loading || !content) {
        return (
            <AuthenticatedLayout>
                 <div className="flex flex-col h-full">
                    <TeacherHeader title="Edit Asesmen" description="Ubah konten asesmen untuk Bab 1." />
                    <main className="flex-1 p-4 md:p-8"><div className="max-w-4xl mx-auto"><Skeleton className="h-96 w-full" /></div></main>
                </div>
            </AuthenticatedLayout>
        );
    }
    

    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-full">
                <TeacherHeader title="Edit Asesmen" description="Ubah konten asesmen untuk Bab 1." />
                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-4">
                             <Button asChild variant="outline">
                                <Link href="/teacher/materi/bab-1/asesmen"><ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Pratinjau</Link>
                            </Button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Bagian I: Analisis Teks</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="part1IntroText">Teks Pengantar</Label>
                                        <Textarea id="part1IntroText" value={content.part1IntroText} onChange={e => setContent({...content, part1IntroText: e.target.value})} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="part1Text">Teks Utama ("Keindahan Alam Indonesia")</Label>
                                        <Textarea id="part1Text" value={content.part1Text} onChange={e => setContent({...content, part1Text: e.target.value})} rows={10} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="part1Questions">Pertanyaan Bagian I</Label>
                                        <Textarea id="part1Questions" value={content.part1Questions.join('\n')} onChange={e => setContent({...content, part1Questions: e.target.value.split('\n')})} rows={8} placeholder="Satu pertanyaan per baris..." />
                                    </div>
                                </CardContent>
                            </Card>

                             <Card>
                                <CardHeader>
                                    <CardTitle>Bagian II: Perbandingan Video</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="part2IntroText">Teks Pengantar</Label>
                                        <Textarea id="part2IntroText" value={content.part2IntroText} onChange={e => setContent({...content, part2IntroText: e.target.value})} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="youtubeLinks">Tautan Video YouTube</Label>
                                        <Textarea id="youtubeLinks" value={content.youtubeLinks.join('\n')} onChange={e => setContent({...content, youtubeLinks: e.target.value.split('\n')})} rows={3} placeholder="Satu tautan YouTube per baris..."/>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="part2Questions">Pertanyaan Bagian II</Label>
                                        <Textarea id="part2Questions" value={content.part2Questions.join('\n')} onChange={e => setContent({...content, part2Questions: e.target.value.split('\n')})} rows={5} placeholder="Satu pertanyaan per baris..."/>
                                    </div>
                                </CardContent>
                            </Card>

                             <Button type="submit" disabled={isPending} className="w-full" size="lg">
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {isPending ? 'Menyimpan...' : 'Simpan Perubahan Asesmen'}
                            </Button>
                        </form>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}

