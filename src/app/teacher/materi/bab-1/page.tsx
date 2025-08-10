
'use client';

import { useEffect, useState } from 'react';
import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, CheckCircle, FileText, PenSquare, Pencil, Presentation, HelpCircle, Edit, BarChart, Lock, Unlock } from "lucide-react";
import Link from "next/link";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


const initialSections = [
  { id: "pertanyaan-pemantik", title: "Pertanyaan Pemantik", href: "/teacher/materi/bab-1/pertanyaan-pemantik", icon: HelpCircle },
  { id: "menyimak", title: "A. Menyimak Teks Deskripsi", href: "/teacher/materi/bab-1/menyimak", icon: BookOpen },
  { id: "membaca", title: "B. Membaca Teks Deskripsi", href: "/teacher/materi/bab-1/membaca", icon: FileText },
  { id: "menulis", title: "C. Menulis Teks Deskripsi", href: "/teacher/materi/bab-1/menulis", icon: Pencil },
  { id: "mempresentasikan", title: "D. Mempresentasikan Teks Deskripsi", href: "/teacher/materi/bab-1/mempresentasikan", icon: Presentation },
  { id: "asesmen", title: "E. Asesmen", href: "/teacher/materi/bab-1/asesmen", icon: CheckCircle },
  { id: "laporan", title: "Laporan & Penilaian", href: "/teacher/progress?bab=1", icon: BarChart },
  { id: "jurnal-membaca", title: "Jurnal Membaca", href: "/teacher/materi/bab-1/jurnal-membaca", icon: BookOpen },
  { id: "refleksi", title: "Refleksi", href: "/teacher/materi/bab-1/refleksi", icon: PenSquare },
];

type ChapterContent = {
  introduction: string;
  learningObjective: string;
  keywords: string[];
  sectionStatus: Record<string, boolean>;
}

export default function Bab1Page() {
  const [content, setContent] = useState<ChapterContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchContent() {
      try {
        const docRef = doc(db, 'chapters', '1');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Initialize sectionStatus if it doesn't exist
            if (!data.sectionStatus) {
                data.sectionStatus = initialSections.reduce((acc, section) => {
                    acc[section.id] = false; // Default to locked
                    return acc;
                }, {} as Record<string, boolean>);
                 await setDoc(docRef, { sectionStatus: data.sectionStatus }, { merge: true });
            }
            setContent(data as ChapterContent);
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

  const handleStatusChange = async (sectionId: string, newStatus: boolean) => {
    if (!content) return;

    const updatedStatus = { ...content.sectionStatus, [sectionId]: newStatus };
    setContent({ ...content, sectionStatus: updatedStatus });

    try {
        const docRef = doc(db, 'chapters', '1');
        await setDoc(docRef, { sectionStatus: updatedStatus }, { merge: true });
         toast({
            title: "Status Diperbarui",
            description: `Materi "${initialSections.find(s => s.id === sectionId)?.title}" telah di${newStatus ? 'aktifkan' : 'nonaktifkan'}.`,
        });
    } catch (error) {
        console.error("Failed to update status:", error);
         toast({
            variant: "destructive",
            title: "Gagal",
            description: "Tidak dapat memperbarui status materi.",
        });
        // Revert UI change on error
        const revertedStatus = { ...content.sectionStatus, [sectionId]: !newStatus };
        setContent({ ...content, sectionStatus: revertedStatus });
    }
  }


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
                <CardHeader className="flex flex-row items-start justify-between">
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
                <CardContent className="prose max-w-none text-sm space-y-4">
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Separator/>
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-1/2" />
                        </div>
                    ) : (
                        <>
                            <p className="text-justify">
                                <strong>Pengantar:</strong> {content?.introduction || "Belum ada konten."}
                            </p>
                            <Separator/>
                            <p className="text-justify">
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
                <CardTitle>Struktur & Kontrol Bab</CardTitle>
                <CardDescription>
                  Aktifkan atau non-aktifkan setiap bagian materi untuk mengontrol akses siswa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {initialSections.map((section) => {
                    const isActive = content?.sectionStatus?.[section.id] ?? false;
                    return (
                    <Card key={section.id} className={cn("p-4 flex flex-col justify-between", !isActive && "bg-slate-50")}>
                        <Link href={section.href} className="flex flex-col items-center justify-center text-center flex-1">
                           <section.icon className={cn("w-10 h-10 mb-2", isActive ? "text-primary": "text-slate-400")} />
                           <p className="font-semibold text-sm">{section.title}</p>
                        </Link>
                        <div className="flex items-center justify-center space-x-2 pt-4 mt-auto border-t">
                            <Label htmlFor={`switch-${section.id}`} className={cn("text-xs", isActive ? "text-green-600" : "text-slate-500")}>
                                {isActive ? 'Aktif' : 'Nonaktif'}
                            </Label>
                            <Switch
                                id={`switch-${section.id}`}
                                checked={isActive}
                                onCheckedChange={(checked) => handleStatusChange(section.id, checked)}
                                disabled={loading}
                            />
                        </div>
                    </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
