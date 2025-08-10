
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, CheckCircle, FileText, PenSquare, Pencil, Presentation, HelpCircle, ArrowLeft, Lock, Youtube, ClipboardCheck, ClipboardList } from "lucide-react";
import Link from "next/link";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ChapterContent = {
  introduction: string;
  learningObjective: string;
  keywords: string[];
  sparkingQuestions: string[];
}

async function getChapterContent(id: string): Promise<ChapterContent | null> {
    if (!id) return null;
    try {
        const docRef = doc(db, 'chapters', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as ChapterContent;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Failed to fetch chapter content:", error);
        return null;
    }
}

function ChapterDetails({ chapterId, content, loading }: { chapterId: string, content: ChapterContent | null, loading: boolean }) {
    
    const initialSections = [
      { title: "A. Menyimak", slug: "menyimak", icon: BookOpen, status: 'completed' },
      { title: "B. Membaca", slug: "membaca", icon: FileText, status: 'active' },
      { title: "C. Menulis", slug: "menulis", icon: Pencil, status: 'locked' },
      { title: "D. Mempresentasikan", slug: "mempresentasikan", icon: Presentation, status: 'locked' },
      { title: "E. Asesmen", slug: "asesmen", icon: CheckCircle, status: 'locked' },
      { title: "Jurnal Membaca", slug: "jurnal-membaca", icon: BookOpen, status: 'locked' },
      { title: "Refleksi", slug: "refleksi", icon: PenSquare, status: 'locked' },
    ];
    
    const sections = initialSections.map(section => ({
        ...section,
        href: `/student/materi/${chapterId}/${section.slug}`
    }));

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
                <CardDescription>Pikirkan pertanyaan ini sebelum Anda memulai petualangan belajar.</CardDescription>
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
                    <CardTitle>Peta Petualangan Belajar</CardTitle>
                    <CardDescription>
                        Ikuti setiap tahap untuk menyelesaikan bab ini. Tahap berikutnya akan terbuka setelah Anda menyelesaikan tahap sebelumnya.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {sections.map((section, index) => {
                            const isLocked = section.status === 'locked';
                            const isActive = section.status === 'active';
                            const isCompleted = section.status === 'completed';
                            const Icon = section.icon;

                            const cardContent = (
                               <Card className={cn(
                                    "w-full aspect-square flex flex-col items-center justify-center p-4 rounded-xl shadow-md text-center transition-all duration-300",
                                    isLocked && "bg-slate-100/50 opacity-50 cursor-not-allowed",
                                    isActive && "ring-2 ring-primary ring-offset-2",
                                    isCompleted && "bg-green-50 border-green-200",
                                    !isLocked && "hover:bg-slate-100"
                                )}>
                                   <div className="relative">
                                       {isLocked && <Lock className="absolute -top-1 -right-1 w-4 h-4 text-slate-500 bg-white rounded-full p-0.5" />}
                                       <Icon className={cn(
                                            "w-10 h-10 mb-2",
                                            isLocked && "text-slate-400",
                                            isActive && "text-primary",
                                            isCompleted && "text-green-500"
                                        )} />
                                   </div>
                                   <p className={cn(
                                        "font-semibold text-sm",
                                        isLocked && "text-slate-500",
                                        isActive && "text-primary",
                                        isCompleted && "text-green-600"
                                    )}>{section.title}</p>
                                    {isCompleted && <p className="text-xs font-bold text-green-500 mt-1">Selesai!</p>}
                               </Card>
                            );

                            if (isLocked) {
                                return <div key={index} className="flex">{cardContent}</div>;
                            }
                            
                            return (
                                <Link href={section.href} key={index} className="flex">
                                    {cardContent}
                                </Link>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function BabSiswaPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const chapterId = params.id as string;

    // This is the new hub page logic.
    // If a slug is present, it means we are on a hub page.
    if (slug) {
         const activityCards = {
            menyimak: [
                {
                    title: "Kegiatan 1: Menganalisis Teks Deskripsi",
                    kegiatan: "1", 
                    icon: Youtube,
                    description: "Menganalisis video dan menilai kebenaran pernyataan.",
                    disabled: false,
                },
                {
                    title: "Kegiatan 2: Mengevaluasi Gagasan",
                    kegiatan: "2",
                    icon: ClipboardCheck,
                    description: "Menjawab pertanyaan analisis dan membandingkan video.",
                    disabled: false, 
                },
                {
                    title: "Latihan",
                    kegiatan: "3",
                    icon: ClipboardList,
                    description: "Menganalisis video baru dan menilai gagasan narator.",
                    disabled: false,
                }
            ],
            membaca: [ 
                {
                    title: "Kegiatan 1: Menganalisis Teks",
                    kegiatan: "1",
                    icon: FileText,
                    description: "Baca dan pahami teks deskripsi, lalu kerjakan tugasnya.",
                    disabled: false
                }
            ]
        };

        const currentActivities = activityCards[slug as keyof typeof activityCards] || [];

        return (
            <AuthenticatedLayout>
                <div className="flex flex-col h-full">
                    <header className="bg-card border-b p-4 md:p-6">
                        <div className="max-w-4xl mx-auto">
                            <Button asChild variant="outline" size="sm" className="mb-4">
                                <Link href={`/student/materi/${chapterId}`}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali ke Peta Petualangan
                                </Link>
                            </Button>
                            <h1 className="text-2xl font-bold text-foreground capitalize">{slug}</h1>
                             <p className="text-muted-foreground mt-1">
                                Bab {chapterId}: Membicarakan Teks Deskripsi
                            </p>
                        </div>
                    </header>
                    <main className="flex-1 p-4 md:p-8">
                        <div className="max-w-4xl mx-auto">
                             {currentActivities.length > 0 ? (
                                 <Card>
                                    <CardHeader>
                                        <CardTitle>Pilih Kegiatan</CardTitle>
                                        <CardDescription>Pilih kegiatan yang ingin Anda mulai dari tahap &quot;{slug}&quot; ini.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentActivities.map((act) => {
                                             const cardContent = (
                                                <Card className={cn(
                                                    "w-full p-6 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors hover:shadow-lg rounded-xl",
                                                    act.disabled && "bg-slate-50 opacity-60 cursor-not-allowed"
                                                )}>
                                                   <act.icon className="w-12 h-12 text-primary mb-3" />
                                                   <h3 className="font-semibold text-lg">{act.title}</h3>
                                                   <p className="text-sm text-muted-foreground mt-1">{act.description}</p>
                                                </Card>
                                             );

                                             if(act.disabled) {
                                                 return <div key={act.title} className="flex">{cardContent}</div>
                                             }
                                             
                                             const href = `/student/materi/${chapterId}/${slug}?kegiatan=${act.kegiatan}`;

                                             return (
                                                <Link href={href} key={act.title} className="flex">
                                                    {cardContent}
                                                </Link>
                                             )
                                        })}
                                    </CardContent>
                                </Card>
                             ) : (
                                 <Card>
                                    <CardHeader>
                                        <CardTitle>Segera Hadir</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p>Konten untuk bagian &quot;{slug}&quot; belum tersedia. Silakan periksa kembali nanti.</p>
                                    </CardContent>
                                 </Card>
                             )}
                        </div>
                    </main>
                </div>
            </AuthenticatedLayout>
        );
    }

  // This is the main Chapter page content (Peta Petualangan)
  const [content, setContent] = useState<ChapterContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      if (!chapterId) return;
      setLoading(true);
      const fetchedContent = await getChapterContent(chapterId);
      setContent(fetchedContent);
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
            <ChapterDetails chapterId={chapterId} content={content} loading={loading} />
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
