'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Youtube, FileText, ArrowLeft, Loader2, BookCopy, Send } from 'lucide-react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Separator } from '@/components/ui/separator';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const [answers, setAnswers] = useState<
    Record<string, { choice: 'benar' | 'salah' | ''; evidence: string }>
  >({});
  const [activity2Answers, setActivity2Answers] = useState<Record<string, string>>({});
  const chapterId = '1';

  useEffect(() => {
    async function fetchContent() {
      if (!chapterId) return;
      setLoading(true);
      try {
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
        toast({
          variant: 'destructive',
          title: 'Gagal Memuat',
          description: 'Tidak dapat memuat konten materi.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [chapterId, toast]);

  const handleAnswerChange = (no: number, type: 'choice' | 'evidence', value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [no]: { ...prev[no], [type]: value },
    }));
  };

  const handleActivity2AnswerChange = (question: number, value: string) => {
    setActivity2Answers((prev) => ({
      ...prev,
      [question]: value,
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
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "Anda harus masuk untuk mengirimkan jawaban." });
        return;
    }

    setIsSubmitting(true);
    try {
        const submissionId = `${user.uid}_${chapterId}_menyimak`;
        const submissionRef = doc(db, 'submissions', submissionId);
        
        await setDoc(submissionRef, {
            studentId: user.uid,
            chapterId: chapterId,
            activity: 'menyimak',
            answers: answers,
            activity2Answers: activity2Answers,
            submittedAt: serverTimestamp()
        }, { merge: true });
        
        toast({
            title: "Berhasil!",
            description: "Jawaban Anda telah berhasil disimpan.",
        });

    } catch (error) {
        console.error("Error submitting answers:", error);
        toast({
            variant: "destructive",
            title: "Gagal Menyimpan",
            description: "Terjadi kesalahan saat menyimpan jawaban Anda.",
        });
    } finally {
        setIsSubmitting(false);
    }
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
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Umpan Balik & Teks Transkrip</CardTitle>
                  <CardDescription>
                    Setelah kalian menyatakan benar atau salah pernyataan tersebut yang disertai alasan atau bukti informasi, bandingkanlah jawaban kalian dengan penjelasan berikut. Teks deskripsi yang dilisankan dari laman YouTube tersebut dapat dituliskan sebagai berikut.
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none bg-slate-50/50 p-4 rounded-md">
                    <h4 className="font-bold">Candi Borobudur</h4>
                    <p>
                        Candi Borobudur adalah candi Budha yang paling besar dan mewah yang ada di Indonesia. Bentuk daripada candi ini nampak seperti piramida atau limas segi empat. Candi ini mempunyai banyak relief dan juga stupa. Karena kemegahan dan ukuran candi, membuat pesona candi bak gunung yang menjulang tinggi. Bahkan, dari arah kejauhan telah nampak dengan jelas akan pesona dari candi ini.
                    </p>
                    <p>
                        Candi Borobudur terdiri dari tiga tingkatan. Tingkat pertama paling bawah disebut dengan Kamadatu. Pada bagian akhir tingkatan ini, terdapat relief yang berjumlah 160 buah. Relief tersebut mengandung kisah tentang Kamawibangga, berbagai macam kisah tentang dosa.
                    </p>
                    <p>
                        Tingkat kedua disebut Rupadatu, berupa empat buah teras. Teras itu seolah membentuk lorong yang berputar. Pada tingkat Rupadatu, terdapat 1300 relief. Pada tingkat kedua ini pula terdapat patung Budha berukuran kecil. Jumlah keseluruhan patung Budha sebanyak 432 patung. Patung itu terletak pada suatu relung terbuka yang ada di sepanjang pagar langkan. Pagar langkan adalah suatu bentuk peralihan dari Rupadatu ke Arupadatu.
                    </p>
                    <p>
                        Tingkat paling atas dinamakan Arupadatu. Khusus untuk tingkat ini, sama sekali tidak ada hiasan relief pada dindingnya. Bentuk dari lantai Arupadatu berupa lingkaran. Di sini, ada 72 stupa kecil. Semua stupa kecil tersebut tersusun atas tiga buah barisan yang seolah mengelilingi stupa induk. Bentuk dari stupa kecil menyerupai lonceng. Di dalam stupa, terdapat patung Budha. Di bagian tengah Arupadatu, terdapat stupa induk. Stupa ini memiliki patung-patung Budha dan mempunyai ukuran paling besar daripada stupa lainnya.
                    </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>Kegiatan 2: Mengevaluasi Gagasan</CardTitle>
                    <CardDescription>
                        Simaklah kembali teks deskripsi “Candi Borobudur” melalui tautan video pada Kegiatan 1. Setelah itu, jawablah pertanyaan berikut!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        {[
                            { no: 1, q: "Seandainya kalian belum pernah secara langsung berkunjung ke Candi Borobudur, dapatkah kalian seolah-olah mengindra (melihat, mendengar, merasakan) Candi Borobudur setelah menyimak teks tersebut?" },
                            { no: 2, q: "Apa yang menarik dari penggambaran objek Candi Borobudur setelah menyimak teks tersebut?" },
                            { no: 3, q: "Mengapa narator mendeskripsikan Candi Borobudur itu mulai dari tingkat bawah sampai ke tingkat paling atas candi?" },
                            { no: 4, q: "Apakah narator berhasil menggambarkan secara rinci objek sehingga pembaca seakan-akan melihat, mendengar, atau merasakan objek yang dideskripsikan? Tunjukkan buktinya." },
                        ].map(item => (
                            <div key={item.no}>
                                <Label htmlFor={`activity2-q${item.no}`} className="font-semibold">{item.no}. {item.q}</Label>
                                <Textarea id={`activity2-q${item.no}`} className="mt-2" placeholder="Tuliskan jawaban Anda di sini..." onChange={e => handleActivity2AnswerChange(item.no, e.target.value)} value={activity2Answers[item.no] || ''} />
                            </div>
                        ))}
                    </div>

                    <Separator />

                    <div>
                        <p className="text-sm text-foreground">
                            Selanjutnya, simaklah tayangan dalam laman YouTube Property Inside dengan kata kunci pencarian bagaimana cara Gunadharma membangun Candi Borobudur atau bisa dipindai pada kode QR di samping. Lalu, bandingkan dengan teks deskripsi yang pertama kalian simak pada Kegiatan 1. Mana di antara kedua teks tersebut yang lebih baik deskripsinya?
                        </p>
                        <div className="mt-4 space-y-4">
                            <div className="aspect-video w-full rounded-lg overflow-hidden border">
                                <iframe className="w-full h-full" src="https://www.youtube.com/embed/u1yo-uJDsU4" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                            </div>
                            <Label htmlFor="comparison" className="font-semibold">Jawaban Perbandingan Anda:</Label>
                            <Textarea id="comparison" placeholder="Tuliskan hasil perbandingan Anda di sini..." rows={5} onChange={e => handleActivity2AnswerChange(5, e.target.value)} value={activity2Answers[5] || ''} />
                        </div>
                    </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {isSubmitting ? 'Mengirim...' : 'Simpan & Kirim Semua Jawaban'}
              </Button>
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
        </form>
      </main>
    </div>
  );
}
