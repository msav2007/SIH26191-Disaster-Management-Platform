'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { NavigationGroup, NavigationItem } from '@/types/navigation';
import { cn } from '@/lib/utils/cn';
import {
  DashboardIcon,
  ShieldAlertIcon,
  AlertTriangleIcon,
  SlidersIcon,
  BuildingIcon,
  MapPinIcon,
  FileTextIcon,
  SettingsIcon,
} from '@/components/ui/icons';

function getNavIcon(href: string) {
  if (href.startsWith('/dashboard')) return <DashboardIcon className="size-4 shrink-0" />;
  if (href === '/habitations') return <ShieldAlertIcon className="size-4 shrink-0" />;
  if (href.includes('filter=critical')) return <AlertTriangleIcon className="size-4 shrink-0 text-red-400" />;
  if (href.startsWith('/scenarios')) return <SlidersIcon className="size-4 shrink-0" />;
  if (href.startsWith('/relocation')) return <BuildingIcon className="size-4 shrink-0" />;
  if (href.startsWith('/map')) return <MapPinIcon className="size-4 shrink-0" />;
  if (href.startsWith('/reports')) return <FileTextIcon className="size-4 shrink-0" />;
  if (href.startsWith('/admin')) return <SettingsIcon className="size-4 shrink-0" />;
  return <DashboardIcon className="size-4 shrink-0" />;
}

export function SidebarNav({
  groups,
  items,
  onNavigate,
}: {
  groups?: NavigationGroup[];
  items?: NavigationItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const renderedGroups: NavigationGroup[] = groups ?? [
    {
      title: 'NAVIGATION',
      items: items ?? [],
    },
  ];

  return (
    <nav aria-label="Primary" className="space-y-6 px-3 pb-6">
      {renderedGroups.map((group) => (
        <div key={group.title} className="space-y-1.5">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {group.title}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const isExactMatch = pathname === item.href;
              const isBaseMatch =
                item.href !== '/dashboard' &&
                !item.href.includes('?') &&
                pathname.startsWith(item.href);
              const isActive = isExactMatch || isBaseMatch;

              return (
                <li key={item.href}>
                  <Link
                    className={cn(
                      'group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all',
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white',
                    )}
                    href={item.href}
                    onClick={() => onNavigate?.()}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'transition-colors',
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-slate-200',
                        )}
                      >
                        {getNavIcon(item.href)}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-[9px] font-bold',
                          isActive
                            ? 'bg-blue-700 text-white'
                            : 'bg-slate-800 text-blue-300 ring-1 ring-blue-500/20',
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
