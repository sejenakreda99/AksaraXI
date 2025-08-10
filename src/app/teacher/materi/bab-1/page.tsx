'use client';

import { useEffect, useState } from 'react';
import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, CheckCircle, FileText, PenSquare, Pencil, Presentation, HelpCircle, Edit } from "lucide-react";
import Link from "next/link";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const sections = [
  { title: "Pertanyaan Pemantik", href: "/teacher/materi/bab-1/pertanyaan-pemantik", icon: HelpCircle },
  { title: "A. Menyimak Teks Deskripsi", href: "/teacher/materi/bab-1/menyimak", icon: BookOpen },
  { title: "B. Membaca Teks Deskripsi", href: "/teacher/materi/bab-1/membaca", icon: FileText },
  { title: "C. Menulis Teks Deskripsi", href: "/teacher/materi/bab-1/menulis", icon: Pencil },
  { title: "D. Mempresentasikan Teks Deskripsi", href: "/teacher/materi/bab-1/mempresentasikan", icon: Presentation },
  { title: "E. Asesmen", href: "/teacher/materi/bab-1/asesmen", icon: CheckCircle },
  { title: "Jurnal Membaca", href: "/teacher/materi/bab-1/jurnal-membaca", icon: BookOpen },
  { title: "Refleksi", href: "/teacher/materi/bab-1/refleksi", icon: PenSquare },
];

type ChapterContent = {
  introduction: string;
  learningObjective: string;
  keywords: string[];
}

export default function Bab1Page() {
  const [content, setContent] = useState<ChapterContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const docRef = doc(db, 'chapters', '1');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setContent(docSnap.data() as ChapterContent);
        } else {
            console.log("No such document!");
        }
      } catch (error) {
        console.error("Failed to fetch chapter content:", error);
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
          title="Bab 1: Membicarakan Teks Deskripsi"
          description="Tema: Keindahan Alam Indonesia"
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
             <Card className="mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1.5">
                        <CardTitle>Pengantar & Tujuan Pembelajaran</CardTitle>
                        <CardDescription>Kelola konten pengantar dan tujuan untuk bab ini.</CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/teacher/materi/bab-1/edit">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="prose max-w-none text-sm">
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Separator className="my-4" />
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-1/2" />
                        </div>
                    ) : (
                        <>
                            <p>
                                <strong>Pengantar:</strong> {content?.introduction || "Belum ada konten."}
                            </p>
                             <Separator className="my-4" />
                            <p>
                                <strong>Tujuan Pembelajaran:</strong> {content?.learningObjective || "Belum ada konten."}
                            </p>
                             <div className="mt-4">
                                <h3 className="font-semibold">Kata Kunci:</h3>
                                {content?.keywords && content.keywords.length > 0 ? (
                                     <div className="flex flex-wrap gap-2 mt-2">
                                        {content.keywords.map((keyword, i) => <span key={i} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">{keyword}</span>)}
                                    </div>
                                ) : <p className="text-muted-foreground">Belum ada kata kunci.</p>}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Struktur Bab</CardTitle>
                <CardDescription>
                  Berikut adalah kerangka materi untuk Bab 1. Klik setiap bagian untuk mengelola konten.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                    <p>Mata Pelajaran: Bahasa Indonesia Tingkat Lanjut</p>
                    <p>Kelas: XI</p>
                    <p>Guru Mapel: Kuswara Senjaya, S.Pd.</p>
                </div>
                <Separator className="mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {sections.map((section, index) => (
                    <Link href={section.href} key={index} className="flex">
                       <Card className="w-full aspect-square flex flex-col items-center justify-center p-4 rounded-xl shadow-md hover:bg-slate-100 transition-colors text-center">
                           <section.icon className="w-10 h-10 text-primary mb-2" />
                           <p className="font-semibold text-sm">{section.title}</p>
                       </Card>
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
