
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, CheckCircle, FileText, PenSquare, Pencil, Presentation, HelpCircle, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ChapterData = {
  introduction: string;
  learningObjective: string;
  keywords: string[];
  sparkingQuestions: string[];
  sectionStatus: Record<string, boolean>;
}

async function getChapterData(id: string): Promise<ChapterData | null> {
    if (!id) return null;
    try {
        const docRef = doc(db, 'chapters', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as ChapterData;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Failed to fetch chapter content:", error);
        return null;
    }
}

const sectionsConfig = [
    { id: "menyimak", title: "A. Menyimak", icon: BookOpen, href: (id: string) => `/student/materi/${id}/menyimak` },
    { id: "membaca", title: "B. Membaca", icon: FileText, href: (id: string) => `/student/materi/${id}/membaca` },
    { id: "menulis", title: "C. Menulis", icon: Pencil, href: (id: string) => `/student/materi/${id}/menulis` },
    { id: "mempresentasikan", title: "D. Mempresentasikan", icon: Presentation, href: (id: string) => `/student/materi/${id}/mempresentasikan` },
    { id: "asesmen", title: "E. Asesmen", icon: CheckCircle, href: (id: string) => `/student/materi/${id}/asesmen` },
    { id: "jurnal-membaca", title: "Jurnal Membaca", icon: BookOpen, href: (id: string) => `/student/materi/${id}/jurnal-membaca` },
    { id: "refleksi", title: "Refleksi", icon: PenSquare, href: (id: string) => `/student/materi/${id}/refleksi` },
];


function ChapterDetails({ chapterId, data, loading }: { chapterId: string, data: ChapterData | null, loading: boolean }) {
    
    return (
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
                            <p className="text-justify">
                                <strong>Pengantar:</strong> {data?.introduction || "Konten belum tersedia."}
                            </p>
                            <Separator/>
                            <p className="text-justify">
                                <strong>Tujuan Pembelajaran:</strong> {data?.learningObjective || "Konten belum tersedia."}
                            </p>
                             <div>
                                <h3 className="font-semibold">Kata Kunci:</h3>
                                {data?.keywords && data.keywords.length > 0 ? (
                                     <div className="flex flex-wrap gap-2 mt-2">
                                        {data.keywords.map((keyword, i) => <span key={i} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">{keyword}</span>)}
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
                <CardDescription>Pikirkan pertanyaan ini sebelum Anda memulai petualangan belajar.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <Skeleton className="h-20 w-full" />
                ) : (
                    <ol className="list-decimal list-inside space-y-2 text-sm text-justify">
                        {data?.sparkingQuestions?.map((q, i) => <li key={i}>{q}</li>) ?? <p className="text-muted-foreground">Belum ada pertanyaan pemantik.</p>}
                    </ol>
                )}
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Peta Petualangan Belajar</CardTitle>
                    <CardDescription>
                        Ikuti setiap tahap untuk menyelesaikan bab ini. Tahap yang belum aktif akan dibuka oleh guru.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {loading ? (
                             Array.from({ length: 7 }).map((_, index) => (
                                <Card key={index} className="w-full aspect-square flex flex-col items-center justify-center p-4 rounded-xl shadow-md">
                                    <Skeleton className="w-10 h-10 rounded-full mb-2" />
                                    <Skeleton className="h-4 w-3/4" />
                                </Card>
                            ))
                        ) : (
                            sectionsConfig.map((section) => {
                                const isLocked = !(data?.sectionStatus?.[section.id] ?? false);
                                const Icon = section.icon;

                                const cardContent = (
                                <Card className={cn(
                                        "w-full aspect-square flex flex-col items-center justify-center p-4 rounded-xl shadow-md text-center transition-all duration-300",
                                        isLocked && "bg-slate-100 opacity-60 cursor-not-allowed",
                                        !isLocked && "hover:bg-slate-100 ring-2 ring-primary ring-offset-2"
                                    )}>
                                    <div className="relative">
                                        {isLocked && <Lock className="absolute -top-2 -right-2 w-5 h-5 text-slate-500 bg-white rounded-full p-1 shadow-md" />}
                                        <Icon className={cn(
                                                "w-10 h-10 mb-2",
                                                isLocked ? "text-slate-400" : "text-primary"
                                            )} />
                                    </div>
                                    <p className={cn(
                                            "font-semibold text-sm",
                                            isLocked ? "text-slate-500" : "text-primary"
                                        )}>{section.title}</p>
                                        {!isLocked && <p className="text-xs font-bold text-green-500 mt-1">Terbuka!</p>}
                                </Card>
                                );

                                if (isLocked) {
                                    return <div key={section.id} className="flex">{cardContent}</div>;
                                }
                                
                                return (
                                    <Link href={section.href(chapterId)} key={section.id} className="flex">
                                        {cardContent}
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function BabSiswaPage() {
    const params = useParams();
    const chapterId = params.id as string;

  const [data, setData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      if (!chapterId) return;
      setLoading(true);
      const fetchedData = await getChapterData(chapterId);
      setData(fetchedData);
      setLoading(false);
    }
    fetchContent();
  }, [chapterId]);

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full bg-slate-50">
         <header className="bg-background border-b p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                <Button asChild variant="outline" size="sm" className="mb-4">
                    <Link href="/student">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Daftar Bab
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold text-foreground">Bab {chapterId}: Membicarakan Teks Deskripsi</h1>
                <p className="text-muted-foreground mt-1">Tema: Keindahan Alam Indonesia</p>
            </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
            <ChapterDetails chapterId={chapterId} data={data} loading={loading} />
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
