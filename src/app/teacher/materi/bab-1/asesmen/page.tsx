
'use client';

import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { Separator } from "@/components/ui/separator";

function getYoutubeEmbedUrl(url: string) {
    if (!url) return '';
    if (url.includes('embed')) return url;
    try {
        const videoUrl = new URL(url);
        let videoId = videoUrl.searchParams.get('v');
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (videoUrl.hostname === 'youtu.be') {
            const shortId = videoUrl.pathname.slice(1);
            if (shortId) {
                return `https://www.youtube.com/embed/${shortId.split('?')[0]}`;
            }
        }
    } catch (error) {
        console.error('Invalid YouTube URL', error);
        return url;
    }
    return url;
}

export default function AsesmenPage() {
  const assessmentQuestions1 = [
    "Apa sebenarnya gagasan dan pandangan yang ingin disampaikan penulis dalam teks tersebut?",
    "Apakah gagasan dan pandangan yang disampaikan penulis itu tertata dengan sistematetis dan logis?",
    "Sudah cukup kuatkah penulis menyampaikan argumennya dalam upaya menjaga lingkungan hidup?",
    "Apakah fakta atau realita yang dikemukakannya dapat mendukung gagasan dan pandangan yang ingin disampaikan?",
    "Apakah bahasa yang digunakan sudah tepat untuk menyampaikan gagasan dan pandangan penulis dalam teks tersebut?",
    "Tulislah kembali teks tersebut menjadi teks deksripsi."
  ];

  const assessmentQuestions2 = [
      "Apa gagasan dalam teks 2?",
      "Apa pandangan dalam teks 2?",
      "Bandingkan gagasan teks deskripsi 1 dan 2, mana teks yang menyampaiakan gagasan dengan lengkap menggunakan data dan mana yang kurang lengkap? Berikan buktinya.",
      "Bandingkan pandangan dari kedua teks tersebut, mana yang lebih menarik menurut kalian? Berikan alasan."
  ]

  const youtubeLinks = [
      "https://youtu.be/u1yo-uJDsU4",
      "https://youtu.be/waYM6QorBxw"
  ]

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="E. Asesmen"
          description="Kelola soal dan penilaian untuk asesmen Bab 1."
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <Button asChild variant="outline">
                <Link href="/teacher/materi/bab-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Struktur Bab
                </Link>
              </Button>
               <Button asChild variant="outline" size="sm" disabled>
                  <Link href="#">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Asesmen
                  </Link>
              </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Pratinjau Asesmen Bab 1</CardTitle>
                    <CardDescription>
                        Berikut adalah soal-soal yang akan dikerjakan oleh siswa.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Bagian I */}
                    <Card className="p-6">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle>Bagian I: Analisis Teks "Keindahan Alam Indonesia"</CardTitle>
                            <CardDescription>Siswa akan membaca teks berikut dan menjawab 6 soal esai.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <div className="prose prose-sm max-w-none bg-slate-50 border rounded-lg p-4 mb-6">
                                <h3 className="text-center">Keindahan Alam Indonesia</h3>
                                <p>Indonesia adalah negara dengan kekayaan alam yang melimpah ruah dari Sabang hingga Merauke. Keindahan alam Indonesia memang dinilai tak ada yang mampu menandingi di negara mana pun di dunia.</p>
                                <p>Hampir semua pesona alam terdapat di Indonesia mulai dari daratan hingga laut. Oleh sebab itu, tidak heran apabila banyak wisatawan asing yang rela datang jauh-jauh ke Indonesia untuk menikmati keindahan alam bumi pertiwi.</p>
                                <p>Selain keindahan alam yang disajikan ternyata di dalam keindahan tersebut terdapat banyak hal tersembunyi yang jarang diketahui seperti flora dan fauna yang sangat langka dan eksotis.</p>
                                <p>Alam Indonesia yang paling tersohor di mata dunia adalah keindahan pantainya yang terbentang dari barat hingga ke timur. Banyaknya pulau yang ada di Indonesia membuat kekayaan laut dan pantai semakin berwarna.</p>
                                <p>Selain pantai, keindahan dunia bawah laut juga menjadi incaran para wisatawan untuk masuk ke dalamnya dan ikut menikmati kehidupan bawah laut di Indonesia. Daerah yang memiliki keindahan pantai yang menakjubkan di Indonesia yang paling tersohor adalah Manado, Bali, dan Raja Ampat.</p>
                                <p>Tidak hanya keindahan pantai, Indonesia juga merupakan negara dengan cangkupan hutan terbesar di Dunia. Oleh karena itu, Indonesia disebut sebagai paru-paru dunia sebab ⅓ hutan di dunia terdapat di Indonesia.</p>
                                <p>Keindahan hutan di Indonesia memang tak perlu diragukan lagi, sebab memang hijau hamparan pohon membuat mata seakan terhipnotis. Selain itu, hewan dan tumbuhan endemik juga banyak yang menjadi buruan wisatawan yang hanya untuk berfoto untuk mengabadikan momen tersebut.</p>
                                <p className="text-xs italic">Sumber: https://notepam.com/contoh-teks-deskripsi/</p>
                            </div>
                            
                            <h4 className="font-semibold mb-2">Soal:</h4>
                            <ol className="list-decimal list-inside space-y-2 text-sm">
                                {assessmentQuestions1.map((q, i) => <li key={i}>{q}</li>)}
                            </ol>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Bagian II */}
                    <Card className="p-6">
                         <CardHeader className="px-0 pt-0">
                            <CardTitle>Bagian II: Perbandingan Video Deskripsi</CardTitle>
                            <CardDescription>Siswa akan menyimak dua video berikut dan menjawab 4 soal perbandingan.</CardDescription>
                        </CardHeader>
                         <CardContent className="px-0 pb-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {youtubeLinks.map((link, i) => (
                                    <div key={i} className="aspect-video w-full rounded-lg overflow-hidden border">
                                        <iframe className="w-full h-full" src={getYoutubeEmbedUrl(link)} title={`YouTube video ${i+1}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                    </div>
                                ))}
                            </div>
                             <h4 className="font-semibold mb-2">Soal:</h4>
                             <ol className="list-decimal list-inside space-y-2 text-sm" start={7}>
                                {assessmentQuestions2.map((q, i) => <li key={i}>{q}</li>)}
                            </ol>
                         </CardContent>
                    </Card>

                </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
