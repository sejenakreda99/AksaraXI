import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

export default function TujuanPembelajaranPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="Tujuan Pembelajaran"
          description="Jelaskan tujuan dan kompetensi yang akan dicapai siswa dalam bab ini."
        />
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
                <CardTitle>Tujuan Pembelajaran Bab 1</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  Pada bab ini, kalian akan mempelajari bagaimana mengevaluasi gagasan dan pandangan teks deskripsi, serta menuliskan gagasan dan pandangan dalam teks deskripsi.
                </p>
                <div className="mt-4">
                  <h3 className="font-semibold">Kata Kunci:</h3>
                  <ul className="list-disc pl-5">
                    <li>teks deskripsi</li>
                    <li>gagasan</li>
                    <li>pandangan</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
