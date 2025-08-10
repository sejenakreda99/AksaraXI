'use client';

import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { TeacherHeader } from '@/components/layout/teacher-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Award, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- Placeholder Data ---
const placeholderGroups = [
  { id: '1', name: 'Kelompok 1 (XI-2)', progress: 75, score: 88, members: 5 },
  { id: '2', name: 'Kelompok 2 (XI-2)', progress: 100, score: 95, members: 4 },
  { id: '3', name: 'Kelompok 3 (XI-2)', progress: 25, score: 30, members: 5 },
  { id: '4', name: 'Kelompok 1 (XI-3)', progress: 50, score: 65, members: 5 },
  { id: '5', name: 'Kelompok 2 (XI-3)', progress: 15, score: 10, members: 4 },
];

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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
                    <CardDescription>Data di bawah ini adalah placeholder dan akan diganti dengan data real-time.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="bab-1">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Pilih Bab" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bab-1">Bab 1</SelectItem>
                        <SelectItem value="bab-2" disabled>Bab 2 (Segera)</SelectItem>
                      </SelectContent>
                    </Select>
                     <Select defaultValue="semua-kelas">
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
                      <TableHead className="text-right"><Award className="inline-block mr-2 h-4 w-4" />Total Skor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : placeholderGroups.length > 0 ? (
                      placeholderGroups.map((group) => (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium">{group.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                               <Progress value={group.progress} className="w-[60%]" />
                               <span className="text-xs text-muted-foreground font-mono">{group.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-lg text-primary">{group.score}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          Belum ada data kemajuan yang tersedia.
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
