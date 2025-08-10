'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { TeacherHeader } from '@/components/layout/teacher-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save, PlusCircle, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

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

const defaultContent: MenulisContent = {
    learningObjective: "Menulis gagasan dalam bentuk teks deskripsi",
    kegiatan1Intro: "Pada pembelajaran kali ini, kalian akan belajar menulis teks deskripsi. Sebelum menulis teks deskripsi, tentu saja kalian harus melakukan pengamatan terhadap objek yang akan dideskrispsikan.",
    kegiatan1Steps: [
        { title: "Menentukan topik", description: "Topik dalam teks deskripsi dapat ditentukan sesuai dengan tujuan penulisan atau kebutuhan informasi hal atau barang yang dideskripsikan." },
        { title: "Membuat kerangka", description: "Kerangka karangan untuk penulisan teks deskripsi tetap dibutuhkan agar hal atau barang yang dideskripsikan dapat digambarkan ciri-cirinya sesuai dengan yang sebenarnya." },
        { title: "Menulis teks deskripsi dengan memperhatikan keutuhan dan keterpaduan", description: "Proses penulisan dapat dilakukan dengan lancar mengikuti kerangka karangan yang telah disusun sebelumnya. Keutuhan dan keterpaduan teks deskripsi dapat diperhatikan dengan mempertimbangkan konjungsi, struktur kalimat, ejaan, tanda baca, dan unsur kebahasaan lainnya." }
    ],
    latihanIntro: "Pada latihan kali ini, kalian akan belajar menulis teks deskripsi. Sebelum menulis teks deskripsi, tentu saja kalian harus melakukan pengamatan terhadap objek yang akan dideskrispsikan. Agar tulisan deskripsi kalian menarik sehingga seolah-olah dapat dilihat, didengar, atau dirasakan, perhatikanlah panduan berikut.",
    latihanGuidelines: [
        "Tentukan objek yang akan kalian deskripsikan...",
        "Tentukan rincian apa saja dari objek yang akan kalian deskripsikan itu...",
        "Lakukanlah pengamatan terhadap objek-objek...",
        "Buatlah kerangka karangannya terlebih dahulu...",
        "Kembangkanlah kerangka karangan yang telah disusun...",
        "Perhatikan pula subjektivitas kalian dalam menulis...",
        "Periksa kembali hasil karangan kalian..."
    ],
    checklistItems: [
        { text: "Penulisan setiap kata pada judul diawali dengan huruf kapital atau huruf besar, kecuali kata tugas (kata depan, kata penghubung, kata seru, kata sandang, dan partikel penegas)." },
        { text: "Judul tidak diakhiri dengan tanda baca." },
        { text: "Teks deskripsi dimulai dengan gambaran umum." },
        { text: "Teks memuat deskripsi bagian." },
        { text: "Teks mengandung kesan-kesan yang menyenangkan." },
        { text: "Teks sudah memperhatikan kaidah kebahasaan deskripsi." },
        { text: "Gagasan dalam teks deskripsi disajikan dengan menarik." },
        { text: "Pandangan dalam teks deskripsi disajikan dengan menarik." }
    ],
    kegiatan2Intro: "Kalian sudah belajar menulis teks deskripsi dan saling menilai antarteman atas hasil tulisan kalian...",
    kegiatan2Tips: [
        "Tentukan media yang akan menjadi sasaran naskah kita...",
        "Buat judul yang menarik...",
        "Pastikan tulisan sudah memenuhi syarat tata tulis...",
        "Perhatikan panjang tulisan...",
        "Penggunaan bahasa...",
        "Untuk tulisan berbentuk teks deskripsi, akan lebih baik jika disertakan foto jurnalistik..."
    ],
    youtubeLinks: [
        "https://youtu.be/5qmAdX4ez-g?si=t7sRBzT6aQpa634S",
        "https://youtu.be/dsyuDCmDCAs?si=fj5q6aybekODR-oQ",
        "https://youtu.be/ROcDzEfFIro?si=3SQDaJqWZjr-VS5F"
    ]
};

