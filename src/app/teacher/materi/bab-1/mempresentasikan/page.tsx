
'use client';

import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export default function MempresentasikanPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="D. Mempresentasikan Teks Deskripsi"
          description="Sediakan panduan dan materi untuk kegiatan presentasi siswa."
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Button asChild variant="outline">
                <Link href="/teacher/materi/bab-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Struktur Bab
                </Link>
              </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Pratinjau Materi Mempresentasikan</CardTitle>
                    <CardDescription>
                        Berikut adalah konten yang akan ditampilkan kepada siswa.
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
                            <CardTitle>Kegiatan 1: Menyajikan Gagasan</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none">
                            <p>Pada kegiatan ini, kalian akan membacakan secara lisan atau membaca nyaring, teks deskripsi yang telah kalian tulis. Kalian juga bisa menyajikan teks deskripsi seperti para presenter wisata atau presenter kuliner. Sebelum melakukan kegiatan membaca nyaring, sebaiknya kalian mengetahui terlebih dahulu bagaimana cara membaca nyaring. Salah satu hal yang harus diperhatikan saat membaca nyaring adalah mengatur intonasi. Penggunaan intonasi yang tepat akan membuat kegiatan membaca nyaring kalian lebih menarik. Intonasi adalah lagu kalimat atau tinggi rendahnya suatu nada pada kalimat. Intonasi berbicara ketika membaca nyaring penting untuk diperhatikan. Jelas tidaknya kalimat yang diucapkan, sangat berpengaruh kepada penyimak dalam memahami pesan yang mereka terima.</p>
                            <p>Cara mengatur intonasi saat berbicara atau membaca nyaring yaitu sebagai berikut.</p>
                            <ol>
                                <li>Gunakan suara yang lantang untuk menegaskan suatu hal yang penting dan harus diingat audiens</li>
                                <li>Gunakan tempo berbicara yang lambat untuk menyampaikan/membaca sebuah poin penting. Sebaliknya, gunakan tempo berbicara yang cepat untuk menyampaikan suatu hal yang memang bukan hal penting, seperti cerita atau hanya sekedar basa-basi kepada pendengar.</li>
                                <li>Tinggikan suara kalian ketika menyapa pendengar pada awal pembacaan. Sebaliknya, rendahkan suara kalian saat membaca nyaring isi teks deskripsi.</li>
                                <li>Gunakan perasaan atau emosi sesuai dengan kalimat yang kalian ucapkan.</li>
                            </ol>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Latihan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="prose prose-sm max-w-none">Sekarang, bacalah teks kalian dengan nyaring secara bergiliran di depan kelas. Bagi kalian yang mendapat giliran menyimak, lakukanlah penilaian terhadap teman kalian yang sedang membaca nyaring. Untuk memudahkan menilai, centanglah pada format penilaian berikut. Sampaikan penilaianmu secara langsung setelah teman kalian membacakan nyaring teks tersebut.</p>
                            <Separator />
                            <CardTitle className="text-base">Tabel 1.6 Penilaian Membaca Nyaring</CardTitle>
                            <div className="text-sm">
                                <p><strong>Nama Pembicara:</strong> (diisi siswa)</p>
                                <p><strong>Kelas:</strong> (diisi siswa)</p>
                                <p><strong>Judul Teks:</strong> (diisi siswa)</p>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No.</TableHead>
                                        <TableHead>Unsur yang Dinilai</TableHead>
                                        <TableHead className="text-center">Baik</TableHead>
                                        <TableHead className="text-center">Sedang</TableHead>
                                        <TableHead className="text-center">Cukup</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        "Kriteria memerinci objek",
                                        "Kejelasan ekspresi",
                                        "Teks deskripsi dimulai dengan gambaran umum",
                                        "Teks memuat deskripsi bagian",
                                        "Teks mengandung kesan-kesan yang menyenangkan",
                                        "Teks sudah memperhatikan kaidah kebahasaan deskripsi"
                                    ].map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}.</TableCell>
                                            <TableCell>{item}</TableCell>
                                            <TableCell className="text-center">❑</TableCell>
                                            <TableCell className="text-center">❑</TableCell>
                                            <TableCell className="text-center">❑</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
