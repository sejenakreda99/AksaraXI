
'use client';

import { useEffect, useState } from 'react';
import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

type PresentasiContent = {
    assessmentCriteria: string[];
}

export default function MempresentasikanPage() {
    const [content, setContent] = useState<PresentasiContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchContent() {
            setLoading(true);
            try {
                const docRef = doc(db, 'chapters', '1');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().mempresentasikan) {
                    setContent(docSnap.data().mempresentasikan);
                } else {
                    setContent({ assessmentCriteria: [] });
                }
            } catch (error) {
                console.error("Failed to fetch content:", error);
                setContent({ assessmentCriteria: [] });
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
          title="D. Mempresentasikan Teks Deskripsi"
          description="Sediakan panduan dan materi untuk kegiatan presentasi siswa."
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
                  <Link href="/teacher/materi/bab-1/mempresentasikan/edit">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Kriteria
                  </Link>
              </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Pratinjau Materi Mempresentasikan</CardTitle>
                    <CardDescription>
                        Berikut adalah konten dan format penilaian yang akan dilihat siswa.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Card className="bg-slate-50">
                        <CardHeader>
                            <CardTitle className="text-lg">Tujuan Pembelajaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Menyajikan gagasan dalam teks deskripsi.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Kegiatan 1: Panduan Membaca Nyaring</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none">
                            <p>Pada kegiatan ini, kalian akan membacakan secara lisan atau membaca nyaring, teks deskripsi yang telah kalian tulis. Kalian juga bisa menyajikan teks deskripsi seperti para presenter wisata atau presenter kuliner...</p>
                            <p>Cara mengatur intonasi saat berbicara atau membaca nyaring yaitu sebagai berikut.</p>
                            <ol>
                                <li>Gunakan suara yang lantang untuk menegaskan suatu hal yang penting...</li>
                                <li>Gunakan tempo berbicara yang lambat untuk menyampaikan/membaca sebuah poin penting...</li>
                                <li>Tinggikan suara kalian ketika menyapa pendengar pada awal pembacaan...</li>
                                <li>Gunakan perasaan atau emosi sesuai dengan kalimat yang kalian ucapkan.</li>
                            </ol>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Latihan: Pratinjau Format Penilaian</CardTitle>
                            <CardDescription>Siswa akan mengisi formulir interaktif seperti di bawah ini untuk menilai teman sebayanya.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="prose prose-sm max-w-none">Sekarang, bacalah teks kalian dengan nyaring secara bergiliran di depan kelas. Bagi kalian yang mendapat giliran menyimak, lakukanlah penilaian terhadap teman kalian yang sedang membaca nyaring...</p>
                            <Separator />
                            <CardTitle className="text-base pt-4">Tabel 1.6 Penilaian Membaca Nyaring</CardTitle>
                            <div className="text-sm space-y-2 rounded-md border p-4">
                               <p><strong>Nama Pembicara:</strong> (Input oleh siswa)</p>
                               <p><strong>Kelas:</strong> (Input oleh siswa)</p>
                               <p><strong>Judul Teks:</strong> (Input oleh siswa)</p>
                            </div>
                           {loading ? <Skeleton className="h-40 w-full" /> : (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">No.</TableHead>
                                        <TableHead>Unsur yang Dinilai</TableHead>
                                        <TableHead className="w-[250px] text-center">Hasil Penilaian</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {content?.assessmentCriteria && content.assessmentCriteria.length > 0 ? (
                                        content.assessmentCriteria.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{index + 1}.</TableCell>
                                                <TableCell className="font-medium">{item}</TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
                                                      <span>Baik</span>
                                                      <span>Sedang</span>
                                                      <span>Cukup</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center">
                                                Belum ada kriteria penilaian yang ditambahkan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                           )}
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
