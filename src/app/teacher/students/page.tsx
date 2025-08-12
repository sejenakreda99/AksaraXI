
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AddStudentForm } from "@/app/dashboard/add-student-form";
import AuthenticatedLayout from "@/app/(authenticated)/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TeacherHeader } from "@/components/layout/teacher-header";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';

// Simplified user type
type User = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      if (!snapshot.empty) {
        const studentData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as User))
          .filter(user => user.role === 'Siswa'); // Only show students
        setStudents(studentData);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]); // Clear students on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="Manajemen Siswa"
          description="Tambah dan lihat daftar siswa yang terdaftar."
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full max-w-7xl mx-auto">
            <div className="w-full xl:col-span-1">
              <AddStudentForm onStudentAdded={fetchStudents} />
            </div>
            <div className="w-full xl:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Daftar Siswa</CardTitle>
                  <CardDescription>Berikut adalah daftar akun siswa yang terdaftar.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>Daftar siswa akan muncul di sini.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Tanggal Dibuat</TableHead>
                        {/* <TableHead className="text-right">Aksi</TableHead> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                           <TableRow key={index}>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                            {/* <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell> */}
                          </TableRow>
                        ))
                      ) : students.length > 0 ? (
                        students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.email}</TableCell>
                            <TableCell>{new Date(student.createdAt).toLocaleDateString('id-ID')}</TableCell>
                            {/* <TableCell className="text-right">
                              Aksi (mis. hapus) dapat ditambahkan di sini
                            </TableCell> */}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground h-24">
                              Belum ada siswa yang ditambahkan.
                            </TableCell>
                          </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
