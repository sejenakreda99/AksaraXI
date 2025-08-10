
'use client';

import { useEffect, useState } from 'react';
import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Youtube, Check, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

type Statement = {
  no: number;
  statement: string;
  answer: 'benar' | 'salah';
  points: number;
  evidencePoints: number;
};

type MenyimakContent = {
  learningObjective: string;
  youtubeUrl: string;
  statements: Statement[];
  activity2Questions: string[];
  comparisonVideoUrl: string;
};

const defaultContent: MenyimakContent = {
  learningObjective: "Mengevaluasi gagasan dan pandangan berdasarkan kaidah logika berpikir dari menyimak teks deskripsi.",
  youtubeUrl: "https://youtu.be/waYM6QorBxw?si=NWLa7VRmk9QOYDxF",
  statements: [
    { no: 1, statement: "Teks tersebut secara umum mendeskripsikan Candi Borobudur. Candi Borobudur yang dideskripsikan tersebut digambarkan sebagai candi Budha yang paling besar dan mewah yang ada di Indonesia.", answer: 'benar', points: 10, evidencePoints: 10 },
    { no: 2, statement: "Tingkat pertama paling bawah dari Candi Borobudur disebut dengan Kamadatu. Pada bagian akhir ini, terdapat relief yang berjumlah 160 buah.", answer: 'benar', points: 10, evidencePoints: 10 },
    { no: 3, statement: "Tingkat kedua Candi Borobudur disebut Rupadatu. Di sini, terdapat 1300 relief. Pada tingkat kedua ini pula terdapat patung Budha berukuran kecil. Jumlah keseluruhan patung Budha sebanyak 432 patung.", answer: 'benar', points: 10, evidencePoints: 10 },
    { no: 4, statement: "Tingkat paling atas dari Candi Borobudur adalah Arupadatu. Pada tingkat ini, sama sekali tidak ada hiasan relief pada dindingnya. Bentuk dari lantai Arupadatu, yaitu lingkaran. Di sini, ada 72 stupa kecil.", answer: 'benar', points: 10, evidencePoints: 10 },
    { no: 5, statement: "Teks tersebut menggambarkan Candi Borobudur secara berurutan, dari tingkat bawah sampai ke bagian paling atas.", answer: 'benar', points: 10, evidencePoints: 10 }
  ],
  activity2Questions: [
      "Seandainya kalian belum pernah secara langsung berkunjung ke Candi Borobudur, dapatkah kalian seolah-olah mengindra (melihat, mendengar, merasakan) Candi Borobudur setelah menyimak teks tersebut?",
      "Apa yang menarik dari penggambaran objek Candi Borobudur setelah menyimak teks tersebut?",
      "Mengapa narator mendeskripsikan Candi Borobudur itu mulai dari tingkat bawah sampai ke tingkat paling atas candi?",
      "Apakah narator berhasil menggambarkan secara rinci objek sehingga pembaca seakan-akan melihat, mendengar, atau merasakan objek yang dideskripsikan? Tunjukkan buktinya."
  ],
  comparisonVideoUrl: "https://www.youtube.com/embed/u1yo-uJDsU4"
};

