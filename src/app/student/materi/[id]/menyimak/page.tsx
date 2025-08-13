
'use client';

import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, BrainCircuit, Bot, Target } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const activities = [
    {
        href: "tujuan",
        title: "Tujuan Pembelajaran",
        description: "Pahami apa yang akan Anda capai di bagian ini.",
        icon: Target,
        unlocked: true,
    },
    {
        href: "kegiatan-1",
        title: "Kegiatan 1: Menganalisis Video",
        description: "Simak video Candi Borobudur dan analisis isinya.",
        icon: BookOpen,
        unlocked: true,
    },
    {
        href: "kegiatan-2",
        title: "Kegiatan 2: Membandingkan Gagasan",
        description: "Evaluasi dan bandingkan gagasan dari dua video berbeda.",
        icon: BrainCircuit,
        unlocked: true,
    },
    {
        href: "latihan",
        title: "Latihan Mandiri & Umpan Balik AI",
        description: "Uji pemahaman Anda dan dapatkan masukan dari AI.",
        icon: Bot,
        unlocked: true,
    }
];

export default function MenyimakAdventureMapPage() {
    const params = useParams();
    const chapterId = params.id as string;

    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-full bg-slate-50">
                <header className="bg-background border-b p-4 sm:p-6">
                    <div className="max-w-4xl mx-auto">
                        <Button asChild variant="outline" size="sm" className="mb-4">
                            <Link href={`/student/materi/${chapterId}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Peta Petualangan Bab
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold text-foreground">A. Menyimak Teks Deskripsi</h1>
                        <p className="text-muted-foreground mt-1">Pilih salah satu kegiatan untuk memulai petualangan menyimak Anda!</p>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {activities.map((activity) => {
                                const Icon = activity.icon;
                                return (
                                <Link href={`/student/materi/${chapterId}/menyimak/${activity.href}`} key={activity.title}>
                                    <Card className="hover:bg-primary/5 h-full transition-colors">
                                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                            <div className="bg-primary/10 p-3 rounded-full">
                                                <Icon className="w-6 h-6 text-primary" />
                                            </div>
                                            <CardTitle>{activity.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
