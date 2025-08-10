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

const chapters = [
  {
    title: "Bab 1: Membicarakan Teks Deskripsi",
    description: "Guru Mapel: Kuswara Senjaya, S.Pd.",
    href: "/student/materi/1",
    icon: BookOpen,
    disabled: false
  },
   {
    title: "Bab 2",
    description: "Segera Hadir",
    href: "#",
    icon: BookOpen,
    disabled: true
  }
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
                Selamat Datang!
              </h2>
              <p className="text-sm text-muted-foreground">
                Silakan pilih bab yang ingin Anda pelajari.
              </p>
           </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chapters.map((chapter) => (
              <Link href={chapter.href} key={chapter.title} className={`flex ${chapter.disabled ? "pointer-events-none" : ""}`}>
                <Card className={`w-full p-4 rounded-xl shadow-md flex items-center gap-4 ${chapter.disabled ? "bg-slate-100/50 opacity-50" : "hover:bg-slate-100 transition-colors"}`}>
                   <div className="bg-primary/10 p-3 rounded-lg">
                    <chapter.icon className="w-8 h-8 text-primary" />
                   </div>
                   <div>
                    <p className="font-semibold text-base">{chapter.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{chapter.description}</p>
                   </div>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
