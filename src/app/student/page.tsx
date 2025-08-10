'use client';

import {
  BookOpen,
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((chapter) => (
              <Link href={chapter.href} key={chapter.title} className={`flex ${chapter.disabled ? "pointer-events-none" : ""}`}>
                <Card className={`w-full aspect-square flex flex-col items-center justify-center p-4 rounded-xl shadow-md ${chapter.disabled ? "bg-slate-100/50 opacity-50" : "hover:bg-slate-100 transition-colors"}`}>
                   <chapter.icon className="w-12 h-12 text-primary mb-2" />
                   <p className="font-semibold text-center text-sm">{chapter.title}</p>
                   <p className="text-xs text-muted-foreground text-center mt-1">{chapter.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
