import AuthenticatedLayout from "@/app/(authenticated)/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ChapterPage({ params }: { params: { slug: string } }) {
  const title = params.slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <header className="bg-card border-b p-4 md:p-6">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-1">Bab 1: Membicarakan Teks Deskripsi</p>
        </header>
        <main className="flex-1 p-4 md:p-8">
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
                  Kerangka untuk halaman ini telah berhasil dibuat. Anda dapat mulai menambahkan materi pembelajaran, video, kuis interaktif, dan aktivitas kelompok di sini.
                </p>
                <p>
                  Sebagai contoh, untuk bagian <strong>Menyimak Teks Deskripsi</strong>, Anda bisa menyematkan pemutar audio atau video. Untuk bagian <strong>Menulis</strong>, bisa disediakan editor teks sederhana. Untuk <strong>Asesmen</strong>, bisa dibuat formulir kuis.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthenticatedLayout>
  )
}
