'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Youtube, Check, X, FileText } from 'lucide-react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Statement = {
  no: number;
  statement: string;
  answer: 'benar' | 'salah';
  points: number;
  evidencePoints: number;
};

type MenyimakContent = {
  learningObjective: string;
  youtubeUrl: string;
  statements: Statement[];
};

export default function ChapterPage({ params }: { params: { id: string, slug: string } }) {
  const [content, setContent] = useState<MenyimakContent | null>(null);
  const [loading, setLoading] = useState(true);

  // This will be used later to store student's answers
  const [answers, setAnswers] = useState<Record<string, { choice: 'benar' | 'salah' | ''; evidence: string }>>({});

  useEffect(() => {
    async function fetchContent() {
      if (params.slug !== 'menyimak') return setLoading(false);
      try {
        const docRef = doc(db, 'chapters', params.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().menyimak) {
          const fetchedContent = docSnap.data().menyimak as MenyimakContent;
          setContent(fetchedContent);
          // Initialize answers state
          const initialAnswers: Record<string, { choice: '', evidence: '' }> = {};
          fetchedContent.statements.forEach(stmt => {
            initialAnswers[stmt.no] = { choice: '', evidence: '' };
          });
          setAnswers(initialAnswers);
        }
      } catch (error) {
        console.error("Failed to fetch content:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [params.id, params.slug]);

  const handleAnswerChange = (no: number, type: 'choice' | 'evidence', value: string) => {
    setAnswers(prev => ({
      ...prev,
      [no]: { ...prev[no], [type]: value }
    }));
  };

  const title = params.slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  if (params.slug !== 'menyimak') {
      return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-full">
                <header className="bg-card border-b p-4 md:p-6">
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                <p className="text-muted-foreground mt-1">Bab {params.id}: Membicarakan Teks Deskripsi</p>
                </header>
                <main className="flex-1 p-4 md:p-8">
                <Card>
                    <CardHeader>
                    <CardTitle>Konten Pembelajaran</CardTitle>
                    <CardDescription>
                        Materi untuk bagian ini sedang dalam pengembangan.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="prose max-w-none">
                        <p>
                        Kerangka untuk halaman ini telah berhasil dibuat. Anda dapat mulai menambahkan materi pembelajaran, video, kuis interaktif, dan aktivitas kelompok di sini.
                        </p>
                    </div>
                    </CardContent>
                </Card>
                </main>
            </div>
        </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <header className="bg-card border-b p-4 md:p-6">
          <h1 className="text-2xl font-bold text-foreground">A. {title}</h1>
          <p className="text-muted-foreground mt-1">Bab {params.id}: Membicarakan Teks Deskripsi</p>
        </header>
        <main className="flex-1 p-4 md:p-8">
            {loading ? (
                <Card>
                    <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="aspect-video w-full" />
                        <Skeleton className="h-48 w-full" />
                    </CardContent>
                </Card>
            ) : content ? (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tujuan Pembelajaran</CardTitle>
                            <CardDescription>{content.learningObjective}</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                         <CardHeader>
                            <CardTitle>Kegiatan 1: Menganalisis Teks Deskripsi</CardTitle>
                            <CardDescription>Simak video di bawah ini dengan saksama, lalu kerjakan tugas yang diberikan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="aspect-video w-full rounded-lg overflow-hidden">
                                <iframe
                                    className="w-full h-full"
                                    src={`https://www.youtube.com/embed/${new URL(content.youtubeUrl).searchParams.get('v')}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <Button asChild>
                                <Link href={content.youtubeUrl} target="_blank">
                                <Youtube className="mr-2 h-4 w-4" />
                                Buka di YouTube
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                         <CardHeader>
                            <CardTitle>Tugas: Penilaian Pernyataan</CardTitle>
                            <CardDescription>Tentukan apakah pernyataan berikut benar atau salah, dan berikan bukti informasi dari video yang telah Anda simak.</CardDescription>
                        </CardHeader>
                         <CardContent className="space-y-6">
                            <form>
                                {content.statements.map((stmt, index) => (
                                    <div key={stmt.no} className="border p-4 rounded-lg">
                                        <p className="font-semibold">Pernyataan #{stmt.no}</p>
                                        <p className="mt-1">{stmt.statement}</p>
                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <Label>Tentukan jawaban Anda:</Label>
                                                <RadioGroup 
                                                    className="flex gap-4 mt-2"
                                                    onValueChange={(value) => handleAnswerChange(stmt.no, 'choice', value)}
                                                    value={answers[stmt.no]?.choice}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="benar" id={`r-${stmt.no}-benar`} />
                                                        <Label htmlFor={`r-${stmt.no}-benar`}>Benar</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="salah" id={`r-${stmt.no}-salah`} />
                                                        <Label htmlFor={`r-${stmt.no}-salah`}>Salah</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                             <div>
                                                <Label htmlFor={`evidence-${stmt.no}`}>Tuliskan bukti informasinya:</Label>
                                                <Textarea 
                                                    id={`evidence-${stmt.no}`}
                                                    className="mt-2" 
                                                    placeholder="Tuliskan bukti pendukung dari video di sini..."
                                                    rows={4}
                                                    onChange={(e) => handleAnswerChange(stmt.no, 'evidence', e.target.value)}
                                                    value={answers[stmt.no]?.evidence}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button type="submit" className="mt-6 w-full" disabled>
                                    <FileText className="mr-2 h-4 w-4"/>
                                    Simpan & Kirim Jawaban (Segera)
                                </Button>
                            </form>
                         </CardContent>
                    </Card>

                </div>
            ) : (
                <Card>
                    <CardHeader><CardTitle>Konten Tidak Tersedia</CardTitle></CardHeader>
                    <CardContent><p>Materi untuk bagian ini belum disiapkan oleh guru.</p></CardContent>
                </Card>
            )}
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
