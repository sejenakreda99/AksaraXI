
'use client';

import { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { TeacherHeader } from '@/components/layout/teacher-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Award, Users, BadgeCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

type Group = {
  id: string;
  className: string;
  groupName: string;
  members: string[];
};

type Submission = {
  studentId: string;
  activity: string;
  chapterId: string;
};

type ProgressData = Group & {
  completedActivities: number;
  progress: number;
  score: number | null; // Null for now as scoring is manual
};

const TOTAL_ACTIVITIES_BAB_1 = 7; // menyimak, membaca, menulis, mempresentasikan, asesmen, jurnal-membaca, refleksi

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [classFilter, setClassFilter] = useState('semua-kelas');
  const [chapterFilter, setChapterFilter] = useState('1');
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const groupsSnapshot = await getDocs(collection(db, 'groups'));
        const submissionsSnapshot = await getDocs(collection(db, 'submissions'));

        const groupsData = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
        const submissionsData = submissionsSnapshot.docs.map(doc => doc.data() as Submission);

        setAllGroups(groupsData);
        setAllSubmissions(submissionsData);

      } catch (error) {
        console.error("Error fetching progress data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const progressData = useMemo(() => {
    return allGroups
      .map(group => {
        const groupSubmissions = allSubmissions.filter(sub => sub.studentId === group.id && sub.chapterId === chapterFilter);
        const uniqueActivities = new Set(groupSubmissions.map(sub => sub.activity));
        const completedCount = uniqueActivities.size;
        const progressPercentage = Math.round((completedCount / TOTAL_ACTIVITIES_BAB_1) * 100);

        return {
          ...group,
          completedActivities: completedCount,
          progress: progressPercentage,
          score: null, // Manual scoring to be implemented
        };
      })
      .filter(group => {
        if (classFilter === 'semua-kelas') return true;
        return group.className === classFilter;
      })
      .sort((a, b) => {
         if (a.className < b.className) return -1;
         if (a.className > b.className) return 1;
         if (a.groupName < b.groupName) return -1;
         if (a.groupName > b.groupName) return 1;
         return 0;
      });
  }, [allGroups, allSubmissions, classFilter, chapterFilter]);
  
  const handleRowClick = (groupId: string) => {
    router.push(`/teacher/progress/${groupId}`);
  };

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="Pantau Kemajuan Siswa"
          description="Lacak progres dan skor setiap kelompok secara real-time."
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle>Laporan Kemajuan Kelompok</CardTitle>
                    <CardDescription>Pilih kelompok untuk melihat detail jawaban dan memberikan nilai.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue={chapterFilter} onValueChange={setChapterFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Pilih Bab" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Bab 1</SelectItem>
                        <SelectItem value="2" disabled>Bab 2 (Segera)</SelectItem>
                      </SelectContent>
                    </Select>
                     <Select defaultValue={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Pilih Kelas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semua-kelas">Semua Kelas</SelectItem>
                        <SelectItem value="XI-2">XI-2</SelectItem>
                        <SelectItem value="XI-3">XI-3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]"><Users className="inline-block mr-2 h-4 w-4" />Nama Kelompok</TableHead>
                      <TableHead><BookOpen className="inline-block mr-2 h-4 w-4" />Progres Materi</TableHead>
                      <TableHead className="text-right"><Award className="inline-block mr-2 h-4 w-4" />Skor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : progressData.length > 0 ? (
                      progressData.map((group) => (
                        <TableRow key={group.id} onClick={() => handleRowClick(group.id)} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">{group.groupName} ({group.className})</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                               <Progress value={group.progress} className="w-[60%]" aria-label={`${group.progress}% selesai`} />
                               <span className="text-xs text-muted-foreground font-mono">{group.progress}%</span>
                               {group.progress === 100 && <BadgeCheck className="h-5 w-5 text-green-500" />}
                            </div>
                            <span className="text-xs text-muted-foreground">{group.completedActivities} dari {TOTAL_ACTIVITIES_BAB_1} kegiatan selesai</span>
                          </TableCell>
                           <TableCell className="text-right">
                                <Badge variant="secondary">Perlu Dinilai</Badge>
                           </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          Belum ada data kemajuan yang tersedia untuk filter yang dipilih.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
