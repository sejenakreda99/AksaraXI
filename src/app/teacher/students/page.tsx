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

export default function TeacherStudentsPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="Manajemen Siswa"
          description="Tambah siswa baru dan lihat daftar siswa yang terdaftar."
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
            <div className="md:col-span-1">
              <AddStudentForm />
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Siswa</CardTitle>
                  <CardDescription>Berikut adalah daftar siswa yang terdaftar.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>Daftar siswa akan muncul di sini.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">No.</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            Belum ada siswa yang ditambahkan.
                          </TableCell>
                        </TableRow>
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
