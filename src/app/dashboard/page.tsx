import Link from 'next/link';
import { Users, BarChart } from 'lucide-react';
import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { Card } from '@/components/ui/card';

const menuItems = [
    {
        title: "Manajemen Kelompok",
        icon: Users,
        href: "/teacher/students",
        description: "Tambah atau lihat daftar kelompok."
    },
    {
        title: "Pantau Kemajuan",
        icon: BarChart,
        href: "#",
        description: "Lihat laporan kemajuan belajar siswa.",
        disabled: true
    }
]

export default function DashboardPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full bg-slate-50">
         <header className="p-6 text-center bg-background border-b">
            <h1 className="text-xl font-bold uppercase text-foreground">
              Portal Guru
            </h1>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="grid grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <Link href={item.href} key={item.title} className={`flex ${item.disabled ? "pointer-events-none" : ""}`}>
                <Card className={`w-full aspect-square flex flex-col items-center justify-center p-4 rounded-xl shadow-md ${item.disabled ? "bg-slate-100/50 opacity-50" : "hover:bg-slate-100 transition-colors"}`}>
                   <div className="p-3 bg-primary/10 rounded-full mb-3">
                      <item.icon className="w-8 h-8 text-primary" />
                   </div>
                   <p className="font-semibold text-center text-sm">{item.title}</p>
                   <p className="text-xs text-muted-foreground text-center mt-1">{item.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
