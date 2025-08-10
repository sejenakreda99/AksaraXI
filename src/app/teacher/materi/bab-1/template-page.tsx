'use client';

import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type TemplatePageProps = {
  title: string;
  description: string;
};

export default function TemplatePage({ title, description }: TemplatePageProps) {
    return (
        <AuthenticatedLayout>
            <div className="flex flex-col h-full">
                <TeacherHeader
                    title={title}
                    description={description}
                />
                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <Button asChild variant="outline">
                                <Link href="/teacher/materi/bab-1">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali ke Struktur Bab
                                </Link>
                            </Button>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Konten Belum Tersedia</CardTitle>
                                <CardDescription>Fitur ini sedang dalam pengembangan.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Halaman untuk mengelola &quot;{title}&quot; akan segera tersedia. Terima kasih atas kesabaran Anda.</p>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
