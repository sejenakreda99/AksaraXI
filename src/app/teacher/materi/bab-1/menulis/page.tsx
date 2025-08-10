
'use client';

import { useEffect, useState } from 'react';
import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Youtube, Check } from "lucide-react";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
    kegiatan2Intro: `Kalian sudah belajar menulis teks deskripsi dan saling menilai antarteman atas hasil tulisan kalian. Sekarang, tiba waktunya untuk menyempurnakan tulisan tersebut agar dapat dikirim dan dipublikasikan di media massa, baik media cetak maupun elektronik. Sebelum mengirimkan ke media massa, perhatikanlah penjelasan berikut.\n\nSetiap kelompok orang, dengan bahasanya masing-masing, kerap menggunakan teks deskripsi untuk menggambarkan sesuatu. Ketika orang bercerita, “Saya tadi menemukan ular besar sekali,” pada saat itu ia sedang membuat atau menyampaikan teks deskripsi. Ia menyebutkan objek berupa ular dan sudah mulai digambarkan dengan ciri ular itu dengan kata “besar sekali”. Kalau ia ditanya seperti apa ular itu, ia akan menjelaskan―selain ukurannya yang besar―panjangnya, warna kulitnya, mulutnya, jalannya, dan lain-lain sebagai detail atau bagian-bagian dari ular tersebut. Orang yang mendengarkannya pun akan merasakan seolah-olah sedang melihat, mendengar, atau merasa apa yang disampaikan orang itu.\n\nPada masyarakat modern, teks deskripsi tidak hanya dilisankan, tetapi juga dituliskan. Tulisan-tulisan itu dapat kita temukan, misalnya, pada media massa cetak, seperti surat kabar dan majalah. Terlebih era teknologi informasi seperti saat ini, sejauh ada koneksi internet, teks deskripsi akan banyak kita temukan juga pada situs web daring.\nSetiap surat kabar atau majalah biasanya membuka rubrik tersendiri yang isinya menggambarkan suatu objek yang menarik disertai dengan foto-foto yang menarik pula. Misalnya, objek wisata. Nama rubriknya pun macam-macam. Ada yang menyebutnya rubrik Hasanah, ada yang menamainya Jelajah, dan lain sebagainya.\n\nSiapa yang akan mengisi rubrik-rubrik tersebut? Bagi media massa (seperti surat kabar atau majalah), biasanya sudah memiliki wartawan tersendiri yang ditugaskan khusus untuk meliput objek-objek tersebut. Namun, ada pula penulis lepas (bukan wartawan) yang diperbolehkan untuk mengirim tulisan deskripsi yang menarik tentang objek-objek tertentu. Apakah nantinya surat kabar atau majalah tersebut memuatnya? Tentu harus melalui seleksi terlebih dahulu. Sejauh tulisan tersebut berkualitas, menarik, dan selaras dengan visi-misi media, biasanya akan dimuat. Bagi tulisannya yang dimuat, akan mendapat imbalan atau honor. Berapa nilai honor yang diberikan? Bergantung pada medianya. Tiap-tiap media memiliki standar berbeda soal ini.\n\nBaik dalam media cetak maupun elektronik, muatan tulisan berupa teks deskrispsi tetap diperlukan. Artinya, teks deskripsi tidak bergantung pada cetak atau elektronik. Pada media massa apa pun, tulisan deskripsi akan tetap kita jumpai.\n\nSelanjutnya, kalian harus mengetahui alamat surel atau email media untuk mengirimkan tulisan jenis deskripsi. Untuk memudahkan proses ini, sebaiknya kalian membuat pangkalan data kontak media. Beberapa alamat surel media massa, baik nasional maupun daerah, dapat dicari melalui internet atau buku.`,
    kegiatan2Tips: [
        "Tentukan media yang akan menjadi sasaran naskah kita. Menentukan media ini penting, di antaranya untuk mengetahui visi dan misi serta isu utama media tersebut. Koran atau majalah perempuan, misalnya, tentu akan lebih banyak menyajikan tulisan-tulisan seputar kehidupan perempuan. Karena itu, tidak tepat jika kita mengirim teks deskripsi tentang otomotif ke media ini.",
        "Buat judul yang menarik. Dalam tulisan di media massa, judul terdiri maksimal 7 kata dan ditulis dengan menggunakan huruf kapital pada huruf awal setiap kata. Judul yang menarik biasanya akan langsung menarik perhatian redaktur untuk membacanya.",
        "Pastikan tulisan sudah memenuhi syarat tata tulis. Di antaranya, penggunaan tanda baca, penggunaan huruf miring, penggunaan huruf kapital, dan sebagainya.",
        "Perhatikan panjang tulisan. Untuk teks deskripsi, panjang tulisan maksimal 4 halaman ukuran A4 dengan spasi 1,5pt. Jika berdasarkan jumlah karakter, tulisan maksimal 1.200 karakter. Namun, hal ini bergantung persyaratan yang ditentukan oleh media. Masing-masing media memiliki ketentuan berbeda. Ada yang mensyaratkan 1.000 karakter, ada pula yang mensyaratkan maksimal 1.500 karakter.",
        "Penggunaan bahasa. Bahasa yang mudah dimengerti, dan tidak berbelit-belit, biasanya akan menjadi pilihan redaksi untuk segera memuatnya.",
        "Untuk tulisan berbentuk teks deskripsi, akan lebih baik jika disertakan foto jurnalistik, sebuah foto yang bisa “berbicara” walaupun tidak disertai kata-kata. Foto pemain sepak bola di lapangan, harus menggambarkan ekspresi yang menarik. Misalnya, saat dia loncat sambil menyundul bola. Foto pesepak bola tersohor sekalipun yang sedang duduk santai bukanlah foto jurnalistik jika yang ingin dilukiskan adalah serunya pertandingan sepak bola."
    ],
    youtubeLinks: [
        "https://youtu.be/5qmAdX4ez-g",
        "https://youtu.be/dsyuDCmDCAs",
        "https://youtu.be/ROcDzEfFIro"
    ]
};

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
    } catch (e) { 
        console.error('Invalid YouTube URL', e);
        return url; 
    }
    return url;
}


