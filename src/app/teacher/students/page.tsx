import { AddGroupForm } from "@/app/dashboard/add-student-form";
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
import { getGroups } from "@/app/dashboard/actions";

type Group = {
  id: string;
  className: string;
  groupName: string;
  email: string;
}

export default async function TeacherStudentsPage() {
  const groups: Group[] = await getGroups();

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="Manajemen Kelompok"
          description="Tambah kelompok baru dan lihat daftar kelompok yang terdaftar."
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
            <div className="w-full">
              <AddGroupForm />
            </div>
            <div className="w-full">
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Kelompok</CardTitle>
                  <CardDescription>Berikut adalah daftar kelompok yang terdaftar.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>Daftar kelompok akan muncul di sini jika ada.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Kelompok</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Kelas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groups.length > 0 ? (
                        groups.map((group) => (
                          <TableRow key={group.id}>
                            <TableCell>{group.groupName}</TableCell>
                            <TableCell>{group.email}</TableCell>
                            <TableCell>{group.className}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              Belum ada kelompok yang ditambahkan.
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