import type { ReactNode } from 'react';
import Link from 'next/link';

import { navigationGroups } from '@/config/app/navigation';
import { AppLogo } from '@/components/layout/app-logo';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { GlobalSearch } from '@/components/layout/global-search';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
      <div className="mx-auto grid min-h-screen max-w-[1680px] lg:grid-cols-[260px_1fr]">
        {/* Left Deep Navy Sidebar */}
        <aside className="border-b border-[var(--border-sidebar)] bg-[var(--surface-sidebar)] text-slate-200 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="flex flex-col justify-between h-full">
            <div>
              {/* Header Logo */}
              <div className="border-b border-[var(--border-sidebar)]/60 px-5 py-5">
                <AppLogo />
              </div>

              {/* Navigation Menu */}
              <div className="pt-5">
                <SidebarNav groups={navigationGroups} />
              </div>
            </div>

            {/* Bottom Status & Session Card */}
            <div className="p-3 border-t border-[var(--border-sidebar)]/60 space-y-2">
              <div className="rounded-xl border border-[var(--border-sidebar)] bg-slate-950/40 p-3 text-[11px] text-slate-400">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">Statutory Authority</span>
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-400 leading-relaxed">
                  SDMA Command Decision Engine v2.0
                </p>
              </div>

              <div className="flex items-center justify-between px-2 text-[11px]">
                <span className="text-slate-400 font-medium">Officer: SDMA Admin</span>
                <Link
                  className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                  href="/login"
                >
                  Switch Role / Exit →
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Workspace Surface */}
        <div className="flex min-h-screen flex-col bg-[var(--bg)]">
          {/* Top Glass Header */}
          <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1 max-w-md">
                <GlobalSearch />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                  <span className="size-1.5 rounded-full bg-emerald-600" />
                  SDMA Command Session Active
                </div>
                <span className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-[10px] font-medium text-slate-600">
                  WGS84 EPSG:4326
                </span>
              </div>
            </div>
          </header>

          {/* Main Content Container */}
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
