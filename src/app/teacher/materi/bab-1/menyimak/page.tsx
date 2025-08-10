import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Check, Youtube } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statements = [
    {
        no: 1,
        statement: "Teks tersebut secara umum mendeskripsikan Candi Borobudur. Candi Borobudur yang dideskripsikan tersebut digambarkan sebagai candi Budha yang paling besar dan mewah yang ada di Indonesia.",
    },
    {
        no: 2,
        statement: "Tingkat pertama paling bawah dari Candi Borobudur disebut dengan Kamadatu. Pada bagian akhir ini, terdapat relief yang berjumlah 160 buah.",
    },
    {
        no: 3,
        statement: "Tingkat kedua Candi Borobudur disebut Rupadatu. Di sini, terdapat 1300 relief. Pada tingkat kedua ini pula terdapat patung Budha berukuran kecil. Jumlah keseluruhan patung Budha sebanyak 432 patung.",
    },
    {
        no: 4,
        statement: "Tingkat paling atas dari Candi Borobudur adalah Arupadatu. Pada tingkat ini, sama sekali tidak ada hiasan relief pada dindingnya. Bentuk dari lantai Arupadatu, yaitu lingkaran. Di sini, ada 72 stupa kecil.",
    },
    {
        no: 5,
        statement: "Teks tersebut menggambarkan Candi Borobudur secara berurutan, dari tingkat bawah sampai ke bagian paling atas.",
    }
]

export default function MenyimakPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="A. Menyimak Teks Deskripsi"
          description="Tambahkan materi audio atau video untuk kegiatan menyimak."
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
                        <CardTitle>Kegiatan 1: Menganalisis Teks Deskripsi yang Disimak</CardTitle>
                        <CardDescription>
                            <span className="font-bold">Tujuan Pembelajaran:</span> Mengevaluasi gagasan dan pandangan berdasarkan kaidah logika berpikir dari menyimak teks deskripsi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="prose max-w-none mb-6">
                            <p>
                                Pada kegiatan ini, siswa akan menyimak teks deskripsi dengan kata kunci pencarian "deskripsi Candi Borobudur" pada laman YouTube Maryam Sri Muhaimi.
                            </p>
                            <Button asChild>
                                <Link href="https://youtu.be/waYM6QorBxw?si=NWLa7VRmk9QOYDxF" target="_blank">
                                    <Youtube className="mr-2 h-4 w-4" />
                                    Buka Video di YouTube
                                </Link>
                            </Button>
                             <p className="mt-4">
                                Setelah siswa menyimak teks tersebut, mereka harus mencentang pernyataan benar atau salah dalam tabel di bawah dan memberikan bukti informasi yang mendukung analisis mereka.
                            </p>
                        </div>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Tabel 1.1 Pernyataan Benar atau Salah</CardTitle>
                            </CardHeader>
                             <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">No.</TableHead>
                                            <TableHead>Pernyataan</TableHead>
                                            <TableHead className="w-[100px] text-center">Benar</TableHead>
                                            <TableHead className="w-[100px] text-center">Salah</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {statements.map((item) => (
                                        <TableRow key={item.no}>
                                            <TableCell>{item.no}</TableCell>
                                            <TableCell>
                                                <p>{item.statement}</p>
                                                <p className="font-semibold mt-2">Bukti Informasi:</p>
                                                <p className="text-muted-foreground italic">(Siswa mengisi bagian ini)</p>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="w-5 h-5 border rounded-sm mx-auto"></div>
                                            </TableCell>
                                             <TableCell className="text-center">
                                                 <div className="w-5 h-5 border rounded-sm mx-auto"></div>
                                            </TableCell>
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
