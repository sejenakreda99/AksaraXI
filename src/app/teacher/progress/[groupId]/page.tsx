
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { TeacherHeader } from '@/components/layout/teacher-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Check, X, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

// --- TYPE DEFINITIONS ---
type Group = {
  id: string;
  className: string;
  groupName: string;
  members: string[];
};

type Submission = {
    id: string;
    activity: string;
    answers: any;
    scores?: Record<string, number>;
    lastSubmitted: any;
};

type ChapterContent = any; // Using any for flexibility as structure varies

const activityNames: { [key: string]: string } = {
    menyimak: 'A. Menyimak Teks Deskripsi',
    membaca: 'B. Membaca Teks Deskripsi',
    menulis: 'C. Menulis Teks Deskripsi',
    mempresentasikan: 'D. Mempresentasikan Teks Deskripsi',
    asesmen: 'E. Asesmen',
    'jurnal-membaca': 'Jurnal Membaca',
    refleksi: 'Refleksi',
};


export default function GradeGroupPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const groupId = params.groupId as string;

    const [group, setGroup] = useState<Group | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [chapterContent, setChapterContent] = useState<ChapterContent | null>(null);
    const [scores, setScores] = useState<Record<string, Record<string, number | undefined>>>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!groupId) return;

        async function fetchData() {
            setLoading(true);
            try {
                // Fetch group details, submissions, and chapter content concurrently
                const [groupSnap, submissionsSnapshot, chapterSnap] = await Promise.all([
                    getDoc(doc(db, 'groups', groupId)),
                    getDocs(query(collection(db, 'submissions'), where('studentId', '==', groupId), where('chapterId', '==', '1'))),
                    getDoc(doc(db, 'chapters', '1'))
                ]);
                
                if (groupSnap.exists()) {
                    setGroup({ id: groupSnap.id, ...groupSnap.data() } as Group);
                }
                
                const subs = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
                setSubmissions(subs);

                if (chapterSnap.exists()) {
                    setChapterContent(chapterSnap.data());
                }

                // Initialize scores state from fetched submissions
                const initialScores: Record<string, Record<string, number | undefined>> = {};
                subs.forEach(sub => {
                    if (sub.scores) {
                        initialScores[sub.activity] = sub.scores;
                    }
                });
                setScores(initialScores);

            } catch (error) {
                console.error("Error fetching data: ", error);
                 toast({ variant: 'destructive', title: 'Gagal Memuat Data' });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [groupId, toast]);

    const handleScoreChange = (activity: string, subtask: string, value: string) => {
        const newScore = value === '' ? undefined : Number(value);
        if (value !== '' && (isNaN(newScore) || newScore < 0)) return;

        setScores(prev => ({
            ...prev,
            [activity]: {
                ...prev[activity],
                [subtask]: newScore
            }
        }));
    };
    
    const calculateTotalScore = (activity: string) => {
        const activityScores = scores[activity];
        if (!activityScores) return 0;
        return Object.values(activityScores).reduce((acc, score) => acc + (score || 0), 0);
    }

    const handleSaveScores = async () => {
        setIsSaving(true);
        try {
            const promises = submissions.map(sub => {
                const submissionRef = doc(db, 'submissions', sub.id);
                const currentScores = scores[sub.activity] || {};
                const finalScore = calculateTotalScore(sub.activity);
                const scoresToSave = { ...currentScores, finalScore };
                return setDoc(submissionRef, { scores: scoresToSave }, { merge: true });
            });

            await Promise.all(promises);

            toast({
                title: "Berhasil",
                description: `Nilai untuk kelompok ${group?.groupName} telah disimpan.`
            });
        } catch (error) {
            console.error("Error saving scores: ", error);
            toast({ variant: 'destructive', title: 'Gagal Menyimpan Nilai' });
        } finally {
            setIsSaving(false);
        }
    }
    
    const renderSubmissionDetails = (sub: Submission) => {
        if (!sub.answers) return <p className="text-muted-foreground">Siswa belum mengirimkan jawaban untuk kegiatan ini.</p>;
        
        const activityContent = chapterContent?.[sub.activity];

        switch(sub.activity) {
            case 'asesmen':
                const assessmentQuestions = [
                    ...(activityContent?.part1Questions || []),
                    ...(activityContent?.part2Questions || []),
                ];
                return Object.entries(sub.answers).map(([key, value], index) => {
                    const questionNumber = key.startsWith('q1') ? parseInt(key.split('-')[1]) + 1 : parseInt(key.split('-')[1]) + 7;
                    const questionText = assessmentQuestions[index] || `Pertanyaan ${questionNumber}`;
                    return (
                        <div key={key} className="py-2 space-y-1">
                            <p className="font-semibold text-sm">{questionNumber}. {questionText}</p>
                            <p className="text-sm text-muted-foreground bg-slate-50 p-2 rounded-md mt-1 border whitespace-pre-wrap">{(value as string)}</p>
                        </div>
                    );
                });
            
             case 'membaca':
                const readingAnswers = sub.answers.latihan;
                const readingQuestions = activityContent?.latihanStatements || [];
                return (
                    <div className='space-y-4'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ciri-Ciri</TableHead>
                                    <TableHead>Jawaban Siswa</TableHead>
                                    <TableHead>Bukti Informasi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {readingQuestions.map((q: any, index: number) => {
                                    const answer = readingAnswers?.[index];
                                    return (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{q.statement}</TableCell>
                                            <TableCell className="capitalize">{answer?.choice || '-'}</TableCell>
                                            <TableCell className="text-muted-foreground">{answer?.evidence || '-'}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                        <Separator/>
                        <div>
                             <p className="font-semibold text-sm">Simpulan Siswa:</p>
                             <p className="text-sm text-muted-foreground bg-slate-50 p-2 rounded-md mt-1 border whitespace-pre-wrap">{sub.answers.simpulan || 'Tidak ada simpulan.'}</p>
                        </div>
                    </div>
                )
            
            case 'menyimak':
                 const menyimakAnswers = sub.answers.kegiatan1;
                 const menyimakQuestions = activityContent?.statements || [];
                 return (
                     <Table>
                         <TableHeader>
                             <TableRow>
                                <TableHead>Pernyataan</TableHead>
                                <TableHead>Jawaban Siswa</TableHead>
                                <TableHead>Kunci</TableHead>
                                <TableHead>Bukti Informasi</TableHead>
                             </TableRow>
                         </TableHeader>
                         <TableBody>
                            {menyimakQuestions.map((q: any, index: number) => {
                                const answerKey = q.no.toString();
                                const answer = menyimakAnswers?.[answerKey];
                                const isCorrect = answer?.choice === q.answer;
                                return (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{q.statement}</TableCell>
                                        <TableCell className={`capitalize ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                            {answer?.choice || '-'}
                                        </TableCell>
                                        <TableCell className="capitalize font-bold">{q.answer}</TableCell>
                                        <TableCell className="text-muted-foreground">{answer?.evidence || '-'}</TableCell>
                                    </TableRow>
                                )
                            })}
                         </TableBody>
                     </Table>
                 );
            
             case 'menulis':
                const writingAnswers = sub.answers;
                const checklistItems = activityContent?.checklistItems || [];
                return (
                    <div className='space-y-6'>
                        <div>
                            <h4 className="font-semibold text-base mb-2">Teks Deskripsi Siswa</h4>
                            <Textarea readOnly value={writingAnswers.finalText || 'Tidak ada teks yang dikumpulkan.'} rows={15} className="bg-slate-50" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-base mb-2">Tautan Publikasi</h4>
                            {writingAnswers.submissionLink ? (
                                <Link href={writingAnswers.submissionLink} target="_blank" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                    <ExternalLink className="w-4 h-4" />
                                    {writingAnswers.submissionLink}
                                </Link>
                            ) : (
                                <p className="text-sm text-muted-foreground">Tidak ada tautan yang dikumpulkan.</p>
                            )}
                        </div>
                        <div>
                             <h4 className="font-semibold text-base mb-2">Checklist Mandiri</h4>
                             <Table>
                                <TableBody>
                                    {checklistItems.map((item: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.text}</TableCell>
                                            <TableCell className='w-[100px] text-center'>
                                                {writingAnswers.checklist[index] ? <Check className='text-green-500 mx-auto' /> : <X className='text-red-500 mx-auto' />}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                             </Table>
                        </div>
                    </div>
                )

            case 'mempresentasikan':
                const presentasiAnswers = sub.answers;
                const presentasiCriteria = activityContent?.assessmentCriteria || [];
                return (
                     <div>
                        <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
                            <p><strong>Pembicara:</strong> {presentasiAnswers.speakerName}</p>
                            <p><strong>Kelas:</strong> {presentasiAnswers.speakerClass}</p>
                            <p className='col-span-2'><strong>Judul Teks:</strong> {presentasiAnswers.textTitle}</p>
                        </div>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Unsur yang Dinilai</TableHead>
                                    <TableHead className='text-right'>Hasil Penilaian</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {presentasiCriteria.map((item: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{item}</TableCell>
                                        <TableCell className='text-right capitalize font-medium'>{presentasiAnswers.scores[index] || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                         </Table>
                     </div>
                );
            
            case 'jurnal-membaca':
                return (
                    <div>
                         <h4 className="font-semibold text-base mb-2">Hasil Apresiasi Novel</h4>
                         <Textarea readOnly value={sub.answers?.journal || 'Tidak ada jurnal yang diisi.'} rows={15} className="bg-slate-50" />
                    </div>
                )
            
            case 'refleksi':
                 const refleksiQuestions = activityContent?.reflectionQuestions || [
                    "Setelah mempelajari menyimak, membaca, menulis, dan mempresentasikan teks deskripsi, kesimpulan apa yang dapat kalian ambil?",
                    "Pengetahuan apa saja yang kalian peroleh?",
                    "Keterampilan berbahasa apa saja yang kalian kuasai?",
                    "Bagaimana sikap kalian setelah selesai mengikuti pembelajaran teks deskripsi?",
                    "Apakah kalian merasa senang karena wawasan kalian bertambah?",
                    "Apakah kalian tertarik menerapkan pengetahuan yang telah diperoleh?",
                    "Apakah kalian tertarik mengembangkan keterampilan kalian dalam memproduksi teks deskripsi sesuai kebutuhan berbahasa? Bagaimana caranya?",
                ];
                return (
                    <div className="space-y-4">
                        {refleksiQuestions.map((q: string, index: number) => (
                            <div key={index} className="py-2 space-y-1">
                                <p className="font-semibold text-sm">{index + 1}. {q}</p>
                                <p className="text-sm text-muted-foreground bg-slate-50 p-2 rounded-md mt-1 border whitespace-pre-wrap">{sub.answers?.[index] || 'Tidak dijawab.'}</p>
                            </div>
                        ))}
                    </div>
                )


            default:
                 return <pre className="text-xs bg-slate-100 p-2 rounded-md overflow-auto border">{JSON.stringify(sub.answers, null, 2)}</pre>;
        }
    }
    
     const renderScoringInterface = (sub: Submission) => {
        const activityContent = chapterContent?.[sub.activity];
        const activityScores = scores[sub.activity] || {};

        const renderSimpleScoring = (label = "Nilai Akhir") => (
             <div className="flex items-center gap-2">
                <Label htmlFor={`score-${sub.activity}`} className="flex-shrink-0">{label}:</Label>
                <Input 
                    id={`score-${sub.activity}`}
                    type="number" 
                    className="w-24"
                    placeholder="0-100"
                    value={activityScores.finalScore ?? ''}
                    onChange={(e) => handleScoreChange(sub.activity, 'finalScore', e.target.value)}
                />
            </div>
        );

        if (!activityContent) return renderSimpleScoring();

        switch(sub.activity) {
            case 'asesmen':
                 const questions = [
                    ...(activityContent?.part1Questions || []),
                    ...(activityContent?.part2Questions || []),
                ];
                return (
                    <div className="space-y-2">
                        {questions.map((q: string, index: number) => {
                             const answerKey = index < (activityContent?.part1Questions.length || 0) ? `q1-${index}` : `q2-${index - (activityContent?.part1Questions.length || 0)}`;
                             return (
                                <div key={index} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-md border">
                                    <Label htmlFor={`score-${sub.activity}-${index}`} className="flex-shrink-0 text-sm truncate pr-4">Poin Soal #{index + 1}</Label>
                                    <Input 
                                        id={`score-${sub.activity}-${index}`}
                                        type="number" 
                                        className="w-24 h-8"
                                        placeholder="Poin"
                                        value={activityScores[answerKey] ?? ''}
                                        onChange={(e) => handleScoreChange(sub.activity, answerKey, e.target.value)}
                                    />
                                </div>
                             )
                        })}
                    </div>
                )
            case 'menyimak':
                 const menyimakQuestions = activityContent?.statements || [];
                 const autoScores: Record<string, number> = {};
                 menyimakQuestions.forEach((q: any, index: number) => {
                     const answerKey = q.no.toString();
                     const answer = sub.answers?.kegiatan1?.[answerKey];
                     if (answer?.choice === q.answer) {
                        autoScores[`q${answerKey}_choice`] = q.points;
                     } else {
                        autoScores[`q${answerKey}_choice`] = 0;
                     }
                 });

                 return (
                     <div className="space-y-2">
                        {menyimakQuestions.map((q: any) => {
                             const answerKey = q.no.toString();
                             const isCorrect = sub.answers?.kegiatan1?.[answerKey]?.choice === q.answer;
                            return (
                                <div key={q.no} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-md border">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`score-menyimak-evidence-${q.no}`} className="flex-shrink-0 text-sm">Poin Bukti (Soal #{answerKey})</Label>
                                        <Badge variant={isCorrect ? 'default': 'destructive'} className="bg-opacity-80">
                                            {isCorrect ? 'Benar' : 'Salah'} (+{autoScores[`q${answerKey}_choice`]})
                                        </Badge>
                                    </div>
                                    <Input 
                                        id={`score-menyimak-evidence-${q.no}`}
                                        type="number" 
                                        className="w-24 h-8"
                                        placeholder={`0-${q.evidencePoints}`}
                                        max={q.evidencePoints}
                                        value={activityScores[`q${answerKey}_evidence`] ?? ''}
                                        onChange={(e) => handleScoreChange(sub.activity, `q${answerKey}_evidence`, e.target.value)}
                                    />
                                </div>
                            )
                        })}
                     </div>
                 );
            
            case 'menulis':
                 return (
                     <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-md border">
                           <Label htmlFor="score-menulis-text" className="flex-shrink-0 text-sm">Poin Teks Deskripsi</Label>
                           <Input 
                                id="score-menulis-text"
                                type="number" 
                                className="w-24 h-8"
                                placeholder="0-100"
                                value={activityScores.finalText ?? ''}
                                onChange={(e) => handleScoreChange(sub.activity, 'finalText', e.target.value)}
                            />
                        </div>
                         <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-md border">
                           <Label htmlFor="score-menulis-link" className="flex-shrink-0 text-sm">Poin Tautan Publikasi</Label>
                           <Input 
                                id="score-menulis-link"
                                type="number" 
                                className="w-24 h-8"
                                placeholder="Poin"
                                value={activityScores.submissionLink ?? ''}
                                onChange={(e) => handleScoreChange(sub.activity, 'submissionLink', e.target.value)}
                            />
                        </div>
                     </div>
                 )

            case 'jurnal-membaca':
                return renderSimpleScoring("Skor Jurnal");
            
            case 'refleksi':
                 return renderSimpleScoring("Skor Refleksi");
            
            case 'mempresentasikan':
                 return renderSimpleScoring("Skor Penilaian Presentasi");
            
            default:
                return renderSimpleScoring();
        }
     };

    const sortedSubmissions = useMemo(() => {
        return submissions.sort((a, b) => {
            const order = Object.keys(activityNames);
            return order.indexOf(a.activity) - order.indexOf(b.activity);
        });
    }, [submissions]);

    if (loading) {
        return (
             <AuthenticatedLayout>
                 <TeacherHeader title="Memuat Penilaian..." description="Sedang mengambil data siswa." />
                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-4xl mx-auto space-y-4">
                        <Skeleton className="h-10 w-1/4" />
                        <Skeleton className="h-8 w-1/2" />
                        <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
                        <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
                    </div>
                </main>
            </AuthenticatedLayout>
        )
    }

    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-full">
                <TeacherHeader
                    title={`Penilaian: ${group?.groupName || 'Kelompok'}`}
                    description={`Kelas ${group?.className || ''}. Berikan skor untuk setiap tugas yang dikumpulkan.`}
                />
                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <Button variant="outline" onClick={() => router.push('/teacher/progress')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Laporan
                            </Button>
                             <Button onClick={handleSaveScores} disabled={isSaving}>
                                {isSaving ? 'Menyimpan...' : <><Save className="mr-2 h-4 w-4" />Simpan Semua Nilai</>}
                            </Button>
                        </div>
                        
                        {sortedSubmissions.length > 0 ? (
                            <Accordion type="multiple" className="w-full space-y-4" defaultValue={sortedSubmissions.map(sub => sub.id)}>
                                {sortedSubmissions.map((sub) => {
                                    const totalScore = calculateTotalScore(sub.activity);
                                    const hasBeenScored = totalScore > 0 || Object.keys(scores[sub.activity] || {}).length > 0;
                                    
                                    return (
                                        <Card key={sub.id}>
                                            <AccordionItem value={sub.id} className="border-b-0">
                                                <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline">
                                                    <div className="flex justify-between w-full pr-4 items-center">
                                                        <span>{activityNames[sub.activity] || sub.activity}</span>
                                                        {hasBeenScored ? (
                                                            <Badge variant="default" className="bg-green-600">Total Skor: {totalScore}</Badge>
                                                        ) : (
                                                            <Badge variant="destructive">Belum Dinilai</Badge>
                                                        )}
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="p-6 pt-0">
                                                    <Separator className="mb-4"/>
                                                    <div className="space-y-4">
                                                        {renderSubmissionDetails(sub)}
                                                    </div>
                                                    <Separator className="my-6"/>
                                                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                                                        <h4 className="font-semibold mb-2">Formulir Penilaian</h4>
                                                        {renderScoringInterface(sub)}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Card>
                                    )
                                })}
                            </Accordion>
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    Kelompok ini belum mengumpulkan tugas apapun.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
