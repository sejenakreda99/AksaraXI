'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Youtube, FileText, ArrowLeft } from 'lucide-react';
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

export default function MenyimakSiswaPage() {
  const [content, setContent] = useState<MenyimakContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<
    Record<string, { choice: 'benar' | 'salah' | ''; evidence: string }>
  >({});
  const chapterId = '1'; // sementara hardcode

  useEffect(() => {
    async function fetchContent() {
      try {
        // FIX: Path is changed to match teacher's data structure
        const docRef = doc(db, 'chapters', chapterId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().menyimak) {
          const fetchedContent = docSnap.data().menyimak as MenyimakContent;
          setContent(fetchedContent);
          const initialAnswers: Record<string, { choice: '' | 'benar' | 'salah'; evidence: '' }> = {};
          fetchedContent.statements.forEach((stmt) => {
            initialAnswers[stmt.no.toString()] = { choice: '', evidence: '' };
          });
          setAnswers(initialAnswers);
        }
      } catch (error) {
        console.error('Failed to fetch content:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [chapterId]);

  const handleAnswerChange = (no: number, type: 'choice' | 'evidence', value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [no]: { ...prev[no], [type]: value },
    }));
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      const videoUrl = new URL(url);
      let videoId = videoUrl.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      const pathSegments = videoUrl.pathname.split('/');
      const shortId = pathSegments[pathSegments.length - 1];
      if (shortId) {
        return `https://www.youtube.com/embed/${shortId}`;
      }
    } catch (error) {
      console.error('Invalid YouTube URL', error);
      return '';
    }
    return '';
  };

  return (
    <div className="flex flex-col h-full">
      <header className="bg-card border-b p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/student/materi/1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Halaman Bab
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">A. Menyimak</h1>
          <p className="text-muted-foreground mt-1">
            Bab {chapterId}: Membicarakan Teks Deskripsi
          </p>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
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
                  <CardDescription>
                    Simak video di bawah ini dengan saksama, lalu kerjakan tugas yang diberikan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {content.youtubeUrl ? (
                    <div className="aspect-video w-full rounded-lg overflow-hidden border">
                      <iframe
                        className="w-full h-full"
                        src={getYoutubeEmbedUrl(content.youtubeUrl)}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Video belum ditambahkan oleh guru.</p>
                  )}

                  {content.youtubeUrl && (
                    <Button asChild variant="outline">
                      <Link href={content.youtubeUrl} target="_blank">
                        <Youtube className="mr-2 h-4 w-4" /> Buka di YouTube
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tugas: Penilaian Pernyataan</CardTitle>
                  <CardDescription>
                    Tentukan apakah pernyataan berikut benar atau salah, dan berikan bukti informasi
                    dari video yang telah Anda simak.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form>
                    {content.statements.map((stmt) => (
                      <div key={stmt.no} className="border p-4 rounded-lg bg-slate-50/50">
                        <p className="font-semibold">Pernyataan #{stmt.no}</p>
                        <p className="mt-1 text-sm">{stmt.statement}</p>
                        <div className="mt-4 space-y-4">
                          <div>
                            <Label className="font-medium">Tentukan jawaban Anda:</Label>
                            <RadioGroup
                              className="flex gap-4 mt-2"
                              onValueChange={(value) =>
                                handleAnswerChange(stmt.no, 'choice', value)
                              }
                              value={answers[stmt.no.toString()]?.choice}
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
                            <Label htmlFor={`evidence-${stmt.no}`} className="font-medium">
                              Tuliskan bukti informasinya:
                            </Label>
                            <Textarea
                              id={`evidence-${stmt.no}`}
                              className="mt-2 bg-white"
                              placeholder="Tuliskan bukti pendukung dari video di sini..."
                              rows={4}
                              onChange={(e) =>
                                handleAnswerChange(stmt.no, 'evidence', e.target.value)
                              }
                              value={answers[stmt.no.toString()]?.evidence}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button type="submit" className="mt-6 w-full" disabled>
                      <FileText className="mr-2 h-4 w-4" /> Simpan & Kirim Jawaban (Segera)
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Konten Tidak Tersedia</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Materi untuk bagian ini belum disiapkan oleh guru.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
