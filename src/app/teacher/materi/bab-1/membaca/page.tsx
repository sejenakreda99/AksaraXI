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

type ReadingContent = {
  learningObjective: string;
  text: string;
  questions: string[];
};

const defaultContent: ReadingContent = {
    learningObjective: "Menganalisis dan mengevaluasi gagasan dan pandangan dalam teks deskripsi yang dibaca.",
    text: `(Teks deskripsi tentang keindahan alam, misalnya Raja Ampat, akan ditampilkan di sini. Guru dapat mengedit teks ini).`,
    questions: [
        "Apa gagasan utama yang ingin disampaikan penulis melalui teks deskripsi tersebut?",
        "Informasi detail apa saja yang kalian dapatkan dari teks tersebut?",
        "Bagaimana pandangan penulis terhadap objek yang dideskripsikan? Apakah penulis tampak mengagumi atau hanya melaporkan saja? Berikan buktinya!"
    ]
};

export default function MembacaPage() {
    const [content, setContent] = useState<ReadingContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchContent() {
            try {
                const docRef = doc(db, 'chapters', '1');
                const docSnap = await getDoc(docRef);
                const data = docSnap.data();

                if (docSnap.exists() && data && data.membaca) {
                    setContent(data.membaca);
                } else {
                    setContent(defaultContent);
                    await setDoc(docRef, { membaca: defaultContent }, { merge: true });
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
                    title="B. Membaca Teks Deskripsi"
                    description="Kelola materi teks dan pertanyaan pemahaman untuk kegiatan membaca."
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
                                <Link href="/teacher/materi/bab-1/membaca/edit">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Konten
                                </Link>
                            </Button>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Pratinjau Materi Membaca</CardTitle>
                                {loading ? <Skeleton className="h-4 w-3/4 mt-1" /> : (
                                    <CardDescription>
                                        <span className="font-bold">Tujuan Pembelajaran:</span> {content?.learningObjective}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-6">
                                        <Skeleton className="h-40 w-full" />
                                        <Skeleton className="h-24 w-full" />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader><CardTitle>Teks Deskripsi</CardTitle></CardHeader>
                                            <CardContent className="prose max-w-none whitespace-pre-wrap">{content?.text}</CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader><CardTitle>Pertanyaan Pemahaman</CardTitle></CardHeader>
                                            <CardContent>
                                                <ol className="list-decimal list-inside space-y-2">
                                                    {content?.questions.map((q, index) => <li key={index}>{q}</li>)}
                                                </ol>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
