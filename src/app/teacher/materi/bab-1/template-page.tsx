import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type TemplatePageProps = {
    title: string;
    description: string;
}

export default function TemplatePage({ title, description }: TemplatePageProps) {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader title={title} description={description} />
        <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                 <div className="mb-4">
                    <Button asChild variant="outline">
                        <Link href="/teacher/materi/bab-1">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Struktur Bab
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Konten Pembelajaran</CardTitle>
                        <CardDescription>
                        Materi untuk bagian ini sedang dalam pengembangan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="prose max-w-none">
                            <p>
                                Kerangka untuk halaman ini telah berhasil dibuat. Anda dapat mulai menambahkan konten di sini, seperti tujuan pembelajaran, pertanyaan, materi teks, latihan, atau asesmen.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