export default function MenyimakPage() {
  const [content, setContent] = useState<MenyimakContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const docRef = doc(db, 'chapters', '1');
        const docSnap = await getDoc(docRef);
        let currentContent = docSnap.exists() ? docSnap.data().menyimak : null;

        if (!currentContent) {
            // If menyimak doesn't exist at all, set it with default content
            await setDoc(docRef, { menyimak: defaultContent }, { merge: true });
            setContent(defaultContent);
        } else {
            // If menyimak exists, check for individual missing fields for forward compatibility
            const contentToUpdate = { ...defaultContent, ...currentContent };
            if (
                !currentContent.activity2Questions ||
                !currentContent.comparisonVideoUrl
            ) {
                await setDoc(docRef, { menyimak: contentToUpdate }, { merge: true });
            }
            setContent(contentToUpdate);
        }
      } catch (error) {
        console.error("Failed to fetch or create content:", error);
         setContent(defaultContent); // Fallback to default on error
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  const totalPoints = content?.statements.reduce((acc, s) => acc + (s.points || 0) + (s.evidencePoints || 0), 0) || 0;
  
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('embed')) return url;
    try {
      const videoUrl = new URL(url);
      let videoId = videoUrl.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      const pathSegments = videoUrl.pathname.split('/');
      const shortId = pathSegments[pathSegments.length - 1];
      if (shortId) {
        return `https://www.youtube.com/embed/${shortId}`;
      }
    } catch (error) {
      console.error('Invalid YouTube URL', error);
      return '';
    }
    return '';
  };

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="A. Menyimak Teks Deskripsi"
          description="Tambahkan materi audio atau video untuk kegiatan menyimak."
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
                        <Link href="/teacher/materi/bab-1/menyimak/edit">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Konten & Penilaian
                        </Link>
                    </Button>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pratinjau Materi Menyimak</CardTitle>
                            {loading ? <Skeleton className="h-4 w-3/4 mt-1" /> : (
                                <CardDescription>
                                    <span className="font-bold">Tujuan Pembelajaran:</span> {content?.learningObjective}
                                </CardDescription>
                            )}
                        </CardHeader>
                    </Card>

                    {loading ? (
                        <Card>
                            <CardContent><Skeleton className="h-96 w-full" /></CardContent>
                        </Card>
                    ) : content && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Kegiatan 1: Menganalisis Teks Deskripsi</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose max-w-none mb-6">
                                        <p>
                                            Pada kegiatan ini, siswa akan menyimak teks deskripsi dari video YouTube berikut.
                                        </p>
                                        <Button asChild>
                                            <Link href={content?.youtubeUrl || '#'} target="_blank">
                                                <Youtube className="mr-2 h-4 w-4" />
                                                Buka Video di YouTube
                                            </Link>
                                        </Button>
                                    </div>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Tabel 1.1 Penilaian Pernyataan</CardTitle>
                                            <CardDescription>Total Skor Maksimal: {totalPoints}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[50px]">No.</TableHead>
                                                        <TableHead>Pernyataan & Bukti Informasi</TableHead>
                                                        <TableHead className="w-[120px] text-center">Kunci Jawaban</TableHead>
                                                        <TableHead className="w-[120px] text-center">Skor Maksimal</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {content?.statements.map((item) => (
                                                    <TableRow key={item.no}>
                                                        <TableCell>{item.no}</TableCell>
                                                        <TableCell>
                                                            <p>{item.statement}</p>
                                                            <p className="font-semibold mt-2">Bukti Informasi:</p>
                                                            <p className="text-muted-foreground italic">(Siswa mengisi bagian ini - dinilai manual oleh guru)</p>
                                                        </TableCell>
                                                        <TableCell className="text-center font-medium capitalize">
                                                            {item.answer === 'benar' ? 
                                                            <span className='flex items-center justify-center text-green-600'><Check className='w-4 h-4 mr-1'/> Benar</span> : 
                                                            <span className='flex items-center justify-center text-red-600'><X className='w-4 h-4 mr-1'/> Salah</span>}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <p>Jawaban: {item.points || 0}</p>
                                                            <p>Bukti: {item.evidencePoints || 0}</p>
                                                        </TableCell>
                                                    </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Umpan Balik & Teks Transkrip</CardTitle>
                                    <CardDescription>
                                        Teks ini ditampilkan kepada siswa setelah mereka mencoba menjawab.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="prose prose-sm max-w-none bg-slate-50/50 p-4 rounded-md">
                                    <h4 className="font-bold">Candi Borobudur</h4>
                                    <p>
                                        Candi Borobudur adalah candi Budha yang paling besar dan mewah yang ada di Indonesia. Bentuk daripada candi ini nampak seperti piramida atau limas segi empat. Candi ini mempunyai banyak relief dan juga stupa. Karena kemegahan dan ukuran candi, membuat pesona candi bak gunung yang menjulang tinggi. Bahkan, dari arah kejauhan telah nampak dengan jelas akan pesona dari candi ini.
                                    </p>
                                    <p>
                                        (Teks lengkap ditampilkan kepada siswa)
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Kegiatan 2: Mengevaluasi Gagasan</CardTitle>
                                    <CardDescription>
                                        Siswa diminta menjawab pertanyaan analisis dan perbandingan video.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="font-semibold">Daftar Pertanyaan untuk Siswa:</p>
                                    <ol className="list-decimal list-inside text-sm space-y-1">
                                       {(content.activity2Questions || []).map((q, i) => <li key={i}>{q}</li>)}
                                    </ol>
                                    <Separator />
                                    <p className="font-semibold">Video Perbandingan:</p>
                                     {content.comparisonVideoUrl && <div className="aspect-video w-full rounded-lg overflow-hidden border">
                                        <iframe className="w-full h-full" src={getYoutubeEmbedUrl(content.comparisonVideoUrl)} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                                    </div>}
                                    <p className='text-sm'>Siswa diminta membandingkan kedua video dan menentukan mana yang deskripsinya lebih baik.</p>
                                    <Separator />
                                    <div className="prose prose-sm max-w-none">
                                        <p>kepentingan tertentu. Misalnya, orang menggambarkan objek wisata dengan tujuan agar yang membaca atau menyimak merasa tertarik sehingga mau berkunjung ke tempat itu. Oleh karena itu, orang tersebut akan menggambarkannya semenarik mungkin.</p>
                                        <p>Perhatikan dialog berikut, apakah orang yang menggambarkan Candi Borobudur ini sudah berusaha menggambarkannya sebaik dan semenarik mungkin?</p>
                                        <blockquote className="border-l-4 pl-4 italic">
                                            <p><strong>Amir:</strong> Waktu liburan tahun ajaran baru kemarin, kelas kami berwisata ke Candi Borobudur.</p>
                                            <p><strong>Usman:</strong> Wah, enak benar. Saya belum pernah ke sana. Seperti apa Candi Borobudur itu?</p>
                                            <p><strong>Amir:</strong> Ya, pokoknya Borobudur itu suatu candi.</p>
                                            <p><strong>Usman:</strong> Gambarannya seperti apa?</p>
                                            <p><strong>Amir:</strong> Ya, candi itu besar, tinggi. Banyak orang berkunjung ke sana. Ada yang foto-foto, berundak-undak, ada patungnya, dan ada reliefnya. Untuk mencapai ke atas, perlu tenaga. Lelah soalnya. Coba kamu berkunjung ke sana. Pokoknya, sulit digambarkan dengan kata-kata. Langsung saja lihat ke sana.</p>
                                            <p><strong>Usman:</strong> Oh, begitu.</p>
                                        </blockquote>
                                        <p>Apa yang kalian perhatikan dari dialog tersebut? Si Amir diminta menggambarkan objek Candi Borobudur. Namun, dia tidak begitu terampil menggambarkannya. Gagasan dan pandangan Amir terhadap objek wisata Candi Borobudur tidak begitu lengkap. Berbeda dengan yang kalian simak tentang Candi Borobudur di atas, lengkap dan sistematis. Selanjutnya, coba kalian perbaiki teks tersebut agar sesuai dengan kriteria teks deskripsi.</p>
                                    </div>
                                    <p className="font-semibold">Tugas Siswa:</p>
                                    <p className="text-muted-foreground italic">(Siswa akan melihat kolom isian untuk menulis ulang dialog.)</p>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