export default function MenulisPage() {
    const [content, setContent] = useState<MenulisContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchContent() {
            try {
                const docRef = doc(db, 'chapters', '1');
                const docSnap = await getDoc(docRef);
                let currentContent = docSnap.exists() ? docSnap.data().menulis : null;

                if (!currentContent) {
                    await setDoc(docRef, { menulis: defaultContent }, { merge: true });
                    setContent(defaultContent);
                } else {
                     const mergedContent = { ...defaultContent, ...currentContent };
                    setContent(mergedContent);
                }
            } catch (error) {
                console.error("Failed to fetch or create content:", error);
                setContent(defaultContent);
            } finally {
                setLoading(false);
            }
        }
        fetchContent();
    }, []);

    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-full">
                <TeacherHeader title="C. Menulis Teks Deskripsi" description="Kelola materi, panduan, dan tugas untuk kegiatan menulis." />
                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <Button asChild variant="outline">
                                <Link href="/teacher/materi/bab-1"><ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Struktur Bab</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/teacher/materi/bab-1/menulis/edit"><Edit className="mr-2 h-4 w-4" />Edit Konten</Link>
                            </Button>
                        </div>
                        {loading || !content ? (
                             <div className="space-y-4"><Skeleton className="h-96 w-full" /></div>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pratinjau Materi Menulis</CardTitle>
                                    <CardDescription><span className="font-bold">Tujuan Pembelajaran:</span> {content.learningObjective}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="multiple" className="w-full space-y-4">
                                        <Card>
                                            <AccordionItem value="kegiatan-1">
                                                <AccordionTrigger className="p-6 text-lg font-semibold">Kegiatan 1 & Latihan</AccordionTrigger>
                                                <AccordionContent className="p-6 pt-0 space-y-6">
                                                    <div className="prose prose-sm max-w-none">
                                                        <p>{content.kegiatan1Intro}</p>
                                                        <h4 className="font-bold">Langkah-Langkah Menulis</h4>
                                                        {content.kegiatan1Steps.map((step, i) => <div key={i}><h5 className='font-semibold'>{i+1}. {step.title}</h5><p>{step.description}</p></div>)}
                                                        <Separator className="my-4"/>
                                                         <h4 className="font-bold">Panduan Latihan</h4>
                                                        <p>{content.latihanIntro}</p>
                                                        <ol className="list-decimal list-outside pl-5 space-y-2">{content.latihanGuidelines.map((item, i) => <li key={i}>{item}</li>)}</ol>
                                                    </div>
                                                    <Separator/>
                                                     <div>
                                                        <div className='mb-4'>
                                                            <CardTitle>Tabel 1.5 Memeriksa Unsur</CardTitle>
                                                            <CardDescription>Siswa akan menggunakan tabel ini untuk memeriksa mandiri.</CardDescription>
                                                        </div>
                                                        <Table>
                                                            <TableHeader><TableRow><TableHead>Unsur yang Diperiksa</TableHead><TableHead className="w-[100px] text-center">Ya</TableHead></TableRow></TableHeader>
                                                            <TableBody>
                                                                {content.checklistItems.map((item, i) => (<TableRow key={i}><TableCell>{i+1}. {item.text}</TableCell><TableCell className="text-center"><Check className="w-5 h-5 text-muted-foreground"/></TableCell></TableRow>))}
                                                            </TableBody>
                                                        </Table>
                                                     </div>
                                                     <Separator/>
                                                     <div>
                                                        <h4 className="font-bold">Area Pengumpulan Tugas Siswa</h4>
                                                        <p className="text-muted-foreground italic mt-2">(Siswa akan melihat area untuk menulis teks dan menempelkan tautan di sini)</p>
                                                     </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Card>
                                        <Card>
                                            <AccordionItem value="kegiatan-2">
                                                <AccordionTrigger className="p-6 text-lg font-semibold">Kegiatan 2: Publikasi</AccordionTrigger>
                                                <AccordionContent className="p-6 pt-0 space-y-6">
                                                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                                                        <p>{content.kegiatan2Intro}</p>
                                                         {(content.kegiatan2Tips && content.kegiatan2Tips.length > 0 && content.kegiatan2Tips[0]) && (
                                                            <>
                                                            <h4 className="font-bold">Tips Publikasi</h4>
                                                            <ol className="list-decimal list-outside pl-5 space-y-2">{content.kegiatan2Tips.map((tip, i) => <li key={i}>{tip}</li>)}</ol>
                                                            </>
                                                        )}
                                                    </div>
                                                    {(content.youtubeLinks && content.youtubeLinks.length > 0 && content.youtubeLinks[0]) && <Separator/>}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                        {content.youtubeLinks.map((link, i) => (
                                                            link && <div key={i} className="aspect-video rounded-lg overflow-hidden border">
                                                                 <iframe className="w-full h-full" src={getYoutubeEmbedUrl(link)} title={`YouTube Video ${i+1}`} allowFullScreen></iframe>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Card>
                                    </Accordion>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
