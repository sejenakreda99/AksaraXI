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
} from '@/components/ui/card';
import AuthenticatedLayout from '../(authenticated)/layout';

const chapterSections = [
  {
    title: 'Menyimak',
    icon: BookOpen,
    href: '/student/chapter/1/menyimak',
  },
  {
    title: 'Membaca',
    icon: FileText,
    href: '/student/chapter/1/membaca',
  },
  {
    title: 'Menulis',
    icon: Pencil,
    href: '/student/chapter/1/menulis',
  },
  {
    title: 'Mempresentasikan',
    icon: Presentation,
    href: '/student/chapter/1/mempresentasikan',
  },
  {
    title: 'Asesmen',
    icon: CheckCircle,
    href: '/student/chapter/1/asesmen',
  },
  {
    title: 'Jurnal',
    icon: Book,
    href: '/student/chapter/1/jurnal',
  },
  {
    title: 'Refleksi',
    icon: PenSquare,
    href: '/student/chapter/1/refleksi',
  },
];

export default function StudentDashboard() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full bg-slate-50">
        <header className="p-6 text-center bg-background border-b">
          <h1 className="text-xl font-bold uppercase text-foreground">
            Portal Siswa
          </h1>
        </header>

        <main className="flex-1 p-4 md:p-6">
           <div className="text-center mb-6">
              <h2 className="text-lg font-semibold">
                Bab 1: Membicarakan Teks Deskripsi
              </h2>
              <p className="text-sm text-muted-foreground">
                Guru Mapel: Kuswara Senjaya, S.Pd.
              </p>
           </div>
          <div className="grid grid-cols-2 gap-4">
            {chapterSections.map((section) => (
              <Link href={section.href} key={section.title} className="flex">
                <Card className="w-full aspect-square flex flex-col items-center justify-center p-4 hover:bg-slate-100 transition-colors rounded-xl shadow-md">
                   <div className="p-3 bg-primary/10 rounded-full mb-3">
                      <section.icon className="w-8 h-8 text-primary" />
                   </div>
                   <p className="font-semibold text-center text-sm">{section.title}</p>
                </Card>
              </Link>
            ))}
             <Card className="w-full aspect-square flex flex-col items-center justify-center p-4 bg-slate-100/50 rounded-xl shadow-md opacity-50">
               <div className="p-3 bg-primary/10 rounded-full mb-3">
                  <BookOpen className="w-8 h-8 text-primary" />
               </div>
               <p className="font-semibold text-center text-sm">Bab 2 (Segera)</p>
            </Card>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
