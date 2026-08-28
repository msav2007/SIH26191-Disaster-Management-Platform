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
                Smart India Hackathon 2026 · Disaster Management
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
                Production Decision-Support System for Multi-Hazard Relocation.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[var(--text-muted)]">
                An authoritative, GIS-enabled multi-criteria decision platform for State Disaster Management Authorities. Evaluates deterministic settlement vulnerability, calculates 10-dimension site carrying capacity, runs climate stress simulations, and generates statutory resettlement orders.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className={buttonStyles({ variant: 'primary' })} href="/dashboard">
                Open Command Center
              </Link>
              <Link className={buttonStyles({ variant: 'secondary' })} href="/login">
                Role Login Entry
              </Link>
            </div>
          </Card>

          <Card className="space-y-4 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              Official SIH Scope & Core Capabilities
            </p>
            <ul className="space-y-3 text-sm leading-6 text-[var(--text-muted)]">
              {officialRequirements.map((requirement) => (
                <li
                  key={requirement}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 font-medium text-slate-800"
                >
                  {requirement}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-3 p-6">
            <h2 className="text-xl font-semibold text-[var(--text)]">Deterministic Risk Engine</h2>
            <p className="text-sm leading-6 text-[var(--text-muted)]">
              Strict 35/25/20/10/10 multi-criteria weighting across hazard intensity, demographic vulnerability, disaster history, exposure, and infrastructure disruption with statutory red zone priority overrides.
            </p>
          </Card>
          <Card className="space-y-3 p-6">
            <h2 className="text-xl font-semibold text-[var(--text)]">Carrying Capacity Allocation</h2>
            <p className="text-sm leading-6 text-[var(--text-muted)]">
              10-dimension geotechnical and infrastructure bottleneck analysis with a mandatory 15% safety buffer to prevent secondary disaster creation at resettlement sectors.
            </p>
          </Card>
          <Card className="space-y-3 p-6">
            <h2 className="text-xl font-semibold text-[var(--text)]">Statutory Authority Governance</h2>
            <p className="text-sm leading-6 text-[var(--text-muted)]">
              Role-based command profiles, GIS spatial vector inspections (EPSG:4326), climate stress scenario simulations, and machine-readable statutory report exports under DMA 2005.
            </p>
          </Card>
        </section>
      </div>
    </main>
  );
}

