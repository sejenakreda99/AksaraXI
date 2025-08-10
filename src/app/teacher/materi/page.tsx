import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Book, PlusCircle } from "lucide-react";

const chapters = [
  {
    title: "Bab 1: Membicarakan Teks Deskripsi Bertema Keindahan Alam Indonesia",
    description: "Materi utama tentang cara memahami, menulis, dan mempresentasikan teks deskripsi.",
    href: "/teacher/materi/bab-1",
  },
];

export default function MateriPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="Materi Pembelajaran"
          description="Kelola bab dan materi pembelajaran untuk siswa."
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-end mb-4">
                <Button disabled>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Bab (Segera)
                </Button>
            </div>
            <div className="space-y-4">
              {chapters.map((chapter) => (
                <Card key={chapter.title}>
                  <CardHeader>
                    <CardTitle className="text-xl">{chapter.title}</CardTitle>
                    <CardDescription>{chapter.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link href={chapter.href}>
                        <Book className="mr-2 h-4 w-4" />
                        Lihat Detail Bab
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
