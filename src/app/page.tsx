import Link from 'next/link';

import { siteConfig } from '@/config/app/site';
import { Badge } from '@/components/ui/badge';
import { buttonStyles } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const officialRequirements = [
  'Identify and update multi-hazard Red Zones.',
  'Assess carrying capacity of safer relocation sites.',
  'Prioritize vulnerable habitations by relocation urgency.',
  'Integrate hazard intensity, vulnerability, and disaster history.',
];

export default function HomePage() {
  return (
    <main className="surface-grid min-h-screen px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="teal">{siteConfig.problemCode}</Badge>
          <Badge variant="outline">{siteConfig.phaseLabel}</Badge>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <Card className="space-y-6 p-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                Smart India Hackathon 2026
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
                Production-grade foundation for an authority-facing disaster relocation
                decision platform.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[var(--text-muted)]">
                This repository now contains the validated project baseline for the
                SIH26191 web platform. Phase 0 focuses on infrastructure, discipline, and
                honest product surfaces rather than fake analytics.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className={buttonStyles({ variant: 'primary' })} href="/dashboard">
                Open Command Center
              </Link>
              <Link className={buttonStyles({ variant: 'secondary' })} href="/login">
                Open Login Entry
              </Link>
            </div>
          </Card>

          <Card className="space-y-4 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              Official SIH Scope
            </p>
            <ul className="space-y-3 text-sm leading-6 text-[var(--text-muted)]">
              {officialRequirements.map((requirement) => (
                <li
                  key={requirement}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3"
                >
                  {requirement}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-3 p-6">
            <h2 className="text-xl font-semibold text-[var(--text)]">What exists now</h2>
            <p className="text-sm leading-6 text-[var(--text-muted)]">
              Next.js App Router, strict TypeScript, Tailwind, validated environment
              handling, Drizzle/PostGIS groundwork, shared UI primitives, health checks,
              tests, and developer documentation.
            </p>
          </Card>
          <Card className="space-y-3 p-6">
            <h2 className="text-xl font-semibold text-[var(--text)]">What does not</h2>
            <p className="text-sm leading-6 text-[var(--text-muted)]">
              No fake GIS analytics, no invented risk scores, no fabricated relocation
              recommendations, and no decorative AI layer claiming unavailable facts.
            </p>
          </Card>
          <Card className="space-y-3 p-6">
            <h2 className="text-xl font-semibold text-[var(--text)]">Where we go next</h2>
            <p className="text-sm leading-6 text-[var(--text-muted)]">
              The immediate follow-up phase should turn this shell into a working
              application spine with seeded database content and real map/data surfaces.
            </p>
          </Card>
        </section>
      </div>
    </main>
  );
}

