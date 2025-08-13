
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Target } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';

export default function TujuanMenyimakPage() {
    const params = useParams();
    const router = useRouter();
    const chapterId = params.id as string;
    const [objective, setObjective] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!chapterId) return;

        async function fetchContent() {
            setLoading(true);
            try {
                const contentRef = doc(db, 'chapters', chapterId);
                const contentSnap = await getDoc(contentRef);
                if (contentSnap.exists() && contentSnap.data().menyimak) {
                    setObjective(contentSnap.data().menyimak.learningObjective);
                }
            } catch (error) {
                console.error('Failed to fetch content:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchContent();
    }, [chapterId]);

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
                        <h1 className="text-2xl font-bold text-foreground capitalize flex items-center gap-3">
                            <Target className="w-8 h-8 text-primary" />
                            Tujuan Pembelajaran
                        </h1>
                        <p className="text-muted-foreground mt-1">Pahami target belajar Anda sebelum memulai.</p>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Apa yang Akan Anda Pelajari?</CardTitle>
                            </CardHeader>
                            <CardContent className="prose max-w-none text-justify">
                                {loading ? (
                                    <Skeleton className="h-20 w-full" />
                                ) : objective ? (
                                    <p>{objective}</p>
                                ) : (
                                    <p>Tujuan pembelajaran untuk bagian ini belum ditetapkan.</p>
                                )}
                            </CardContent>
                        </Card>

                        <div className="mt-8 flex justify-end">
                            <Button size="lg" onClick={() => router.push(`/student/materi/${chapterId}/menyimak/kegiatan-1`)}>
                                Lanjut ke Kegiatan 1
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
