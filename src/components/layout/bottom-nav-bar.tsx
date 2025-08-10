
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function BottomNavBar({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 z-40 w-full border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-3 items-center justify-center px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
            >
              <item.icon
                className={cn('h-6 w-6', isActive && 'text-primary')}
              />
              <span className={cn('text-xs', isActive && 'text-primary font-semibold')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
