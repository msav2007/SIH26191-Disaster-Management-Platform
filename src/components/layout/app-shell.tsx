import type { ReactNode } from 'react';

import { appNavigation } from '@/config/app/navigation';
import { siteConfig } from '@/config/app/site';
import { Badge } from '@/components/ui/badge';
import { AppLogo } from '@/components/layout/app-logo';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { GlobalSearch } from '@/components/layout/global-search';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent text-[var(--text)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_1fr]">
        {/* Left Sidebar Navigation */}
        <aside className="border-b border-slate-800 bg-[var(--surface-strong)] lg:border-b-0 lg:border-r">
          <div className="space-y-4 px-4 py-5 lg:px-5">
            <AppLogo />
            <div className="space-y-2 rounded-2xl border border-slate-700 bg-slate-950/30 p-3.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <Badge variant="teal">{siteConfig.phaseLabel}</Badge>
                <span className="font-mono text-[9px] text-slate-400">v2.0</span>
              </div>
              <p className="leading-5 text-slate-400">
                Deterministic GIS multi-hazard decision-support & relocation planning platform.
              </p>
            </div>
          </div>
          <SidebarNav items={appNavigation} />
        </aside>

        {/* Main Content Surface */}
        <div className="flex min-h-screen flex-col">
          {/* Global Header */}
          <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1 max-w-md">
                <GlobalSearch />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-xs border border-[var(--safe-border)] bg-[var(--safe-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--safe)]">
                  DEMO AUTHORITY SESSION (SDMA Admin)
                </span>
                <span className="rounded-xs border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-muted)]">
                  DEMO / SEEDED DATA
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
