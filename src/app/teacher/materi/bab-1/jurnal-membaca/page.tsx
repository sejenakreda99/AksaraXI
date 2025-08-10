
'use client';

import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";

export default function JurnalMembacaPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="Jurnal Membaca"
          description="Sediakan format dan instruksi untuk jurnal membaca siswa."
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
               <Button asChild variant="outline" size="sm" disabled>
                  <Link href="#">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Halaman
                  </Link>
              </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Pratinjau Halaman Jurnal Membaca</CardTitle>
                    <CardDescription className="text-justify">
                        Berikut adalah instruksi yang akan dilihat siswa untuk kegiatan literasi membaca.
                    </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-justify">
                    <p>Kali ini kalian akan melakukan kegiatan literasi membaca yang berhubungan dengan teks deskripsi. Kalian akan lebih memahami bahwa tidak hanya sekadar deskripsi faktual yang menggambarkan sesuatu berupa fakta yang dapat diindra secara langsung, tetapi juga dapat kita jumpai dalam karya prosa fiksi, seperti novel dan cerita pendek. Bahkan, boleh dikatakan bahwa teks deskripsi tidak bisa dilepaskan dari cerita fiksi karena penulis perlu untuk menggambarkan tokoh, menggambarkan latar, dan lain-lain untuk mendukung keberhasilan penyampaian gagasannya dalam karya tersebut.</p>

                    <p>Beberapa novel di bawah ini sangat tajam dalam mendeskripsikan latarnya.</p>
                    <ol>
                        <li><strong>Ronggeng Dukuh Paruk</strong> karya Ahmad Tohari</li>
                        <li><strong>Harimau! Harimau!</strong> karya Mochtar Lubis</li>
                        <li><strong>Upacara</strong> karya Korrie Layun Rampan</li>
                    </ol>

                    <p>Novel <i>Ronggeng Dukuh Paruk</i> banyak mendeskrispikan situasi pedesaan di Jawa Tengah pada masa 1965. <i>Harimau! Harimau!</i> mendeskripsikan situasi hutan Sumatera. Sedangkan <i>Upacara</i> banyak mendeskipsikan adat budaya Suku Dayak di Kalimantan.</p>

                    <p>Coba kalian apresiasi teks deskripsi dalam novel tersebut. Untuk melakukan kegiatan apresiasi, kalian bisa menunjukkan kelebihan dan kekurangan novel itu, khususnya dari segi pendeskripsian.</p>
                    
                    <div className="bg-slate-100 p-4 rounded-lg mt-6">
                        <h4 className="font-bold">Area Tugas Siswa</h4>
                        <p className="text-muted-foreground italic text-left">(Di halaman siswa, akan tersedia area untuk menuliskan hasil apresiasi mereka terhadap salah satu novel yang dipilih).</p>
                    </div>

                </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
