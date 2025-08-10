
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Youtube, FileText, ArrowLeft, Loader2, BookCopy, Send, ClipboardCheck, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Separator } from '@/components/ui/separator';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Statement = {
  no: number;
  statement: string;
  answer: 'benar' | 'salah';
  points: number;
  evidencePoints: number;
};

type LatihanStatement = {
    statement: string;
    answer: 'benar' | 'salah';
    points: number;
    analysisPoints: number;
}

type MenyimakContentData = {
  learningObjective: string;
  youtubeUrl: string;
  statements: Statement[];
  activity2Questions: string[];
  comparisonVideoUrl: string;
  latihan: {
      youtubeUrl: string;
      statements: LatihanStatement[];
  }
};

// --- Component for Menyimak Content ---
function MenyimakContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const activity = searchParams.get('kegiatan');
  const chapterId = params.id as string;
  const [content, setContent] = useState<MenyimakContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const [answers, setAnswers] = useState<
    Record<string, { choice: 'benar' | 'salah' | ''; evidence: string }>
  >({});
  const [activity2Answers, setActivity2Answers] = useState<Record<string, string>>({});
  const [latihanAnswers, setLatihanAnswers] = useState<
    Record<string, { choice: 'benar' | 'salah' | ''; analysis: string }>
  >({});

  useEffect(() => {
    async function fetchContent() {
      if (!chapterId) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'chapters', chapterId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().menyimak) {
          const fetchedContent = docSnap.data().menyimak as MenyimakContentData;
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
  
  const handleLatihanAnswerChange = (no: string, type: 'choice' | 'analysis', value: string) => {
    setLatihanAnswers(prev => ({
        ...prev,
        [no]: { ...prev[no], [type]: value }
    }));
  };

  const handleActivity2AnswerChange = (question: string, value: string) => {
    setActivity2Answers((prev) => ({
      ...prev,
      [question]: value,
    }));
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('embed')) return url;
    try {
      const videoUrl = new URL(url);
      let videoId = videoUrl.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      // Handle youtu.be shortlinks
      if (videoUrl.hostname === 'youtu.be') {
          const shortId = videoUrl.pathname.slice(1);
          if (shortId) {
              return `https://www.youtube.com/embed/${shortId.split('?')[0]}`;
          }
      }

      const pathSegments = videoUrl.pathname.split('/');
      const shortId = pathSegments[pathSegments.length - 1];
      if (shortId && !shortId.includes('.be')) {
         return `https://www.youtube.com/embed/${shortId.split('?')[0]}`;
      }
    } catch (error) {
      console.error('Invalid YouTube URL', error);
      return url;
    }
    return url;
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "Anda harus masuk untuk mengirimkan jawaban." });
        return;
    }

    setIsSubmitting(true);
    try {
        let submissionData = {};
        if (activity === '1') {
            submissionData = { answers };
        } else if (activity === '2') {
            submissionData = { activity2Answers };
        } else if (activity === '3') {
            submissionData = { latihanAnswers };
        }

        const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_menyimak`);
        
        await setDoc(submissionRef, {
            studentId: user.uid,
            chapterId: chapterId,
            activity: 'menyimak',
            [`kegiatan${activity}`]: submissionData,
            lastSubmitted: serverTimestamp()
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

  const renderContent = () => {
    if (loading) {
      return (
        <Card>
          <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
          <CardContent className="space-y-4"><Skeleton className="h-6 w-full" /><Skeleton className="aspect-video w-full" /><Skeleton className="h-48 w-full" /></CardContent>
        </Card>
      );
    }

    if (!content) {
      return (
        <Card><CardHeader><CardTitle>Konten Tidak Tersedia</CardTitle></CardHeader><CardContent><p>Materi untuk bagian ini belum disiapkan oleh guru.</p></CardContent></Card>
      );
    }
    
    if (activity === '1') {
       return (
        <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Kegiatan 1: Menganalisis Teks Deskripsi</CardTitle><CardDescription>Simak video di bawah ini dengan saksama, lalu kerjakan tugas yang diberikan.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {content.youtubeUrl ? (<div className="aspect-video w-full rounded-lg overflow-hidden border"><iframe className="w-full h-full" src={getYoutubeEmbedUrl(content.youtubeUrl)} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div>) : (<p className="text-muted-foreground">Video belum ditambahkan oleh guru.</p>)}
                {content.youtubeUrl && (<Button asChild variant="outline"><Link href={content.youtubeUrl} target="_blank"><Youtube className="mr-2 h-4 w-4" /> Buka di YouTube</Link></Button>)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Tugas: Penilaian Pernyataan</CardTitle><CardDescription>Tentukan apakah pernyataan berikut benar atau salah, dan berikan bukti informasi dari video yang telah Anda simak.</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                  {content.statements.map((stmt) => (
                    <div key={stmt.no} className="border p-4 rounded-lg bg-slate-50/50">
                      <p className="font-semibold">Pernyataan #{stmt.no}</p>
                      <p className="mt-1 text-sm">{stmt.statement}</p>
                      <div className="mt-4 space-y-4">
                        <div>
                          <Label className="font-medium">Tentukan jawaban Anda:</Label>
                          <RadioGroup className="flex gap-4 mt-2" onValueChange={(value) => handleAnswerChange(stmt.no, 'choice', value)} value={answers[stmt.no.toString()]?.choice}>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="benar" id={`r-${stmt.no}-benar`} /><Label htmlFor={`r-${stmt.no}-benar`}>Benar</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="salah" id={`r-${stmt.no}-salah`} /><Label htmlFor={`r-${stmt.no}-salah`}>Salah</Label></div>
                          </RadioGroup>
                        </div>
                        <div>
                          <Label htmlFor={`evidence-${stmt.no}`} className="font-medium">Tuliskan bukti informasinya:</Label>
                          <Textarea id={`evidence-${stmt.no}`} className="mt-2 bg-white" placeholder="Tuliskan bukti pendukung dari video di sini..." rows={4} onChange={(e) => handleAnswerChange(stmt.no, 'evidence', e.target.value)} value={answers[stmt.no.toString()]?.evidence} />
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Umpan Balik & Teks Transkrip</CardTitle><CardDescription>Setelah kalian menyatakan benar atau salah pernyataan tersebut yang disertai alasan atau bukti informasi, bandingkanlah jawaban kalian dengan penjelasan berikut. Teks deskripsi yang dilisankan dari laman YouTube tersebut dapat dituliskan sebagai berikut.</CardDescription></CardHeader>
              <CardContent className="prose prose-sm max-w-none bg-slate-50/50 p-4 rounded-md">
                  <h4 className="font-bold">Candi Borobudur</h4>
                  <p>Candi Borobudur adalah candi Budha yang paling besar dan mewah yang ada di Indonesia. Bentuk daripada candi ini nampak seperti piramida atau limas segi empat. Candi ini mempunyai banyak relief dan juga stupa. Karena kemegahan dan ukuran candi, membuat pesona candi bak gunung yang menjulang tinggi. Bahkan, dari arah kejauhan telah nampak dengan jelas akan pesona dari candi ini.</p>
                  <p>Candi Borobudur terdiri dari tiga tingkatan. Tingkat pertama paling bawah disebut dengan Kamadatu. Pada bagian akhir tingkatan ini, terdapat relief yang berjumlah 160 buah. Relief tersebut mengandung kisah tentang Kamawibangga, berbagai macam kisah tentang dosa.</p>
                  <p>Tingkat kedua disebut Rupadatu, berupa empat buah teras. Teras itu seolah membentuk lorong yang berputar. Pada tingkat Rupadatu, terdapat 1300 relief. Pada tingkat kedua ini pula terdapat patung Budha berukuran kecil. Jumlah keseluruhan patung Budha sebanyak 432 patung. Patung itu terletak pada suatu relung terbuka yang ada di sepanjang pagar langkan. Pagar langkan adalah suatu bentuk peralihan dari Rupadatu ke Arupadatu.</p>
                  <p>Tingkat paling atas dinamakan Arupadatu. Khusus untuk tingkat ini, sama sekali tidak ada hiasan relief pada dindingnya. Bentuk dari lantai Arupadatu berupa lingkaran. Di sini, ada 72 stupa kecil. Semua stupa kecil tersebut tersusun atas tiga buah barisan yang seolah mengelilingi stupa induk. Bentuk dari stupa kecil menyerupai lonceng. Di dalam stupa, terdapat patung Budha. Di bagian tengah Arupadatu, terdapat stupa induk. Stupa ini memiliki patung-patung Budha dan mempunyai ukuran paling besar daripada stupa lainnya.</p>
              </CardContent>
            </Card>
        </div>
       )
    }

    if (activity === '2') {
        return (
            <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Kegiatan 2: Mengevaluasi Gagasan</CardTitle>
                  <CardDescription>
                    Simaklah kembali teks deskripsi “Candi Borobudur” melalui tautan video pada Kegiatan 1. Untuk memudahkan kalian dalam menyimak teks tersebut secara berulang-ulang, unduh dan simpanlah video tersebut dalam gawai kalian. Setelah kalian menyimak kembali teks tersebut, jawablah pertanyaan berikut!
                  </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="space-y-4">
                          {(content.activity2Questions || []).map((q, i) => (
                              <div key={i}><Label htmlFor={`activity2-q${i}`} className="font-semibold">{i + 1}. {q}</Label><Textarea id={`activity2-q${i}`} className="mt-2" placeholder="Tuliskan jawaban Anda di sini..." onChange={e => handleActivity2AnswerChange(q, e.target.value)} value={activity2Answers[q] || ''} /></div>
                          ))}
                      </div>
                      <Separator />
                      <div>
                          <p className="text-sm text-foreground">Selanjutnya, simaklah tayangan dalam laman YouTube Property Inside dengan kata kunci pencarian bagaimana cara Gunadharma membangun Candi Borobudur atau bisa dipindai pada kode QR di samping. Lalu, bandingkan dengan teks deskripsi yang pertama kalian simak pada Kegiatan 1. Mana di antara kedua teks tersebut yang lebih baik deskripsinya?</p>
                          <div className="mt-4 space-y-4">
                              {content.comparisonVideoUrl && <div className="aspect-video w-full rounded-lg overflow-hidden border"><iframe className="w-full h-full" src={getYoutubeEmbedUrl(content.comparisonVideoUrl)} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe></div>}
                              <Label htmlFor="comparison" className="font-semibold">Jawaban Perbandingan Anda:</Label>
                              <Textarea id="comparison" placeholder="Tuliskan hasil perbandingan Anda di sini..." rows={5} onChange={e => handleActivity2AnswerChange('comparison', e.target.value)} value={activity2Answers['comparison'] || ''} />
                          </div>
                      </div>
                      <Separator/>
                      <div className="prose prose-sm max-w-none text-foreground">
                        <p>Suatu teks deskripsi dibuat atau ditulis agar orang lain yang menyimak atau membaca teks itu dapat mengindra objek yang digambarkannya. Pemilihan objek itu karena penulis memiliki kepentingan tertentu. Misalnya, orang menggambarkan objek wisata dengan tujuan agar yang membaca atau menyimak merasa tertarik sehingga mau berkunjung ke tempat itu. Oleh karena itu, orang tersebut akan menggambarkannya semenarik mungkin.</p>
                        <p>Perhatikan dialog berikut, apakah orang yang menggambarkan Candi Borobudur ini sudah berusaha menggambarkannya sebaik dan semenarik mungkin?</p>
                        <blockquote className="border-l-4 pl-4 italic">
                            <p><strong>Amir:</strong> Waktu liburan tahun ajaran baru kemarin, kelas kami berwisata ke Candi Borobudur.</p>
                            <p><strong>Usman:</strong> Wah, enak benar. Saya belum pernah ke sana. Seperti apa Candi Borobudur itu?</p>
                            <p><strong>Amir:</strong> Ya, pokoknya Borobudur itu suatu candi.</p>
                            <p><strong>Usman:</strong> Gambarannya seperti apa?</p>
                            <p><strong>Amir:</strong> Ya, candi itu besar, tinggi. Banyak orang berkunjung ke sana. Ada yang foto-foto, berundak-undak, ada patungnya, dan ada reliefnya. Untuk mencapai ke atas, perlu tenaga. Lelah soalnya. Coba kamu berkunjung ke sana. Pokoknya, sulit digambarkan dengan kata-kata. Langsung saja lihat ke sana.</p>
                            <p><strong>Usman:</strong> Oh, begitu.</p>
                        </blockquote>
                        <p>Apa yang kalian perhatikan dari dialog tersebut? Si Amir diminta menggambarkan objek Candi Borobudur. Namun, dia tidak begitu terampil menggambarkannya. Gagasan dan pandangan Amir terhadap objek wisata Candi Borobudur tidak begitu lengkap. Berbeda dengan yang kalian simak tentang Candi Borobudur di atas, lengkap dan sistematis. Selanjutnya, coba kalian perbaiki teks tersebut agar sesuai dengan kriteria teks deskripsi.</p>
                      </div>
                       <div>
                          <Label htmlFor="dialogue-fix" className="font-semibold">Perbaikan Dialog oleh Kelompok Anda:</Label>
                          <Textarea id="dialogue-fix" placeholder="Tuliskan perbaikan dialog di sini..." rows={8} onChange={e => handleActivity2AnswerChange('dialogue-fix', e.target.value)} value={activity2Answers['dialogue-fix'] || ''} />
                      </div>
                  </CardContent>
                </Card>
            </div>
        )
    }

     if (activity === '3') {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Latihan</CardTitle>
                <CardDescription>
                    Simaklah tayangan deskripsi pada laman YouTube Info Sumut dengan kata kunci pencarian pesona Danau Toba. Setelah kalian menyimak tayangan tersebut, centanglah pernyataan benar atau salah dalam Tabel 1.2. Lalu, berikan analisis terhadap gagasan dan pandangan yang disampaikan narator dalam tayangan tersebut.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {content.latihan.youtubeUrl ? (
                    <div className="aspect-video w-full rounded-lg overflow-hidden border">
                        <iframe className="w-full h-full" src={getYoutubeEmbedUrl(content.latihan.youtubeUrl)} title="Pesona Danau Toba" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                    </div>
                ): (
                    <p className="text-muted-foreground">Video latihan belum ditambahkan oleh guru.</p>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>Tabel 1.2 Pernyataan Penilaian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">No.</TableHead>
                                    <TableHead>Pernyataan</TableHead>
                                    <TableHead className="w-[150px] text-center">Benar / Salah</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {content.latihan.statements.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <p>{item.statement}</p>
                                            <Label className="mt-4 block font-medium">Jika tidak, seharusnya....</Label>
                                            <Textarea
                                                className="mt-2"
                                                placeholder="Tuliskan analisis Anda..."
                                                onChange={e => handleLatihanAnswerChange(String(index + 1), 'analysis', e.target.value)}
                                                value={latihanAnswers[String(index + 1)]?.analysis || ''}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <RadioGroup
                                                className="flex flex-col space-y-2 items-center justify-center"
                                                onValueChange={(value) => handleLatihanAnswerChange(String(index + 1), 'choice', value)}
                                                value={latihanAnswers[String(index + 1)]?.choice || ''}
                                            >
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="benar" id={`l-${index}-benar`} /><Label htmlFor={`l-${index}-benar`}>Benar</Label></div>
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="salah" id={`l-${index}-salah`} /><Label htmlFor={`l-${index}-salah`}>Salah</Label></div>
                                            </RadioGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
      );
    }

    return null; // Should not happen if activity param is present
  };

  const getPageTitle = () => {
    switch (activity) {
        case '1': return 'A. Menyimak - Kegiatan 1';
        case '2': return 'A. Menyimak - Kegiatan 2';
        case '3': return 'A. Menyimak - Latihan';
        default: return 'A. Menyimak';
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <header className="bg-card border-b p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <Button asChild variant="outline" size="sm" className="mb-4">
              <Link href={`/student/materi/${chapterId}/${params.slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Pilihan Kegiatan
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground capitalize">{getPageTitle()}</h1>
            <p className="text-muted-foreground mt-1">
              Bab {chapterId}: Membicarakan Teks Deskripsi
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <Card className="mb-6">
                  <CardHeader><CardTitle>Tujuan Pembelajaran</CardTitle><CardDescription>{loading ? <Skeleton className="h-4 w-full" /> : content?.learningObjective}</CardDescription></CardHeader>
              </Card>
              {renderContent()}
              {!loading && content && (
                <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {isSubmitting ? 'Mengirim...' : `Simpan & Kirim Jawaban ${activity === '3' ? 'Latihan' : 'Kegiatan' } Ini`}
                </Button>
              )}
          </form>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}


// --- Main Router Component ---
export default function ChapterSlugPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const slug = params.slug as string;
    const chapterId = params.id as string;
    const kegiatan = searchParams.get('kegiatan');

    // This logic determines what to render based on the 'kegiatan' search param.
    // If a 'kegiatan' param exists, we render the full content page.
    if (kegiatan) {
        return <MenyimakContent />;
    }
    
    // This is the "Hub Page" for the specific slug (e.g., 'menyimak')
    // It shows the different activities available.
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
        membaca: [ // Placeholder for 'membaca' activities
            {
                title: "Membaca Teks",
                kegiatan: "1",
                icon: FileText,
                description: "Baca dan pahami teks deskripsi.",
                disabled: true
            }
        ]
        // Add other slugs like 'menulis', 'mempresentasikan' here
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
