
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/client';
import { useAuthState } from 'react-firebase-hooks/auth';


export default function JurnalMembacaSiswaPage() {
    const params = useParams();
    const chapterId = params.id as string;
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [journalText, setJournalText] = useState('');
    const [user] = useAuthState(auth);
    const [loading, setLoading] = useState(true);
    const [existingSubmission, setExistingSubmission] = useState<any>(null);
    
     useEffect(() => {
        if (!user || !chapterId) return;

        async function fetchJournal() {
            setLoading(true);
            const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_jurnal-membaca`);
            try {
                const docSnap = await getDoc(submissionRef);
                if (docSnap.exists()) {
                    const submissionData = docSnap.data();
                    setExistingSubmission(submissionData);
                    setJournalText(submissionData.answers?.journal || '');
                }
            } catch (error) {
                console.error("Error fetching journal:", error);
                toast({
                    variant: 'destructive',
                    title: "Gagal memuat data",
                    description: "Tidak dapat mengambil data jurnal sebelumnya.",
                });
            } finally {
                setLoading(false);
            }
        }
        fetchJournal();
    }, [user, chapterId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Anda harus masuk untuk mengirimkan jawaban.' });
            return;
        }
        if (journalText.trim() === '') {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Harap isi jurnal Anda sebelum menyimpan.' });
            return;
        }

        setIsSubmitting(true);
        
        try {
            const submissionRef = doc(db, 'submissions', `${user.uid}_${chapterId}_jurnal-membaca`);
            
            const dataToSave = {
                studentId: user.uid,
                chapterId: chapterId,
                activity: 'jurnal-membaca',
                answers: {
                    journal: journalText
                },
                lastSubmitted: serverTimestamp(),
                 // Pertahankan skor yang ada jika sudah dinilai
                ...(existingSubmission?.scores && { scores: existingSubmission.scores })
            };

            await setDoc(submissionRef, dataToSave, { merge: true });

            toast({
                title: "Jurnal Membaca Disimpan",
                description: "Jurnal Anda telah berhasil disimpan dan akan dinilai oleh guru.",
            });

        } catch (error) {
            console.error("Error submitting journal:", error);
            toast({
                variant: 'destructive',
                title: "Gagal Menyimpan",
                description: "Terjadi kesalahan saat menyimpan jurnal Anda.",
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
                        <h1 className="text-2xl font-bold text-foreground capitalize">Jurnal Membaca</h1>
                        <p className="text-muted-foreground mt-1">Bab {chapterId}: Membicarakan Teks Deskripsi</p>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8">
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>Instruksi Kegiatan Literasi</CardTitle>
                            </CardHeader>
                            <CardContent className="prose prose-sm max-w-none text-justify">
                                <p>Kali ini kalian akan melakukan kegiatan literasi membaca yang berhubungan dengan teks deskripsi. Kalian akan lebih memahami bahwa tidak hanya sekadar deskripsi faktual yang menggambarkan sesuatu berupa fakta yang dapat diindra secara langsung, tetapi juga dapat kita jumpai dalam karya prosa fiksi, seperti novel dan cerita pendek. Bahkan, boleh dikatakan bahwa teks deskripsi tidak bisa dilepaskan dari cerita fiksi karena penulis perlu untuk menggambarkan tokoh, menggambarkan latar, dan lain-lain untuk mendukung keberhasilan penyampaian gagasannya dalam karya tersebut.</p>
                                <p>Beberapa novel di bawah ini sangat tajam dalam mendeskripsikan latarnya.</p>
                                <ol>
                                    <li><strong>Ronggeng Dukuh Paruk</strong> karya Ahmad Tohari</li>
                                    <li><strong>Harimau! Harimau!</strong> karya Mochtar Lubis</li>
                                    <li><strong>Upacara</strong> karya Korrie Layun Rampan</li>
                                </ol>
                                 <p>Novel <i>Ronggeng Dukuh Paruk</i> banyak mendeskrispikan situasi pedesaan di Jawa Tengah pada masa 1965. <i>Harimau! Harimau!</i> mendeskripsikan situasi hutan Sumatera. Sedangkan <i>Upacara</i> banyak mendeskipsikan adat budaya Suku Dayak di Kalimantan.</p>
                                <p>Coba kalian apresiasi teks deskripsi dalam salah satu novel tersebut. Untuk melakukan kegiatan apresiasi, kalian bisa menunjukkan kelebihan dan kekurangan novel itu, khususnya dari segi pendeskripsian.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Hasil Apresiasi Anda</CardTitle>
                                <CardDescription>Tuliskan analisis kelebihan dan kekurangan dari novel yang Anda pilih di bawah ini.</CardDescription>
                            </CardHeader>
                             <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="apresiasi-jurnal" className="sr-only">Hasil Apresiasi</Label>
                                    <Textarea 
                                        id="apresiasi-jurnal" 
                                        placeholder="Tuliskan hasil apresiasi kelompok Anda di sini..." 
                                        rows={15} 
                                        value={journalText}
                                        onChange={(e) => setJournalText(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                             </CardContent>
                        </Card>

                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || loading}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isSubmitting ? "Menyimpan..." : "Simpan Jurnal Membaca"}
                        </Button>
                    </form>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
