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
  ]
};

export default function MenyimakPage() {
  const [content, setContent] = useState<MenyimakContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const docRef = doc(db, 'chapters', '1');
        const docSnap = await getDoc(docRef);
        const data = docSnap.data();

        if (docSnap.exists() && data && data.menyimak) {
            setContent(data.menyimak);
        } else {
          setContent(defaultContent);
          await setDoc(docRef, { menyimak: defaultContent }, { merge: true });
        }
      } catch (error) {
        console.error("Failed to fetch or create content:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  const totalPoints = content?.statements.reduce((acc, s) => acc + s.points + s.evidencePoints, 0) || 0;

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
                <Card>
                    <CardHeader>
                        <CardTitle>Kegiatan 1: Menganalisis Teks Deskripsi yang Disimak</CardTitle>
                        {loading ? <Skeleton className="h-4 w-3/4 mt-1" /> : (
                            <CardDescription>
                                <span className="font-bold">Tujuan Pembelajaran:</span> {content?.learningObjective}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                          <div className="space-y-6">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-10 w-48" />
                            <Skeleton className="h-5 w-full mt-4" />
                            <Skeleton className="h-96 w-full" />
                          </div>
                        ) : (
                          <>
                            <div className="prose max-w-none mb-6">
                                <p>
                                    Pada kegiatan ini, siswa akan menyimak teks deskripsi dengan kata kunci pencarian "deskripsi Candi Borobudur" pada laman YouTube.
                                </p>
                                <Button asChild>
                                    <Link href={content?.youtubeUrl || '#'} target="_blank">
                                        <Youtube className="mr-2 h-4 w-4" />
                                        Buka Video di YouTube
                                    </Link>
                                </Button>
                                 <p className="mt-4">
                                    Setelah siswa menyimak teks tersebut, mereka harus menjawab pertanyaan di bawah dan memberikan bukti informasi yang mendukung analisis mereka.
                                </p>
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
                                                    <p>Jawaban: {item.points}</p>
                                                    <p>Bukti: {item.evidencePoints}</p>
                                                </TableCell>
                                            </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                          </>
                        )}

                    </CardContent>
                </Card>
            </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
