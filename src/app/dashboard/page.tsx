import { AddStudentForm } from "./add-student-form";
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


export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 space-y-8">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl font-bold text-foreground">Dasbor Guru</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Selamat datang di dasbor Aksara XI. Kelola siswa Anda di sini.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
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
  );
}
