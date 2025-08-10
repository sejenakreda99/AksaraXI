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
    kegiatan1Intro: "Pada pembelajaran kali ini, kalian akan belajar menulis teks deskripsi. Sebelum menulis teks deskripsi, tentu saja kalian harus melakukan pengamatan terhadap objek yang akan dideskrispsikan.",
    kegiatan1Steps: [
        { title: "Menentukan topik", description: "Topik dalam teks deskripsi dapat ditentukan sesuai dengan tujuan penulisan atau kebutuhan informasi hal atau barang yang dideskripsikan." },
        { title: "Membuat kerangka", description: "Kerangka karangan untuk penulisan teks deskripsi tetap dibutuhkan agar hal atau barang yang dideskripsikan dapat digambarkan ciri-cirinya sesuai dengan yang sebenarnya." },
        { title: "Menulis teks deskripsi dengan memperhatikan keutuhan dan keterpaduan", description: "Proses penulisan dapat dilakukan dengan lancar mengikuti kerangka karangan yang telah disusun sebelumnya." }
    ],
    latihanIntro: "Pada latihan kali ini, kalian akan belajar menulis teks deskripsi...",
    latihanGuidelines: [
        "Tentukan objek yang akan kalian deskripsikan...",
        "Tentukan rincian apa saja dari objek...",
        "Lakukanlah pengamatan terhadap objek...",
        "Buatlah kerangka karangannya terlebih dahulu...",
        "Kembangkanlah kerangka karangan yang telah disusun...",
        "Perhatikan pula subjektivitas kalian dalam menulis...",
        "Periksa kembali hasil karangan kalian..."
    ],
    checklistItems: [
        { text: "Penulisan setiap kata pada judul diawali dengan huruf kapital..." },
        { text: "Judul tidak diakhiri dengan tanda baca." },
        { text: "Teks deskripsi dimulai dengan gambaran umum." },
        { text: "Teks memuat deskripsi bagian." }
    ],
    kegiatan2Intro: "Kalian sudah belajar menulis teks deskripsi...",
    kegiatan2Tips: [
        "Tentukan media yang akan menjadi sasaran naskah kita...",
        "Buat judul yang menarik...",
        "Pastikan tulisan sudah memenuhi syarat tata tulis..."
    ],
    youtubeLinks: [
        "https://youtu.be/5qmAdX4ez-g?si=t7sRBzT6aQpa634S",
        "https://youtu.be/dsyuDCmDCAs?si=fj5q6aybekODR-oQ",
        "https://youtu.be/ROcDzEfFIro?si=3SQDaJqWZjr-VS5F"
    ]
};

function getYoutubeEmbedUrl(url: string) {
    if (!url) return '';
    try {
        const videoUrl = new URL(url);
        let videoId = videoUrl.searchParams.get('v') || videoUrl.pathname.split('/').pop();
        return `https://www.youtube.com/embed/${videoId}`;
    } catch (e) { return url; }
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
                    setContent(currentContent);
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
                                                        <h4 className="font-bold">Langkah-Langkah Menulis</h4>
                                                        {content.kegiatan1Steps.map((step, i) => <div key={i}><h5>{i+1}. {step.title}</h5><p>{step.description}</p></div>)}
                                                        <Separator className="my-4"/>
                                                         <h4 className="font-bold">Panduan Latihan</h4>
                                                        <ol className="list-decimal list-outside pl-5 space-y-2">{content.latihanGuidelines.map((item, i) => <li key={i}>{item}</li>)}</ol>
                                                    </div>
                                                    <Separator/>
                                                    <Table>
                                                        <TableHeader><TableRow><TableHead>Unsur yang Diperiksa (Checklist Diri Siswa)</TableHead></TableRow></TableHeader>
                                                        <TableBody>
                                                            {content.checklistItems.map((item, i) => (<TableRow key={i}><TableCell>{i+1}. {item.text}</TableCell></TableRow>))}
                                                        </TableBody>
                                                    </Table>
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
                                                    <div className="prose prose-sm max-w-none">
                                                        <p>{content.kegiatan2Intro}</p>
                                                        <h4 className="font-bold">Tips Publikasi</h4>
                                                        <ol className="list-decimal list-outside pl-5 space-y-2">{content.kegiatan2Tips.map((tip, i) => <li key={i}>{tip}</li>)}</ol>
                                                    </div>
                                                    <Separator/>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                        {content.youtubeLinks.map((link, i) => (
                                                            <div key={i} className="aspect-video rounded-lg overflow-hidden border">
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
