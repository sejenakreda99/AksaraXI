
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';


type AssessmentAnswers = {
    speakerName: string;
    speakerClass: string;
    textTitle: string;
    scores: Record<number, 'baik' | 'sedang' | 'cukup' | ''>;
}

export default function MempresentasikanSiswaPage() {
    const params = useParams();
    const chapterId = params.id as string;
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const assessmentCriteria = [
        "Kriteria memerinci objek",
        "Kejelasan ekspresi",
        "Teks deskripsi dimulai dengan gambaran umum",
        "Teks memuat deskripsi bagian",
        "Teks mengandung kesan-kesan yang menyenangkan",
        "Teks sudah memperhatikan kaidah kebahasaan deskripsi"
    ];

    const [answers, setAnswers] = useState<AssessmentAnswers>({
        speakerName: '',
        speakerClass: '',
        textTitle: '',
        scores: {}
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAnswers(prev => ({ ...prev, [name]: value }));
    }

    const handleScoreChange = (index: number, value: 'baik' | 'sedang' | 'cukup') => {
        setAnswers(prev => ({
            ...prev,
            scores: {
                ...prev.scores,
                [index]: value
            }
        }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        // TODO: Implement Firebase submission logic
        console.log(answers);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
            title: "Penilaian Disimpan",
            description: "Penilaian Anda untuk teman Anda telah berhasil disimpan.",
        });

        setIsSubmitting(false);
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
                        <h1 className="text-2xl font-bold text-foreground capitalize">D. Mempresentasikan Teks Deskripsi</h1>
                        <p className="text-muted-foreground mt-1">Bab {chapterId}: Membicarakan Teks Deskripsi</p>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8">
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>Tujuan Pembelajaran</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg">Menyajikan gagasan dalam teks deskripsi.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Kegiatan 1: Panduan Membaca Nyaring</CardTitle>
                            </CardHeader>
                            <CardContent className="prose prose-sm max-w-none text-foreground">
                                <p>Pada kegiatan ini, kalian akan membacakan secara lisan atau membaca nyaring, teks deskripsi yang telah kalian tulis. Kalian juga bisa menyajikan teks deskripsi seperti para presenter wisata atau presenter kuliner. Salah satu hal yang harus diperhatikan saat membaca nyaring adalah mengatur intonasi. Penggunaan intonasi yang tepat akan membuat kegiatan membaca nyaring kalian lebih menarik.</p>
                                <p>Cara mengatur intonasi saat berbicara atau membaca nyaring yaitu sebagai berikut.</p>
                                <ol>
                                    <li>Gunakan suara yang lantang untuk menegaskan suatu hal yang penting dan harus diingat audiens</li>
                                    <li>Gunakan tempo berbicara yang lambat untuk menyampaikan/membaca sebuah poin penting. Sebaliknya, gunakan tempo berbicara yang cepat untuk menyampaikan suatu hal yang memang bukan hal penting.</li>
                                    <li>Tinggikan suara kalian ketika menyapa pendengar pada awal pembacaan. Sebaliknya, rendahkan suara kalian saat membaca nyaring isi teks deskripsi.</li>
                                    <li>Gunakan perasaan atau emosi sesuai dengan kalimat yang kalian ucapkan.</li>
                                </ol>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Latihan: Penilaian Membaca Nyaring</CardTitle>
                                <CardDescription>Lakukanlah penilaian terhadap teman kalian yang sedang membaca nyaring. Untuk memudahkan menilai, isilah format penilaian berikut.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="speakerName">Nama Pembicara</Label>
                                        <Input id="speakerName" name="speakerName" value={answers.speakerName} onChange={handleInputChange} required />
                                     </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="speakerClass">Kelas</Label>
                                        <Input id="speakerClass" name="speakerClass" value={answers.speakerClass} onChange={handleInputChange} required />
                                     </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="textTitle">Judul Teks</Label>
                                        <Input id="textTitle" name="textTitle" value={answers.textTitle} onChange={handleInputChange} required />
                                     </div>
                                </div>
                                <Separator />
                                <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">No.</TableHead>
                                            <TableHead>Unsur yang Dinilai</TableHead>
                                            <TableHead className="w-[250px] text-center">Hasil Penilaian</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assessmentCriteria.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{index + 1}.</TableCell>
                                                <TableCell className="font-medium">{item}</TableCell>
                                                <TableCell className="text-center">
                                                    <RadioGroup 
                                                        className="flex justify-center gap-4" 
                                                        value={answers.scores[index] || ''}
                                                        onValueChange={(value) => handleScoreChange(index, value as any)}
                                                        required
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="baik" id={`r-${index}-baik`} />
                                                            <Label htmlFor={`r-${index}-baik`}>Baik</Label>
                                                        </div>
                                                         <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="sedang" id={`r-${index}-sedang`} />
                                                            <Label htmlFor={`r-${index}-sedang`}>Sedang</Label>
                                                        </div>
                                                         <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="cukup" id={`r-${index}-cukup`} />
                                                            <Label htmlFor={`r-${index}-cukup`}>Cukup</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                </div>
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isSubmitting ? "Menyimpan..." : "Simpan Penilaian"}
                        </Button>
                    </form>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
