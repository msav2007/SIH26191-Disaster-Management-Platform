import type { ReactNode } from 'react';

import { appNavigation } from '@/config/app/navigation';
import { siteConfig } from '@/config/app/site';
import { Badge } from '@/components/ui/badge';
import { AppLogo } from '@/components/layout/app-logo';
import { SidebarNav } from '@/components/layout/sidebar-nav';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent text-[var(--text)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[300px_1fr]">
        <aside className="border-b border-slate-800 bg-[var(--surface-strong)] lg:border-b-0 lg:border-r">
          <div className="space-y-6 px-4 py-6 lg:px-6">
            <AppLogo />
            <div className="space-y-3 rounded-3xl border border-slate-700 bg-slate-950/20 p-4 text-sm text-slate-300">
              <Badge variant="teal">{siteConfig.phaseLabel}</Badge>
              <p className="leading-6">
                A clean application shell for the future GIS, risk, relocation, and
                reporting workflows.
              </p>
            </div>
          </div>
          <SidebarNav items={appNavigation} />
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-b border-[var(--border)] bg-white/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                  Disaster Relocation Command Center
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Honest placeholders now, deterministic decision support in later phases.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">No fake analytics</Badge>
                <Badge variant="outline">Server-safe env validation</Badge>
                <Badge variant="outline">PostGIS-ready foundation</Badge>
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

