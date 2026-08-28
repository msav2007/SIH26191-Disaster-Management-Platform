'use client';

import { type ReactNode, useState } from 'react';
import Link from 'next/link';

import { navigationGroups } from '@/config/app/navigation';
import { AppLogo } from '@/components/layout/app-logo';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { GlobalSearch } from '@/components/layout/global-search';
import { useActiveRole } from '@/lib/auth/session';
import { CloseIcon, SlidersIcon } from '@/components/ui/icons';

export function AppShell({ children }: { children: ReactNode }) {
  const activeRole = useActiveRole();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
      <div className="mx-auto grid min-h-screen max-w-[1680px] lg:grid-cols-[260px_1fr]">
        {/* Desktop Left Deep Navy Sidebar */}
        <aside className="hidden border-b border-[var(--border-sidebar)] bg-[var(--surface-sidebar)] text-slate-200 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:overflow-y-auto lg:border-b-0 lg:border-r">
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
                <span className="font-semibold">{activeRole.title}</span>
                <span className="inline-flex items-center gap-1 font-mono text-[9px] text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400 leading-relaxed font-mono">
                {activeRole.jurisdiction}
              </p>
            </div>

            <div className="flex items-center justify-between px-2 text-[11px]">
              <span className="text-slate-300 font-medium truncate max-w-[140px]">
                Officer: {activeRole.title}
              </span>
              <Link
                className="font-semibold text-blue-400 hover:text-blue-300 hover:underline shrink-0"
                href="/login"
              >
                Switch Role →
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-Over Drawer & Backdrop */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              aria-hidden="true"
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileNavOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col justify-between bg-[var(--surface-sidebar)] text-slate-200 shadow-2xl">
              <div className="overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[var(--border-sidebar)]/60 px-5 py-4">
                  <AppLogo />
                  <button
                    aria-label="Close navigation menu"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                    onClick={() => setMobileNavOpen(false)}
                    type="button"
                  >
                    <CloseIcon className="size-5" />
                  </button>
                </div>

                <div className="pt-4">
                  <SidebarNav
                    groups={navigationGroups}
                    onNavigate={() => setMobileNavOpen(false)}
                  />
                </div>
              </div>

              {/* Bottom Session in Drawer */}
              <div className="p-3 border-t border-[var(--border-sidebar)]/60 space-y-2">
                <div className="rounded-xl border border-[var(--border-sidebar)] bg-slate-950/40 p-3 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold">{activeRole.title}</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[9px] text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400 font-mono">
                    {activeRole.jurisdiction}
                  </p>
                </div>

                <div className="flex items-center justify-between px-2 text-[11px]">
                  <span className="text-slate-300 font-medium">Officer: {activeRole.title}</span>
                  <Link
                    className="font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                    href="/login"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    Switch Role →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Workspace Surface */}
        <div className="flex min-h-screen flex-col bg-[var(--bg)]">
          {/* Top Glass Header */}
          <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Toggle Button */}
                <button
                  aria-label="Open navigation menu"
                  className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 lg:hidden shadow-xs"
                  onClick={() => setMobileNavOpen(true)}
                  type="button"
                >
                  <SlidersIcon className="size-4.5 text-slate-700" />
                </button>

                <div className="flex-1 max-w-md">
                  <GlobalSearch />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                  <span className="size-1.5 rounded-full bg-emerald-600" />
                  {activeRole.shortTitle} Active
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
