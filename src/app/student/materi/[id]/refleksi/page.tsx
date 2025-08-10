
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';


export default function RefleksiSiswaPage() {
    const params = useParams();
    const chapterId = params.id as string;
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [user] = useAuthState(auth);

    const reflectionQuestions = [
        "Setelah mempelajari menyimak, membaca, menulis, dan mempresentasikan teks deskripsi, kesimpulan apa yang dapat kalian ambil?",
        "Pengetahuan apa saja yang kalian peroleh?",
        "Keterampilan berbahasa apa saja yang kalian kuasai?",
        "Bagaimana sikap kalian setelah selesai mengikuti pembelajaran teks deskripsi?",
        "Apakah kalian merasa senang karena wawasan kalian bertambah?",
        "Apakah kalian tertarik menerapkan pengetahuan yang telah diperoleh?",
        "Apakah kalian tertarik mengembangkan keterampilan kalian dalam memproduksi teks deskripsi sesuai kebutuhan berbahasa? Bagaimana caranya?",
    ];

    const handleAnswerChange = (index: number, value: string) => {
        setAnswers(prev => ({...prev, [index]: value}));
    }
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Anda harus masuk untuk mengirimkan jawaban.' });
            return;
        }

        const answeredQuestions = Object.values(answers).filter(Boolean).length;
        if (answeredQuestions === 0) {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Harap isi setidaknya satu pertanyaan refleksi.' });
            return;
        }
        
        setIsSubmitting(true);
        try {
             const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_refleksi`);
             await setDoc(submissionRef, {
                studentId: user.uid,
                chapterId: chapterId,
                activity: 'refleksi',
                answers: answers,
                lastSubmitted: serverTimestamp()
            }, { merge: true });

            toast({
                title: "Refleksi Disimpan",
                description: "Jawaban refleksi Anda telah berhasil disimpan.",
            });
        } catch (error) {
             console.error("Error submitting reflection:", error);
            toast({
                variant: 'destructive',
                title: "Gagal Menyimpan",
                description: "Terjadi kesalahan saat menyimpan refleksi Anda.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

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
                        <h1 className="text-2xl font-bold text-foreground capitalize">Refleksi Bab</h1>
                        <p className="text-muted-foreground mt-1">Bab {chapterId}: Membicarakan Teks Deskripsi</p>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8">
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Mari Berefleksi</CardTitle>
                                <CardDescription className="text-justify">Jawablah pertanyaan-pertanyaan berikut berdasarkan pengalaman belajar Anda di bab ini.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {reflectionQuestions.map((q, i) => (
                                    <div key={i} className="space-y-2">
                                        <Label htmlFor={`refleksi-${i}`}>{i + 1}. {q}</Label>
                                        <Textarea 
                                            id={`refleksi-${i}`} 
                                            placeholder="Tuliskan jawaban Anda..." 
                                            rows={3} 
                                            value={answers[i] || ''}
                                            onChange={(e) => handleAnswerChange(i, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isSubmitting ? "Menyimpan..." : "Simpan Refleksi"}
                        </Button>
                    </form>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
