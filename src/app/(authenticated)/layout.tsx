
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, User, BookCopy, LogOut, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";


const studentNavItems = [
  { href: "/student", label: "Beranda", icon: Home },
  { href: "/student/materi", label: "Materi", icon: BookCopy },
  { href: "/student/profil", label: "Profil", icon: User },
];

const teacherNavItems = [
    { href: "/dashboard", label: "Dasbor", icon: Home },
    { href: "/teacher/students", label: "Siswa", icon: Users },
    { href: "/teacher/materi", label: "Materi", icon: BookCopy },
]

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Berhasil Keluar",
        description: "Anda telah berhasil keluar dari aplikasi.",
      });
      router.push("/");
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Gagal Keluar",
        description: "Terjadi kesalahan saat mencoba keluar.",
      });
    }
  };
  
  const isTeacher = pathname.startsWith('/dashboard') || pathname.startsWith('/teacher');
  const navItems = isTeacher ? teacherNavItems : studentNavItems;
  const userDisplayName = isTeacher ? "Guru" : "Siswa";
  const userEmail = auth.currentUser?.email || "pengguna@email.com";


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Avatar>
                <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="avatar" />
                <AvatarFallback>{userDisplayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold">{userDisplayName}</span>
              <span className="text-xs text-muted-foreground">{userEmail}</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
            <span>Keluar</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="pb-16 md:pb-0">{children}</SidebarInset>
      <BottomNavBar navItems={navItems} />
    </SidebarProvider>
  );
}
