'use client';

import { useEffect, useState } from 'react';
import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Check, X } from "lucide-react";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


type ReadingStatement = {
  statement: string;
  answer: 'benar' | 'salah';
  points: number;
  evidencePoints: number;
};

type LatihanStatement = {
  statement: string;
  answer: 'benar' | 'salah';
  points: number;
  evidencePoints: number;
}

type ReadingContent = {
  learningObjective: string;
  // Kegiatan 1
  kegiatan1MainText: string;
  kegiatan1Statements: ReadingStatement[];
  kegiatan1FeedbackText: string;
  kegiatan1InfoBoxText: string;
  // Kegiatan 2 & Latihan
  kegiatan2Intro: string;
  latihanIntro: string;
  latihanMainText: string;
  latihanStatements: LatihanStatement[];
};

const defaultContent: ReadingContent = {
    learningObjective: "Mengevaluasi gagasan dan pandangan berdasarkan kaidah logika berpikir dari membaca teks deskripsi.",
    // Kegiatan 1
    kegiatan1MainText: `TEMPO.CO, Jakarta - Pulau Alor di Nusa Tenggara Timur tak hanya menawarkan pesona alam yang memukau dunia seperti Half Moon Bay atau Crocodile Rock. Salah satu pulau kecil itu memiliki warisan kebudayaan leluhur yang unik dan otentik. Warisan kebudayaan berupa rumah adat hingga adat istiadat itu bisa ditemukan di Kampung Takpala.\n\nSejak 1983, Pemerintah Kabupaten Alor menjadikan Kampung Takpala sebagai ikon pariwisata Alor. Saat ini Kampung Takpala oleh 13 Kepala Keluarga warga dari Suku Abui. Suku Abui yang artinya orang gunung ini, merupakan suku terbesar di Alor.\n\nKata Takpala berasal dari kata Tak dan Pala. Kata Tak berarti ‘ada batas’ dan kata Pala berarti ‘kayu’, sehingga kata Takpala diartikan “kayu pembatas”.\n\nWarga Kampung Takpala mendiami 13 Rumah Adat Fala Foka. Itu merupakan rumah adat panggung berbentuk limas, beratapkan alang-alang, berdinding dan berlantaikan anyaman bambu yang ditopang oleh empat buah kayu merah yang kokoh. Rumah adat itu memiliki empat tingkatan. Tingkat pertama atau yang biasa disebut Liktaha adalah tempat untuk menerima tamu atau berkumpul bersama. Tingkat dua adalah Fala Homi, yakni ruang tidur dan ruang untuk masak. Tingkat tiga adalah Akui Foka, yakni tempat untuk menyimpan cadangan bahan makanan, seperti jagung dan ubi kayu. Sementara tingkatan paling atas disebut Akui Kiding, yakni tempat untuk menyimpan mahar dan barang berharga seperti Moko.\n\nMoko merupakan barang berharga di Pulau Alor. Barang berharga sejenis tembikar itu biasanya digunakan sebagai belis atau mahar perkawinan. Satu buah Moko bernilai sangat fantastis, sehingga sering dikatakan satu buah Moko mampu meminang tiga orang anak gadis.\n\nSelain rumah Fala Foka, di sana ada rumah adat Lopo. Perbedaannya, ukurannya lebih kecil tetapi memiliki tingkat kesucian lebih tinggi dibandingkan rumah Fala Foka. Pada atap rumah terdapat sebuah mahkota yang menandai kesakralan dua bangunan ini.\n\nJika berkunjung ke Kampung Takpala, selalu ada penyambutan dengan tarian adat yang disebut tarian lego-lego. Saat pementasan tarian ini, semua warga yang menghuni kampung ini akan mengenakan pakaian adat yang disertai dengan ornamen seperti panah dan busur serta parang bagi pria dan tas fuulak serta gelang pada kedua kaki bagi wanita.\n\nWisatawan yang berkunjung ke kampung Takpala diperbolehkan untuk berfoto dengan menggunakan pakaian adat dengan setiap atributnya. Ada biayanya, tetapi itu tergantung kesepakatan antara wisatawan dengan pemilik pakaian.\n\nTentu saja, karena berada di Kabupaten Alor, saat ke Kampung Takpala, wisatawan bisa menikmati keindahan alam yang indah. Sebab, posisi Kampung Takpala yang berada di atas bukit sehingga bisa melihat alam teluk mutiara dengan warna biru yang sangat indah.`,
    kegiatan1Statements: [
        { statement: "Teks tersebut mendeskripsikan tentang rumah adat dan adat istiadat di Kampung Takpala Alor.", answer: "benar", points: 10, evidencePoints: 10 },
        { statement: "Untuk menyimak teks tersebut, penyimak melibatkan pancaindra sehingga penyimak seolah-olah melihat, mendengar, mengecap, mencium, dan meraba objek berupa rumah adat dan adat istiadat di Kampung Takpala Alor.", answer: "benar", points: 10, evidencePoints: 10 },
        { statement: "Teks tersebut menggambarkan rumah adat Kampung Alor, yaitu rumah adat Fala Foka.", answer: "benar", points: 10, evidencePoints: 10 },
        { statement: "Teks tersebut juga menggambarkan rumah adat Fala Foka yang memiliki empat tingkatan.", answer: "benar", points: 10, evidencePoints: 10 },
        { statement: "Teks tersebut menggambarkan rumah adat Lopo berukuran lebih besar daripada rumah adat Fala Foka.", answer: "salah", points: 10, evidencePoints: 10 },
        { statement: "Teks tersebut juga menggambarkan apabila ada wisatawan yang berkunjung ke Kampung Takpala, akan disambut dengan tarian adat yang disebut tarian Lego-Lego.", answer: "benar", points: 10, evidencePoints: 10 },
        { statement: "Wisatawan yang berkunjung ke kampung Takpala tidak diperbolehkan untuk berfoto.", answer: "salah", points: 10, evidencePoints: 10 }
    ],
    kegiatan1FeedbackText: `Teks berjudul “Keunikan Adat Istiadat Suku Abuy di Kampung Takpala Alor” merupakan teks deskripsi karena mengandung ciri-ciri sebagai berikut.\n\n1. Teks tersebut menggambarkan suatu objek.\nObjek yang digambarkan adalah tentang adat istiadat suku Abuy yang berada di Kampung Takpala Alor, Provinsi Nusa Tenggara Timur.\n\n2. Untuk memahami teks tersebut, diperlukan keterlibatan pancaindra (penglihatan, pendengaran, pengecapan, penciuman, dan perabaan). Dengan demikian, ketika kita membaca objek yang digambarkan itu seolah-olah kita melihat, mendengar, mengecap, mencium, atau meraba objek tersebut.\nKetika menyimak atau membaca teks “Keunikan Adat Istiadat Suku Abuy di Kampung Takpala Alor”, kita seolah-olah melihat atau menyaksikan rumah adat Suku Abuy yang bertingkat-tingkat; kita seolah-olah melihat dan mendengar orang-orang Suku Abuy di Kampung Takpala menari Lego-Lego menyambut wisatawan yang datang berkunjung.\n\n3. Teks tersebut memaparkan ciri-ciri fisik dan sifat objek tertentu, seperti ukuran, bentuk, warna, dan kepribadian secara jelas dan terperinci.\nTeks berjudul “Keunikan Adat Istiadat Suku Abuy di Kampung Takpala Alor” di atas memaparkan ciri-ciri fisik dan sifat objek berupa rumah adat Kampung Takpala. Secara terperinci, rumah adat Suku Abuy di Kampung Takpala dipaparkan sebagai rumah yang memiliki empat tingkatan. Tingkat pertama atau yang biasa disebut Liktaha adalah tempat untuk menerima tamu atau berkumpul bersama. Tingkat dua adalah Fala Homi, yakni ruang tidur dan ruang untuk masak. Tingkat tiga adalah Akui Foka, yakni tempat untuk menyimpan cadangan bahan makanan, seperti jagung dan ubi kayu. Sementara tingkatan paling atas disebut Akui Kiding, yakni tempat untuk menyimpan mahar dan barang berharga, seperti Moko.\nSelain memerinci rumah adat, diperinci juga tentang tarian LegoLego yang dimainkan saat menyambut wisatawan yang datang berkunjung. “Saat pementasan tarian ini, semua warga yang menghuni kampung ini akan mengenakan pakaian adat disertai dengan ornamen seperti panah dan busur serta parang bagi pria dan tas fuulak serta gelang pada kedua kaki bagi wanita.”\n\n4. Teks tersebut banyak menggunakan kata atau frasa yang termasuk kelas kata sifat atau kata keadaan.\nTeks berjudul “Keunikan Adat Istiadat Suku Abuy di Kampung Takpala Alor” menggambarkan tentang rumah adat suku Abuy beserta tarian Lego-Lego yang dimainkan warga saat menyambut tamu. Karena itu, untuk menggambarkan objek, digunakan kata-kata yang menunjukkan sifat atau keadaan objek tersebut, seperti yang terdapat pada kata atau kelompok kata yang dicetak miring pada kalimat-kalimat sebagai berikut.\na. Pulau Alor  di Nusa Tenggara  Timur tak hanya menawarkan pesona alam yang memukau dunia seperti  Half Moon Bay  atau  Crocodile Rock. Salah satu pulau kecil itu  memiliki warisan kebudayaan leluhur yang unik dan otentik.\nb. Selain rumah Fala Foka, di sana ada rumah adat Lopo. Perbedaannya, ukurannya lebih kecil namun memiliki tingkat kesucian lebih tinggi dibandingkan rumah Fala Foka. Pada atap rumah terdapat sebuah mahkota yang menandai kesakralan dua bangunan ini.\nc. Tentu saja, karena berada di Kabupaten Alor, saat ke Kampung Takpala, wisatawan bisa menikmati keindahan alam yang indah. Sebab, posisi Kampung Takpala yang berada di atas bukit sehingga bisa melihat alam teluk mutiara dengan warna biru yang sangat indah.`,
    kegiatan1InfoBoxText: `Sebuah teks yang menggambarkan sebuah objek (misalnya: tempat, benda, tubuh manusia, dan pemandangan alam) yang dikesankan seolah-olah pembaca dapat mendengar, melihat, menyaksikan, dan merasakan objek tersebut, itulah yang disebut teks deskripsi.\nTeks deskripsi yang baik adalah teks yang mampu membuat pembaca membayangkan objek, tempat, dan orang yang penulis deskripsikan. Seorang penulis deskripsi diibaratkan seperti seorang seniman yang mampu melukis sebuah gambar yang dapat dilihat secara jelas dalam pikiran pembaca.`,
    // Kegiatan 2
    kegiatan2Intro: "Lihatlah hasil pekerjaan kalian pada Kegiatan 1. Apakah pernyataan “benar atau salah” kalian sudah tepat? Sekarang, kalian akan membaca teks berjudul “Terminal Baru Bandara Sam Ratulangi Manado, Perpaduan Konsep Tradisional dan Modern”. Pada kegiatan ini, kalian akan belajar mengevaluasi gagasan dan pandangan dalam teks deskripsi yang dibaca",
    latihanIntro: "Bacalah teks berjudul “Terminal Baru Bandara Sam Ratulangi Manado, Perpaduan Konsep Tradisional dan Modern” berikut ini. Apakah teks tersebut termasuk teks deskripsi? Jelaskan hasil analisismu dengan menggunakan alat analisis ciri-ciri teks dekripsi.",
    latihanMainText: "Penulis: R. Fitriana\n\nProgres perluasan terminal penumpang dan fasilitas penunjang Bandara Sam Ratulangi Manado yang memadukan konsep tradisional dan modern sudah selesai 92% hingga 22 Juli 2021. Pengembangan Bandara Sam Ratulangi Manado dilakukan untuk mendukung pengembangan pariwisata Sulawesi Utara, khususnya Likupang sebagai salah satu destinasi pariwisata super prioritas.\n\nSaat ini, desain terminal Bandara Sam Ratulangi Manado mengombinasikan konsep tradisional dan modern. Sentuhan tradisional berupa motif batik Tarawesan Pareday yang tercipta dalam bentuk geometris yang menyerupai sebuah perulangan garis sebagai representasi sebuah simbol gelombang kehidupan manusia yang hadir dari dua arah, yaitu arah atas dan bawah. Sisi modern akan tampak pada fasilitas-fasilitas terminal yang berstandar internasional.\n\nPengembangan bandara ini memperluas terminal penumpang menjadi 57.296 meter persegi dari 26.481 meter persegi. Perluasan terminal ini membuat Bandara Sam Ratulangi Manado mampu menampung hingga 5,7 juta penumpang per tahun dibanding sebelumnya yang hanya 2,6 juta per tahun. Sebagai informasi, pada tahun 2019 Bandara Sam Ratulangi Manado telah melayani 2,2 juta penumpang, dengan 22,7 ribu pergerakan pesawat, serta 13.601.241 kg kargo. Pada tahun 2020, trafik penumpang Bandara Manado sebanyak 938.705 penumpang, trafik pesawat sebesar 12.435 pesawat, dan trafik kargo sebesar 15.250.319 kg.\n\nBandara Sam Ratulangi Manado juga dilengkapi dengan fasilitas modern mulai dari penambahan fix bridge yang semula tiga unit menjadi lima unit. Konter check-in dari 30 unit menjadi 45 unit. Area parkir yang semula dapat menampung 350 kendaraan roda empat nantinya dapat menampung hingga 650 kendaraan.\n\nBandara Sam Ratulangi Manado adalah salah satu dari 4 bandara yang ditargetkan selesai pengembangannya pada tahun 2021. Tiga bandara lainnya di antaranya adalah Terminal 1 Bandara Juanda Surabaya, Bandara Lombok Praya, dan Bandara Sultan Hasanuddin Makassar.",
    latihanStatements: [
        { statement: "Menggambarkan suatu objek (benda, tempat, dan suasana) tertentu.", answer: 'benar', points: 10, evidencePoints: 10 },
        { statement: "Melibatkan pancaindra (penglihatan, pendengaran, pengecapan, penciuman, dan perabaan).", answer: 'benar', points: 10, evidencePoints: 10 },
        { statement: "Memaparkan ciri-ciri fisik dan sifat objek tertentu, seperti ukuran, bentuk, warna, dan kepribadian secara jelas dan terperinci.", answer: 'benar', points: 10, evidencePoints: 10 },
        { statement: "Banyak ditemukan kata-kata atau frasa yang bermakna sifat atau keadaan.", answer: 'benar', points: 10, evidencePoints: 10 }
    ]
};

