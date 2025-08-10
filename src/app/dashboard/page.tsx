import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, BarChart } from 'lucide-react';
import { TeacherHeader } from '@/components/layout/teacher-header';
import AuthenticatedLayout from '@/app/(authenticated)/layout';

export default function DashboardPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="Dasbor Guru"
          description="Selamat datang di dasbor Aksara XI. Kelola siswa dan pantau kemajuan mereka di sini."
        />
        <main className="flex-1 p-4 md:p-8 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                Kelola Siswa
              </CardTitle>
              <CardDescription>
                Tambah atau lihat daftar siswa yang terdaftar di kelas Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
              <Button asChild className="w-full">
                <Link href="/teacher/students">Buka Manajemen Siswa</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-6 h-6" />
                Pantau Kemajuan
              </CardTitle>
              <CardDescription>
                Lihat laporan dan analisis kemajuan belajar siswa secara
                keseluruhan.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
              <Button asChild className="w-full" disabled>
                <Link href="#">Buka Pemantauan</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
