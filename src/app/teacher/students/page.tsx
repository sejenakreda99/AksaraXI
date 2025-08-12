
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { createStudent, CreateStudentInput } from '@/ai/flows/create-student-flow';

// Simplified user type
type User = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

// --- AddStudentForm Component (Now integrated) ---
function AddStudentForm({ onStudentAdded }: { onStudentAdded: () => void }) {
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: 'Email dan kata sandi harus diisi.',
      });
      setIsPending(false);
      return;
    }
    if (password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: 'Kata sandi minimal 8 karakter.',
      });
      setIsPending(false);
      return;
    }

    try {
      const studentData: CreateStudentInput = {
        email,
        password,
      };

      const result = await createStudent(studentData);

      toast({
        title: 'Berhasil',
        description: `Akun siswa untuk ${email} berhasil dibuat.`,
      });
      formRef.current?.reset();
      onStudentAdded(); // Refresh the list
    } catch (error: any) {
      console.error('Error creating user via flow:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Akun',
        description: error.message || 'Terjadi kesalahan yang tidak diketahui.',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tambah Siswa Baru</CardTitle>
        <CardDescription>
          Buat akun untuk siswa agar mereka dapat masuk ke platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Siswa</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contoh@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              minLength={8}
              required
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Menambahkan...' : 'Tambah Siswa'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'Siswa'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const studentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
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
