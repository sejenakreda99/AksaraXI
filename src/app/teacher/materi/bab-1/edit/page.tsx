'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { TeacherHeader } from '@/components/layout/teacher-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getChapterContent, updateChapterContent, State } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type ChapterContent = {
  introduction: string;
  learningObjective: string;
  keywords: string[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      {pending ? 'Menyimpan...' : 'Simpan Perubahan'}
    </Button>
  );
}

export default function EditBab1Page() {
  const [content, setContent] = useState<ChapterContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const initialState: State = { message: null, errors: {} };
  const [state, dispatch] = useFormState(updateChapterContent, initialState);

  useEffect(() => {
    async function fetchContent() {
      try {
        const data = await getChapterContent();
        setContent(data);
      } catch (error) {
        console.error("Failed to fetch chapter content:", error);
        toast({
            variant: "destructive",
            title: "Gagal Memuat Konten",
            description: "Tidak dapat mengambil data dari server."
        })
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [toast]);

  useEffect(() => {
    if (state.message) {
        if (state.errors) {
            toast({
                variant: "destructive",
                title: "Gagal",
                description: state.message,
            });
        } else {
             toast({
                title: "Berhasil",
                description: state.message,
            });
        }
    }
  }, [state, toast]);

  if (loading) {
    return (
         <AuthenticatedLayout>
            <div className="flex flex-col h-full">
                <TeacherHeader title="Edit Bab 1" description="Mengubah konten pengantar dan tujuan pembelajaran." />
                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <Skeleton className="h-10 w-40 mb-4" />
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardHeader>
                            <CardContent className="space-y-6">
                               <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-24 w-full" />
                                </div>
                                 <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-24 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <Skeleton className="h-10 w-48" />
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    )
  }
  
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="Edit Bab 1"
          description="Ubah konten pengantar dan tujuan pembelajaran untuk Bab 1."
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Button asChild variant="outline">
                <Link href="/teacher/materi/bab-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Struktur Bab
                </Link>
              </Button>
            </div>
            <form action={dispatch}>
              <Card>
                <CardHeader>
                  <CardTitle>Formulir Konten Bab 1</CardTitle>
                  <CardDescription>
                    Perbarui teks di bawah ini. Perubahan akan langsung terlihat oleh siswa.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="introduction">Pengantar Bab</Label>
                    <Textarea
                      id="introduction"
                      name="introduction"
                      defaultValue={content?.introduction}
                      rows={8}
                      className="min-h-[150px]"
                    />
                    {state.errors?.introduction && <p className="text-sm font-medium text-destructive">{state.errors.introduction}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="learningObjective">Tujuan Pembelajaran</Label>
                    <Textarea
                      id="learningObjective"
                      name="learningObjective"
                      defaultValue={content?.learningObjective}
                       rows={4}
                       className="min-h-[100px]"
                    />
                     {state.errors?.learningObjective && <p className="text-sm font-medium text-destructive">{state.errors.learningObjective}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keywords">Kata Kunci</Label>
                     <Input
                        id="keywords"
                        name="keywords"
                        defaultValue={content?.keywords?.join(', ')}
                        placeholder="pisahkan dengan koma, contoh: teks, gagasan"
                    />
                     <p className="text-xs text-muted-foreground">Pisahkan setiap kata kunci dengan koma.</p>
                     {state.errors?.keywords && <p className="text-sm font-medium text-destructive">{state.errors.keywords}</p>}
                  </div>
                  <SubmitButton />
                </CardContent>
              </Card>
            </form>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
