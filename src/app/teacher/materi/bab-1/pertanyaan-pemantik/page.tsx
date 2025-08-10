'use client';

import { useEffect, useState } from 'react';
import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

type SparkingQuestionContent = {
  questions: string[];
};

export default function PertanyaanPemantikPage() {
  const [content, setContent] = useState<SparkingQuestionContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const docRef = doc(db, 'chapters', '1');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().sparkingQuestions) {
          setContent({ questions: docSnap.data().sparkingQuestions });
        } else {
          // If the field doesn't exist, create it with default content
          const defaultQuestions = [
            "Bagaimana cara kalian menggambarkan suatu objek agar orang yang menyimak atau membaca merasa melihat, mendengar, mengalami, atau merasakan?",
            "Bagaimana cara mengukur ketepatan teks deskprisi?",
            "Untuk apa teks deskripsi dibuat?"
          ];
          setContent({ questions: defaultQuestions });
          await setDoc(docRef, { sparkingQuestions: defaultQuestions }, { merge: true });
        }
      } catch (error) {
        console.error("Failed to fetch or create content:", error);
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
          title="Pertanyaan Pemantik"
          description="Tulis pertanyaan yang memancing pemikiran kritis siswa sebelum memulai bab."
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
               <Button asChild variant="outline" size="sm">
                  <Link href="/teacher/materi/bab-1/pertanyaan-pemantik/edit">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Daftar Pertanyaan</CardTitle>
                <CardDescription>Pertanyaan ini akan ditampilkan kepada siswa di awal bab.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                ) : (
                  <ol className="list-decimal list-inside space-y-2">
                    {content?.questions.map((q, index) => <li key={index}>{q}</li>)}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
