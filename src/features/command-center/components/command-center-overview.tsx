import Link from 'next/link';

import { siteConfig } from '@/config/app/site';
import { PageHeader } from '@/components/status/page-header';
import { StatusIndicator } from '@/components/status/status-indicator';
import { buttonStyles } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getAiProviderStatus } from '@/server/ai/provider-registry';

const foundationChecks = [
  'Validated environment module with strict server/client boundaries',
  'Next.js App Router shell and production build pipeline',
  'Drizzle + PostgreSQL/PostGIS-ready database connection and schema foundation',
  'Health endpoint, logging abstraction, and testing setup',
];

export function CommandCenterOverview() {
  const aiStatus = getAiProviderStatus();

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Link className={buttonStyles({ variant: 'primary' })} href="/api/health">
              Open health endpoint
            </Link>
            <Link className={buttonStyles({ variant: 'secondary' })} href="/admin">
              Review admin foundation
            </Link>
          </>
        }
        badge={siteConfig.phaseLabel}
        description="The command center currently exposes the trustworthy application baseline: routing, environment safety, database groundwork, and a disciplined product shell."
        title="Command Center"
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-5 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-[var(--text)]">Phase 0 verification scope</h2>
            <StatusIndicator label="Foundation active" tone="healthy" />
          </div>
          <ul className="space-y-3 text-sm leading-6 text-[var(--text-muted)]">
            {foundationChecks.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-5 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-[var(--text)]">Deferred by design</h2>
            <StatusIndicator label="Honest placeholder" tone="planned" />
          </div>
          <div className="space-y-4 text-sm leading-6 text-[var(--text-muted)]">
            <p>
              GIS analysis, risk scoring, relocation prioritization, carrying-capacity
              calculations, and AI decision support remain intentionally unimplemented at
              this stage.
            </p>
            <p>
              AI provider status: <strong className="text-[var(--text)]">{aiStatus.provider}</strong>{' '}
              ({aiStatus.status}).
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

