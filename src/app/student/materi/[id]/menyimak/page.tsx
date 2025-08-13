
'use client';

import Link from "next/link";
import { useParams } from 'next/navigation';
import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Youtube, GitCompareArrows, PencilRuler, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";


const menyimakSections = [
    { 
        id: "tujuan", 
        title: "Tujuan Pembelajaran", 
        icon: Target, 
        href: (id: string) => `/student/materi/${id}/menyimak/tujuan`,
        description: "Pahami apa yang akan Anda capai di bagian ini."
    },
    { 
        id: "kegiatan-1", 
        title: "Kegiatan 1: Menganalisis", 
        icon: Youtube, 
        href: (id: string) => `/student/materi/${id}/menyimak/kegiatan-1`,
        description: "Menyimak video Candi Borobudur dan analisis isinya."
    },
    { 
        id: "kegiatan-2", 
        title: "Kegiatan 2: Membandingkan", 
        icon: GitCompareArrows, 
        href: (id: string) => `/student/materi/${id}/menyimak/kegiatan-2`,
        description: "Bandingkan dua video dan evaluasi sebuah dialog."
    },
    { 
        id: "latihan", 
        title: "Latihan Mandiri", 
        icon: PencilRuler, 
        href: (id: string) => `/student/materi/${id}/menyimak/latihan`,
        description: "Uji pemahaman Anda dengan video Danau Toba."
    },
];

export default function PetaPetualanganMenyimak() {
    const params = useParams();
    const chapterId = params.id as string;

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full bg-slate-50">
         <header className="bg-background border-b p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <Button asChild variant="outline" size="sm" className="mb-4">
                    <Link href={`/student/materi/${chapterId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Peta Petualangan Bab
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold text-foreground">A. Menyimak Teks Deskripsi</h1>
                <p className="text-muted-foreground mt-1">Ikuti setiap tahap dalam petualangan menyimak ini.</p>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {menyimakSections.map((section) => (
                        <Link href={section.href(chapterId)} key={section.id} className="flex">
                           <Card className="w-full flex flex-col items-center justify-center p-6 rounded-xl shadow-md hover:bg-slate-100 hover:ring-2 hover:ring-primary transition-all">
                                <section.icon className="w-12 h-12 text-primary mb-3" />
                                <CardTitle className="text-lg text-center">{section.title}</CardTitle>
                                <CardDescription className="text-center mt-2 text-sm">{section.description}</CardDescription>
                           </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