export default function EditMenulisPage() {
    const [content, setContent] = useState<MenulisContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        async function fetchContent() {
            try {
                const docRef = doc(db, 'chapters', '1');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().menulis) {
                     setContent(docSnap.data().menulis);
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

    const handleChecklistItemChange = (index: number, value: string) => {
        if (!content) return;
        const newItems = [...content.checklistItems];
        newItems[index] = { text: value };
        setContent({ ...content, checklistItems: newItems });
    };

    const addChecklistItem = () => {
        if (!content) return;
        setContent({ ...content, checklistItems: [...content.checklistItems, { text: '' }] });
    };

    const removeChecklistItem = (index: number) => {
        if (!content) return;
        const newItems = content.checklistItems.filter((_, i) => i !== index);
        setContent({ ...content, checklistItems: newItems });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!content) return;

        startTransition(async () => {
            try {
                const docRef = doc(db, 'chapters', '1');
                await setDoc(docRef, { menulis: content }, { merge: true });
                toast({ title: "Berhasil", description: "Konten Menulis berhasil diperbarui." });
                router.push('/teacher/materi/bab-1/menulis');
            } catch (error) {
                console.error("Error updating document:", error);
                toast({ variant: "destructive", title: "Gagal Menyimpan Data" });
            }
        });
    };
    
    if (loading || !content) {
        return (
          <AuthenticatedLayout>
            <div className="flex flex-col h-full">
              <TeacherHeader title="Edit Konten Menulis" description="Ubah konten teks dan panduan untuk bagian Menulis." />
              <main className="flex-1 p-4 md:p-8"><div className="max-w-4xl mx-auto"><Skeleton className="h-96 w-full" /></div></main>
            </div>
          </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-full">
                <TeacherHeader title="Edit Konten Menulis" description="Kelola materi untuk kegiatan menulis teks deskripsi." />
                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-4">
                            <Button asChild variant="outline">
                                <Link href="/teacher/materi/bab-1/menulis"><ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Pratinjau</Link>
                            </Button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Konten Umum</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="learningObjective">Tujuan Pembelajaran</Label>
                                        <Textarea id="learningObjective" value={content.learningObjective} onChange={(e) => setContent({...content, learningObjective: e.target.value})} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Kegiatan 1 & Latihan</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Langkah-Langkah Menulis</Label>
                                        <Textarea value={content.kegiatan1Steps.map(s => `${s.title}\n${s.description}`).join('\n\n')} onChange={(e) => {
                                            const steps = e.target.value.split('\n\n').map(chunk => {
                                                const [title, ...desc] = chunk.split('\n');
                                                return { title: title || '', description: desc.join('\n') };
                                            });
                                            setContent({...content, kegiatan1Steps: steps });
                                        }} rows={10} placeholder="Title\nDescription..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Panduan Latihan</Label>
                                        <Textarea value={content.latihanGuidelines.join('\n')} onChange={e => setContent({...content, latihanGuidelines: e.target.value.split('\n')})} rows={10} placeholder="Satu panduan per baris..."/>
                                    </div>
                                     <Separator />
                                     <div className="space-y-4">
                                        <Label className="text-base font-semibold">Tabel Checklist Diri</Label>
                                        {content.checklistItems.map((item, index) => (
                                          <Card key={index} className="p-4 bg-slate-50/50 flex justify-between items-center">
                                            <Textarea value={item.text} onChange={(e) => handleChecklistItemChange(index, e.target.value)} placeholder={`Isi teks checklist...`} rows={2} className="flex-1"/>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeChecklistItem(index)} className="ml-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                                          </Card>
                                        ))}
                                        <Button type="button" variant="outline" onClick={addChecklistItem}><PlusCircle className="mr-2 h-4 w-4" />Tambah Item Checklist</Button>
                                    </div>
                                </CardContent>
                            </Card>

                             <Card>
                                <CardHeader><CardTitle>Kegiatan 2: Publikasi</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                     <div className="space-y-2">
                                        <Label>Tips Publikasi</Label>
                                        <Textarea value={content.kegiatan2Tips.join('\n')} onChange={e => setContent({...content, kegiatan2Tips: e.target.value.split('\n')})} rows={10} placeholder="Satu tips per baris..."/>
                                    </div>
                                     <div className="space-y-2">
                                        <Label>Tautan Video YouTube Referensi</Label>
                                        <Textarea value={content.youtubeLinks.join('\n')} onChange={e => setContent({...content, youtubeLinks: e.target.value.split('\n')})} rows={4} placeholder="Satu URL YouTube per baris..."/>
                                    </div>
                                </CardContent>
                            </Card>

                            <Button type="submit" disabled={isPending} className="w-full" size="lg">
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {isPending ? 'Menyimpan...' : 'Simpan Semua Perubahan Materi Menulis'}
                            </Button>
                        </form>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
