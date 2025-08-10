
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { TeacherHeader } from '@/components/layout/teacher-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';


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
};

// A mapping of activity IDs to human-readable names
const activityNames: { [key: string]: string } = {
    asesmen: 'E. Asesmen',
    menulis: 'C. Menulis Teks Deskripsi',
    membaca: 'B. Membaca Teks Deskripsi',
    menyimak: 'A. Menyimak Teks Deskripsi',
    mempresentasikan: 'D. Mempresentasikan Teks Deskripsi',
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
    const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!groupId) return;

        async function fetchData() {
            setLoading(true);
            try {
                // Fetch group details
                const groupRef = doc(db, 'groups', groupId);
                const groupSnap = await getDoc(groupRef);
                if (groupSnap.exists()) {
                    setGroup({ id: groupSnap.id, ...groupSnap.data() } as Group);
                }

                // Fetch submissions for this group
                const q = query(collection(db, 'submissions'), where('studentId', '==', groupId));
                const querySnapshot = await getDocs(q);
                const subs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
                setSubmissions(subs);

                // Initialize scores state from fetched submissions
                const initialScores: Record<string, Record<string, number>> = {};
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
        const newScore = Number(value);
        if (isNaN(newScore)) return;

        setScores(prev => ({
            ...prev,
            [activity]: {
                ...prev[activity],
                [subtask]: newScore
            }
        }));
    };

    const handleSaveScores = async () => {
        setIsSaving(true);
        try {
            const promises = Object.entries(scores).map(([activity, activityScores]) => {
                const submission = submissions.find(s => s.activity === activity);
                if (submission) {
                    const submissionRef = doc(db, 'submissions', submission.id);
                    return setDoc(submissionRef, { scores: activityScores }, { merge: true });
                }
                return Promise.resolve();
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
        
        switch(sub.activity) {
            case 'asesmen':
                return Object.entries(sub.answers).map(([key, value]) => (
                    <div key={key} className="py-2">
                        <p className="font-semibold text-sm">Pertanyaan: {key}</p>
                        <p className="text-sm text-muted-foreground bg-slate-50 p-2 rounded-md mt-1">{(value as string)}</p>
                    </div>
                ));
            // Add cases for other activities here as they become available
            default:
                 return <pre className="text-xs bg-slate-100 p-2 rounded-md overflow-auto">{JSON.stringify(sub.answers, null, 2)}</pre>;
        }
    }
    
     const renderScoringInterface = (activity: string) => {
        // We can customize this per activity later
        return (
            <div className="flex items-center gap-2">
                <Label htmlFor={`score-${activity}`} className="flex-shrink-0">Nilai Akhir:</Label>
                <Input 
                    id={`score-${activity}`}
                    type="number" 
                    className="w-24"
                    placeholder="0-100"
                    value={scores[activity]?.finalScore ?? ''}
                    onChange={(e) => handleScoreChange(activity, 'finalScore', e.target.value)}
                />
            </div>
        );
     };

    if (loading) {
        return (
             <AuthenticatedLayout>
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
                        
                        {submissions.length > 0 ? (
                            <Accordion type="multiple" className="w-full space-y-4">
                                {submissions.map((sub) => (
                                    <Card key={sub.id}>
                                        <AccordionItem value={sub.id}>
                                            <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline">
                                                <div className="flex justify-between w-full pr-4 items-center">
                                                    <span>{activityNames[sub.activity] || sub.activity}</span>
                                                    {scores[sub.activity]?.finalScore !== undefined ? (
                                                        <Badge variant="default">Sudah Dinilai: {scores[sub.activity].finalScore}</Badge>
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
                                                <Separator className="my-4"/>
                                                <div className="bg-blue-50 p-4 rounded-md">
                                                    <h4 className="font-semibold mb-2">Formulir Penilaian</h4>
                                                    {renderScoringInterface(sub.activity)}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Card>
                                ))}
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

