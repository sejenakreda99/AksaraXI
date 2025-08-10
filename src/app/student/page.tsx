import {
  BookOpen,
  FileText,
  Pencil,
  Presentation,
  CheckCircle,
  Book,
  PenSquare,
} from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AuthenticatedLayout from '../(authenticated)/layout';

const chapterSections = [
  {
    title: 'A. Menyimak Teks Deskripsi',
    icon: BookOpen,
    href: '/student/chapter/1/menyimak',
    description: 'Dengarkan dan pahami contoh teks deskripsi.',
  },
  {
    title: 'B. Membaca Teks Deskripsi',
    icon: FileText,
    href: '/student/chapter/1/membaca',
    description: 'Baca dan analisis struktur teks deskripsi.',
  },
  {
    title: 'C. Menulis Teks Deskripsi',
    icon: Pencil,
    href: '/student/chapter/1/menulis',
    description: 'Latihan membuat teks deskripsi Anda sendiri.',
  },
  {
    title: 'D. Mempresentasikan Teks Deskripsi',
    icon: Presentation,
    href: '/student/chapter/1/mempresentasikan',
    description: 'Sajikan hasil tulisan Anda di depan kelompok.',
  },
  {
    title: 'E. Asesmen',
    icon: CheckCircle,
    href: '/student/chapter/1/asesmen',
    description: 'Uji pemahaman Anda tentang materi bab ini.',
  },
  {
    title: 'Jurnal Membaca',
    icon: Book,
    href: '/student/chapter/1/jurnal',
    description: 'Catat dan refleksikan bacaan Anda.',
  },
  {
    title: 'Refleksi',
    icon: PenSquare,
    href: '/student/chapter/1/refleksi',
    description: 'Renungkan proses belajar Anda selama bab ini.',
  },
];

export default function StudentDashboard() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full bg-gray-50/50">
        <header className="bg-primary text-primary-foreground p-6 shadow-md">
          <h1 className="text-3xl font-bold">Aksara XI</h1>
          <p className="text-lg">
            Bahasa Indonesia Tingkat Lanjut - Kelas XI
          </p>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">
                Bab 1: Membicarakan Teks Deskripsi Bertema Keindahan Alam Indonesia
              </CardTitle>
              <CardDescription>
                Guru Mapel: Kuswara Senjaya, S.Pd.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Selamat datang di Bab 1! Di sini Anda akan belajar memahami,
                menganalisis, dan membuat teks deskripsi yang memukau. Mari kita
                mulai petualangan literasi ini.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {chapterSections.map((section) => (
              <Link href={section.href} key={section.title} className="flex">
                <Card className="w-full flex flex-col hover:bg-accent/50 transition-colors">
                  <CardHeader className="flex-grow">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <section.icon className="w-10 h-10 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-center">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
