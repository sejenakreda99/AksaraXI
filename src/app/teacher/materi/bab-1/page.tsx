import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, CheckCircle, FileText, PenSquare, Pencil, Presentation } from "lucide-react";
import Link from "next/link";

const sections = [
  { title: "Tujuan Pembelajaran", href: "/teacher/materi/bab-1/tujuan-pembelajaran", icon: CheckCircle },
  { title: "Pertanyaan Pemantik", href: "/teacher/materi/bab-1/pertanyaan-pemantik", icon: PenSquare },
  { title: "A. Menyimak Teks Deskripsi", href: "/teacher/materi/bab-1/menyimak", icon: BookOpen },
  { title: "B. Membaca Teks Deskripsi", href: "/teacher/materi/bab-1/membaca", icon: FileText },
  { title: "C. Menulis Teks Deskripsi", href: "/teacher/materi/bab-1/menulis", icon: Pencil },
  { title: "D. Mempresentasikan Teks Deskripsi", href: "/teacher/materi/bab-1/mempresentasikan", icon: Presentation },
  { title: "E. Asesmen", href: "/teacher/materi/bab-1/asesmen", icon: CheckCircle },
  { title: "Jurnal Membaca", href: "/teacher/materi/bab-1/jurnal-membaca", icon: BookOpen },
  { title: "Refleksi", href: "/teacher/materi/bab-1/refleksi", icon: PenSquare },
];

export default function Bab1Page() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="Bab 1: Membicarakan Teks Deskripsi"
          description="Tema: Keindahan Alam Indonesia"
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Struktur Bab</CardTitle>
                <CardDescription>
                  Berikut adalah kerangka materi untuk Bab 1. Klik setiap bagian untuk mengelola konten.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                   <div className="text-sm text-muted-foreground">
                      <p>Mata Pelajaran: Bahasa Indonesia Tingkat Lanjut</p>
                      <p>Kelas: XI</p>
                      <p>Guru Mapel: Kuswara Senjaya, S.Pd.</p>
                   </div>
                   <Separator className="my-4" />
                  {sections.map((section, index) => (
                    <Link href={section.href} key={index} className="block">
                       <div className="flex items-center p-3 rounded-md hover:bg-slate-50 transition-colors">
                          <section.icon className="h-5 w-5 mr-3 text-primary" />
                          <span className="font-medium">{section.title}</span>
                       </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
