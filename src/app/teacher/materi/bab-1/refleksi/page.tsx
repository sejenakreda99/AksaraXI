
'use client';

import { useEffect, useState } from 'react';
import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';

const defaultQuestions = [
    "Setelah mempelajari menyimak, membaca, menulis, dan mempresentasikan teks deskripsi, kesimpulan apa yang dapat kalian ambil?",
    "Pengetahuan apa saja yang kalian peroleh?",
    "Keterampilan berbahasa apa saja yang kalian kuasai?",
    "Bagaimana sikap kalian setelah selesai mengikuti pembelajaran teks deskripsi?",
    "Apakah kalian merasa senang karena wawasan kalian bertambah?",
    "Apakah kalian tertarik menerapkan pengetahuan yang telah diperoleh?",
    "Apakah kalian tertarik mengembangkan keterampilan kalian dalam memproduksi teks deskripsi sesuai kebutuhan berbahasa? Bagaimana caranya?",
];

export default function RefleksiPage() {
  const [reflectionQuestions, setReflectionQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      setLoading(true);
      try {
        const docRef = doc(db, 'chapters', '1');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().refleksi?.reflectionQuestions) {
          setReflectionQuestions(docSnap.data().refleksi.reflectionQuestions);
        } else {
          // If the field doesn't exist, create it with default content
          setReflectionQuestions(defaultQuestions);
          await setDoc(docRef, { refleksi: { reflectionQuestions: defaultQuestions } }, { merge: true });
        }
      } catch (error) {
        console.error("Failed to fetch or create content:", error);
        setReflectionQuestions(defaultQuestions);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="Refleksi"
          description="Buat pertanyaan atau kegiatan refleksi untuk akhir bab."
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
                    Edit Refleksi
                  </Link>
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Pratinjau Pertanyaan Refleksi</CardTitle>
                <CardDescription className="text-justify">Pertanyaan ini akan ditampilkan kepada siswa di akhir bab.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                ) : (
                <ol className="list-decimal list-inside space-y-2 text-justify">
                  {reflectionQuestions.map((q, index) => <li key={index}>{q}</li>)}
                </ol>
                )}
                 <div className="bg-slate-100 p-4 rounded-lg mt-6">
                    <h4 className="font-bold">Area Tugas Siswa</h4>
                    <p className="text-muted-foreground italic text-left">(Di halaman siswa, akan tersedia area teks untuk menjawab pertanyaan-pertanyaan refleksi ini).</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
