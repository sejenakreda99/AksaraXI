
'use client';

import { useEffect, useState } from 'react';
import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, CheckCircle, FileText, PenSquare, Pencil, Presentation, HelpCircle, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const sections = [
  { title: "A. Menyimak Teks Deskripsi", href: "/student/materi/bab-1/menyimak", icon: BookOpen },
  { title: "B. Membaca Teks Deskripsi", href: "/student/materi/bab-1/membaca", icon: FileText },
  { title: "C. Menulis Teks Deskripsi", href: "/student/materi/bab-1/menulis", icon: Pencil },
  { title: "D. Mempresentasikan Teks Deskripsi", href: "/student/materi/bab-1/mempresentasikan", icon: Presentation },
  { title: "E. Asesmen", href: "/student/materi/bab-1/asesmen", icon: CheckCircle },
  { title: "Jurnal Membaca", href: "/student/materi/bab-1/jurnal-membaca", icon: BookOpen },
  { title: "Refleksi", href: "/student/materi/bab-1/refleksi", icon: PenSquare },
];

type ChapterContent = {
  introduction: string;
  learningObjective: string;
  keywords: string[];
  sparkingQuestions: string[];
}

export default function BabSiswaPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<ChapterContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      if (!params.id) return;
      try {
        const docRef = doc(db, 'chapters', params.id);
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
  }, [params.id]);

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
         <header className="bg-card border-b p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                <Button asChild variant="outline" size="sm" className="mb-4">
                    <Link href="/student">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Daftar Bab
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold text-foreground">Bab {params.id}: Membicarakan Teks Deskripsi</h1>
                <p className="text-muted-foreground mt-1">Tema: Keindahan Alam Indonesia</p>
            </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle>Pengantar & Tujuan Pembelajaran</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none text-sm space-y-4">
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Separator />
                            <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-1/2" />
                        </div>
                    ) : (
                        <>
                            <p>
                                <strong>Pengantar:</strong> {content?.introduction || "Konten belum tersedia."}
                            </p>
                            <Separator/>
                            <p>
                                <strong>Tujuan Pembelajaran:</strong> {content?.learningObjective || "Konten belum tersedia."}
                            </p>
                             <div>
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
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-6 h-6 text-primary" />
                    <CardTitle>Pertanyaan Pemantik</CardTitle>
                  </div>
                <CardDescription>Pikirkan pertanyaan ini sebelum Anda memulai bab.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <Skeleton className="h-20 w-full" />
                ) : (
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        {content?.sparkingQuestions?.map((q, i) => <li key={i}>{q}</li>) ?? <p className="text-muted-foreground">Belum ada pertanyaan pemantik.</p>}
                    </ol>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mulai Belajar</CardTitle>
                <CardDescription>
                  Berikut adalah kerangka materi untuk Bab {params.id}. Klik setiap bagian untuk memulai kegiatan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sections.map((section, index) => (
                    <Link href={section.href} key={index} className="block rounded-md hover:bg-slate-50 transition-colors">
                       <div className="flex items-center justify-between p-3">
                          <div className="flex items-center">
                            <section.icon className="h-5 w-5 mr-3 text-primary" />
                            <span className="font-medium">{section.title}</span>
                          </div>
                           <ArrowRight className="h-5 w-5 text-muted-foreground" />
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

    