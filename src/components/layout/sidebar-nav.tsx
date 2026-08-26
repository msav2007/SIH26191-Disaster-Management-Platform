'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { NavigationItem } from '@/types/navigation';
import { cn } from '@/lib/utils/cn';

export function SidebarNav({ items }: { items: NavigationItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="overflow-x-auto px-4 pb-4 lg:px-6 lg:pb-6">
      <ul className="flex gap-3 lg:flex-col">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.href} className="min-w-[210px] lg:min-w-0">
              <Link
                className={cn(
                  'flex h-full flex-col gap-1 rounded-2xl border px-4 py-3 transition-colors',
                  isActive
                    ? 'border-slate-200 bg-slate-100/10 text-white'
                    : 'border-slate-700 bg-slate-900/10 text-slate-300 hover:border-slate-500 hover:text-white',
                )}
                href={item.href}
              >
                <span className="text-sm font-semibold">{item.label}</span>
                <span className="text-xs leading-5 text-slate-400">{item.description}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

