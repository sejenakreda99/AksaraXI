import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">Selamat Datang!</CardTitle>
          <CardDescription>
            Anda telah berhasil masuk ke dasbor Aksara XI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center">
            Fitur pada halaman ini sedang dalam pengembangan.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
