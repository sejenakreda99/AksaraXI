
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function TujuanMenyimakPage() {
    const params = useParams();
    const chapterId = params.id as string;
    const router = useRouter();

    const learningObjective = "Pada bagian menyimak ini, Anda akan belajar mengevaluasi gagasan dan pandangan berdasarkan kaidah logika berpikir dari menyimak teks deskripsi yang disajikan dalam bentuk audio-visual.";

    const handleNext = () => {
        router.push(`/student/materi/${chapterId}/menyimak/kegiatan-1`);
    }

    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-full">
                <header className="bg-card border-b p-4 sm:p-6">
                    <div className="max-w-4xl mx-auto">
                        <Button asChild variant="outline" size="sm" className="mb-4">
                            <Link href={`/student/materi/${chapterId}/menyimak`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Peta Menyimak
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold text-foreground capitalize">Tujuan Pembelajaran</h1>
                        <p className="text-muted-foreground mt-1">Bab {chapterId}: A. Menyimak Teks Deskripsi</p>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <Card className="bg-primary/5 border-primary">
                            <CardHeader>
                                <CardTitle className="text-primary">Selamat Datang di Petualangan Menyimak!</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-base text-justify">{learningObjective}</p>
                                <p className="mt-4 text-justify">Mari kita mulai dengan kegiatan pertama untuk mengasah kemampuan analisis Anda!</p>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button onClick={handleNext} size="lg">
                                Lanjut ke Kegiatan 1
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
