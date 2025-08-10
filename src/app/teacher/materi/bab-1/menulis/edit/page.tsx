
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
    kegiatan1Intro: "Pada pembelajaran kali ini, kalian akan belajar menulis teks deskripsi. Sebelum menulis teks deskripsi, tentu saja kalian harus melakukan pengamatan terhadap objek yang akan dideskrispsikan.\n\nLangkah apa saja yang harus dilakukan untuk mencapai tujuan pembelajaran menulis teks deskripsi? Langkah-langkah pembelajaran ini akan diterangkan dalam bentuk tahapan-tahapan kegiatan sebagai berikut.",
    kegiatan1Steps: [
        { title: "Menentukan topik", description: "Topik dalam teks deskripsi dapat ditentukan sesuai dengan tujuan penulisan atau kebutuhan informasi hal atau barang yang dideskripsikan." },
        { title: "Membuat kerangka", description: "Kerangka karangan untuk penulisan teks deskripsi tetap dibutuhkan agar hal atau barang yang dideskripsikan dapat digambarkan ciri-cirinya sesuai dengan yang sebenarnya." },
        { title: "Menulis teks deskripsi dengan memperhatikan keutuhan dan keterpaduan", description: "Proses penulisan dapat dilakukan dengan lancar mengikuti kerangka karangan yang telah disusun sebelumnya. Keutuhan dan keterpaduan teks deskripsi dapat diperhatikan dengan mempertimbangkan konjungsi, struktur kalimat, ejaan, tanda baca, dan unsur kebahasaan lainnya." }
    ],
    latihanIntro: "Pada latihan kali ini, kalian akan belajar menulis teks deskripsi. Sebelum menulis teks deskripsi, tentu saja kalian harus melakukan pengamatan terhadap objek yang akan dideskrispsikan. Agar tulisan deskripsi kalian menarik sehingga seolah-olah dapat dilihat, didengar, atau dirasakan, perhatikanlah panduan berikut.",
    latihanGuidelines: [
        "Tentukan objek yang akan kalian deskripsikan. Objek tersebut harus objek yang menarik, yaitu objek yang dapat menimbulkan kesan menyenangkan. Memilih objek yang ada di sekitar tempat kalian, dapat membantu kalian dalam kegiatan ini.",
        "Tentukan rincian apa saja dari objek yang akan kalian deskripsikan itu. Kalian dapat melihat kembali Info yang memaparkan tentang deskripsi bagian dalam teks deskripsi.",
        "Lakukanlah pengamatan terhadap objek-objek yang menjadi bagian-bagian yang akan dideskripsikan. Agar lebih menarik, kalian bisa memotret objek-objek yang akan dideskripsikan itu. Lakukanlah pemotretan dari sudut pandang yang menarik. Foto yang menarik dapat membantu gambaran fisik objek yang dideskripsikan.",
        "Buatlah kerangka karangannya terlebih dahulu. Kerangka karangan dibuat berdasarkan struktur teks deskripsi, yaitu gambaran umum, deskripsi bagian, dan simpulan atau kesan-kesan.",
        "Kembangkanlah kerangka karangan yang telah disusun menjadi suatu teks deskripsi yang utuh! Jangan lupa, perhatikan kaidah-kaidah kebahasaan yang khusus digunakan dalam teks deskripsi, seperti yang telah kalian pelajari pada pembelajaran C.",
        "Perhatikan pula subjektivitas kalian dalam menulis. Dalam pembelajaran ini, kalian tidak diperbolehkan memberikan kesan buruk. Munculkanlah kesan yang menyenangkan saja. Misalnya: indah, sedap dipandang mata, enak dirasa, memukau, membuat betah, dan lain-lain.",
        "Periksa kembali hasil karangan kalian, apakah sudah tepat atau belum. Tulis ya atau tidak pada kolom yang disediakan untuk memeriksa keakuratan teks."
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
    kegiatan2Intro: "Konten untuk Kegiatan 2 akan ditambahkan nanti.",
    kegiatan2Tips: [],
    youtubeLinks: []
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
                     const fetchedData = docSnap.data().menulis;
                     const mergedContent = { ...defaultContent, ...fetchedData };
                     setContent(mergedContent);
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
    
    const handleStepChange = (index: number, field: 'title' | 'description', value: string) => {
        if (!content) return;
        const newSteps = [...content.kegiatan1Steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setContent({ ...content, kegiatan1Steps: newSteps });
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
                                        <Label>Pengantar Kegiatan 1</Label>
                                        <Textarea value={content.kegiatan1Intro} onChange={(e) => setContent({...content, kegiatan1Intro: e.target.value})} rows={5} />
                                    </div>
                                    <div className="space-y-4">
                                        <Label>Langkah-Langkah Menulis</Label>
                                        {content.kegiatan1Steps.map((step, index) => (
                                            <div key={index} className="p-4 bg-slate-50/50 rounded-lg border space-y-2">
                                                 <Label htmlFor={`step-title-${index}`}>Langkah {index + 1}: Judul</Label>
                                                 <Input id={`step-title-${index}`} value={step.title} onChange={e => handleStepChange(index, 'title', e.target.value)} />
                                                  <Label htmlFor={`step-desc-${index}`}>Langkah {index + 1}: Deskripsi</Label>
                                                 <Textarea id={`step-desc-${index}`} value={step.description} onChange={e => handleStepChange(index, 'description', e.target.value)} rows={2} />
                                            </div>
                                        ))}
                                    </div>
                                     <div className="space-y-2">
                                        <Label>Pengantar Latihan</Label>
                                        <Textarea value={content.latihanIntro} onChange={(e) => setContent({...content, latihanIntro: e.target.value})} rows={4} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Panduan Latihan</Label>
                                        <Textarea value={content.latihanGuidelines.join('\n')} onChange={e => setContent({...content, latihanGuidelines: e.target.value.split('\n')})} rows={10} placeholder="Satu panduan per baris..."/>
                                    </div>
                                     <Separator />
                                     <div className="space-y-4">
                                        <Label className="text-base font-semibold">Tabel Checklist Diri</Label>
                                        {content.checklistItems.map((item, index) => (
                                          <Card key={index} className="p-4 bg-slate-50/50 flex justify-between items-center gap-2">
                                            <Label htmlFor={`check-item-${index}`} className="sr-only">Item {index + 1}</Label>
                                            <Textarea id={`check-item-${index}`} value={item.text} onChange={(e) => handleChecklistItemChange(index, e.target.value)} placeholder={`Isi teks checklist...`} rows={2} className="flex-1"/>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeChecklistItem(index)} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
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
                                        <Label htmlFor="kegiatan2Intro">Pengantar Kegiatan 2</Label>
                                        <Textarea id="kegiatan2Intro" value={content.kegiatan2Intro} onChange={(e) => setContent({...content, kegiatan2Intro: e.target.value})} rows={10} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="kegiatan2Tips">Tips Publikasi</Label>
                                        <Textarea id="kegiatan2Tips" value={content.kegiatan2Tips.join('\n')} onChange={e => setContent({...content, kegiatan2Tips: e.target.value.split('\n')})} rows={10} placeholder="Satu tips per baris..."/>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="youtubeLinks">Tautan Video YouTube Referensi</Label>
                                        <Textarea id="youtubeLinks" value={content.youtubeLinks.join('\n')} onChange={e => setContent({...content, youtubeLinks: e.target.value.split('\n')})} rows={4} placeholder="Satu URL YouTube per baris..."/>
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
