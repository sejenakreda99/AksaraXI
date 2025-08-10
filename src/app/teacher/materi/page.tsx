import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, PlusCircle } from "lucide-react";

const chapters = [
  {
    title: "Bab 1: Teks Deskripsi",
    description: "Bertema Keindahan Alam Indonesia",
    href: "/teacher/materi/bab-1",
    icon: BookOpen,
    disabled: false,
  },
   {
    title: "Bab 2",
    description: "Segera Hadir",
    href: "#",
    icon: BookOpen,
    disabled: true,
  }
];

export default function MateriPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full bg-slate-50">
        <TeacherHeader
          title="Materi Pembelajaran"
          description="Kelola bab dan materi pembelajaran untuk siswa."
        />
        <main className="flex-1 p-4 md:p-6">
           <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((chapter) => (
              <Link href={chapter.href} key={chapter.title} className={`flex ${chapter.disabled ? "pointer-events-none" : ""}`}>
                <Card className={`w-full aspect-square flex flex-col items-center justify-center p-4 rounded-xl shadow-md ${chapter.disabled ? "bg-slate-100/50 opacity-50" : "hover:bg-slate-100 transition-colors"}`}>
                   <chapter.icon className="w-12 h-12 text-primary mb-2" />
                   <p className="font-semibold text-center text-sm">{chapter.title}</p>
                   <p className="text-xs text-muted-foreground text-center mt-1">{chapter.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
