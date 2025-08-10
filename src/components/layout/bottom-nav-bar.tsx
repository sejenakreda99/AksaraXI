
'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, PanelLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function BottomNavBar({ homeHref }: { homeHref: string }) {
  const { setOpenMobile } = useSidebar();
  const router = useRouter();

  return (
    <footer className="fixed bottom-0 z-40 w-full border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-3 items-center justify-center px-4">
        <div className="flex justify-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Kembali</span>
          </Button>
        </div>
        <div className="flex justify-center">
          <Button variant="ghost" size="icon" asChild>
            <Link href={homeHref}>
              <Home className="h-6 w-6" />
              <span className="sr-only">Beranda</span>
            </Link>
          </Button>
        </div>
        <div className="flex justify-center">
          <Button variant="ghost" size="icon" onClick={() => setOpenMobile(true)}>
            <PanelLeft className="h-6 w-6" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>
    </footer>
  );
}
