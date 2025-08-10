
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

export type NavItem = {
  href?: string;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
};

export function BottomNavBar({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 z-40 w-full border-t bg-background md:hidden">
      <div className={`grid h-16 grid-cols-${navItems.length} items-center justify-center px-4`}>
        {navItems.map((item) => {
          const isActive = item.href ? pathname === item.href : false;
          
          if (item.onClick) {
            return (
              <Button
                key={item.label}
                variant="ghost"
                onClick={item.onClick}
                className="flex h-full flex-col items-center justify-center gap-1 rounded-none text-muted-foreground"
              >
                <item.icon
                  className={cn('h-6 w-6')}
                />
                <span className={cn('text-xs')}>
                  {item.label}
                </span>
              </Button>
            )
          }

          if (!item.href) {
            return null;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground h-full"
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
