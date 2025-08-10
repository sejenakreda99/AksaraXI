'use client';

import { useEffect, useState } from 'react';
import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, CheckCircle, FileText, PenSquare, Pencil, Presentation, HelpCircle, Edit } from "lucide-react";
import Link from "next/link";
import { getChapterContent } from './actions';
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
        const data = await getChapterContent();
        setContent(data);
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
                                     <ul className="list-disc pl-5">
                                        {content.keywords.map((keyword, i) => <li key={i}>{keyword}</li>)}
                                    </ul>
                                ) : <p>Belum ada kata kunci.</p>}
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