import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PertanyaanPemantikPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <TeacherHeader
          title="Pertanyaan Pemantik"
          description="Tulis pertanyaan yang memancing pemikiran kritis siswa sebelum memulai bab."
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
                <CardTitle>Daftar Pertanyaan</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Bagaimana cara kalian menggambarkan suatu objek agar orang yang menyimak atau membaca merasa melihat, mendengar, mengalami, atau merasakan?</li>
                  <li>Bagaimana cara mengukur ketepatan teks deskprisi?</li>
                  <li>Untuk apa teks deskripsi dibuat?</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