export default function MembacaPage() {
    const [content, setContent] = useState<ReadingContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchContent() {
            try {
                const docRef = doc(db, 'chapters', '1');
                const docSnap = await getDoc(docRef);
                let currentContent = docSnap.exists() ? docSnap.data().membaca : null;

                const contentToSet = {
                    ...defaultContent,
                    ...currentContent,
                };
                
                if (!currentContent || !currentContent.kegiatan2Intro) {
                    await setDoc(docRef, { membaca: contentToSet }, { merge: true });
                }
                setContent(contentToSet);

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
                <TeacherHeader
                    title="B. Membaca Teks Deskripsi"
                    description="Kelola materi teks dan pertanyaan pemahaman untuk kegiatan membaca."
                />
                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <Button asChild variant="outline">
                                <Link href="/teacher/materi/bab-1">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali ke Struktur Bab
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/teacher/materi/bab-1/membaca/edit">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Konten
                                </Link>
                            </Button>
                        </div>
                        {loading ? (
                             <div className="space-y-4">
                                <Skeleton className="h-8 w-1/2" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-64 w-full" />
                            </div>
                        ) : content ? (
                             <Card>
                                <CardHeader>
                                    <CardTitle>Pratinjau Materi Membaca</CardTitle>
                                    <CardDescription>
                                        <span className="font-bold">Tujuan Pembelajaran:</span> {content.learningObjective}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                     <Accordion type="multiple" className="w-full space-y-4">
                                        <Card>
                                            <AccordionItem value="kegiatan-1">
                                                <AccordionTrigger className="p-6 text-lg font-semibold">Kegiatan 1: Menganalisis Teks Deskripsi (Suku Abuy)</AccordionTrigger>
                                                <AccordionContent className="p-6 pt-0 space-y-6">
                                                     <div className="prose max-w-none prose-sm sm:prose-base whitespace-pre-wrap text-foreground">
                                                        <h3 className="font-bold text-center mb-4">Keunikan Adat Istiadat Suku Abuy di Kampung Takpala Alor</h3>
                                                        {content.kegiatan1MainText}
                                                    </div>
                                                    <Separator/>
                                                     <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Pernyataan</TableHead>
                                                                <TableHead className="w-[120px] text-center">Kunci Jawaban</TableHead>
                                                                <TableHead className="w-[120px] text-center">Skor Maks</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {content.kegiatan1Statements.map((stmt, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>
                                                                    <p><strong>Pernyataan {index+1}:</strong> {stmt.statement}</p>
                                                                    <p className="font-semibold mt-2">Bukti Informasi:</p>
                                                                    <p className="text-muted-foreground italic">(Siswa mengisi bagian ini)</p>
                                                                </TableCell>
                                                                <TableCell className="text-center font-medium capitalize">
                                                                    {stmt.answer === 'benar' ? 
                                                                    <span className='flex items-center justify-center text-green-600'><Check className='w-4 h-4 mr-1'/> Benar</span> : 
                                                                    <span className='flex items-center justify-center text-red-600'><X className='w-4 h-4 mr-1'/> Salah</span>}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <p>Jawaban: {stmt.points || 0}</p>
                                                                    <p>Bukti: {stmt.evidencePoints || 0}</p>
                                                                </TableCell>
                                                            </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                    <Separator/>
                                                     <div className="prose max-w-none prose-sm sm:prose-base whitespace-pre-wrap text-foreground">{content.kegiatan1FeedbackText}</div>
                                                     <Separator className="my-6" />
                                                      <Card className="bg-primary/10 border-primary">
                                                          <CardHeader><CardTitle className="text-primary text-base">Info</CardTitle></CardHeader>
                                                          <CardContent className="text-primary/90 text-sm whitespace-pre-wrap">
                                                              {content.kegiatan1InfoBoxText}
                                                          </CardContent>
                                                      </Card>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Card>
                                        <Card>
                                             <AccordionItem value="kegiatan-2">
                                                <AccordionTrigger className="p-6 text-lg font-semibold">Kegiatan 2 & Latihan (Bandara Manado)</AccordionTrigger>
                                                <AccordionContent className="p-6 pt-0 space-y-6">
                                                    <div className="prose prose-sm max-w-none space-y-4">
                                                        <h4 className="font-bold">Kegiatan 2: Mengevaluasi gagasan dan pandangan dalam teks deskripsi yang dibaca</h4>
                                                        <p>{content.kegiatan2Intro}</p>
                                                        <h4 className="font-bold">Latihan</h4>
                                                        <p>{content.latihanIntro}</p>
                                                         <div className="prose max-w-none prose-sm sm:prose-base whitespace-pre-wrap text-foreground border rounded-md p-4 bg-slate-50">
                                                            <h3 className="font-bold text-center mb-4">Terminal Baru Bandara Sam Ratulangi Manado, Perpaduan Konsep Tradisional dan Modern</h3>
                                                            {content.latihanMainText}
                                                        </div>
                                                    </div>
                                                    <Separator/>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Ciri-Ciri Teks Deskripsi</TableHead>
                                                                <TableHead className="w-[120px] text-center">Kunci Jawaban</TableHead>
                                                                <TableHead className="w-[120px] text-center">Skor Maks</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {content.latihanStatements.map((stmt, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>
                                                                    <p><strong>Ciri {index+1}:</strong> {stmt.statement}</p>
                                                                    <p className="font-semibold mt-2">Bukti Informasi:</p>
                                                                    <p className="text-muted-foreground italic">(Siswa mengisi bagian ini)</p>
                                                                </TableCell>
                                                                <TableCell className="text-center font-medium capitalize">
                                                                    {stmt.answer === 'benar' ? 
                                                                    <span className='flex items-center justify-center text-green-600'><Check className='w-4 h-4 mr-1'/> Benar</span> : 
                                                                    <span className='flex items-center justify-center text-red-600'><X className='w-4 h-4 mr-1'/> Salah</span>}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <p>Jawaban: {stmt.points || 0}</p>
                                                                    <p>Bukti: {stmt.evidencePoints || 0}</p>
                                                                </TableCell>
                                                            </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                    <Separator/>
                                                    <div>
                                                        <h4 className="font-bold">Simpulan</h4>
                                                        <p className="text-muted-foreground italic mt-2">(Siswa akan melihat kolom isian untuk melengkapi simpulan di sini)</p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Card>
                                    </Accordion>
                                </CardContent>
                            </Card>
                        ) : (
                            <p>Konten belum dimuat.</p>
                        )}
                       
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
