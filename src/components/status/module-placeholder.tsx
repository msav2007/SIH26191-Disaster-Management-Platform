import type { ReactNode } from 'react';

import { PageHeader } from '@/components/status/page-header';
import { StatusIndicator } from '@/components/status/status-indicator';
import { Card } from '@/components/ui/card';

export function ModulePlaceholder({
  actions,
  currentScope,
  deliveryPhase,
  description,
  nextMilestones,
  responsibilities,
  title,
}: {
  actions?: ReactNode;
  currentScope: string;
  deliveryPhase: string;
  description: string;
  nextMilestones: string[];
  responsibilities: string[];
  title: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        actions={actions}
        badge={deliveryPhase}
        description={description}
        title={title}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-[var(--text)]">Current Responsibility</h2>
            <StatusIndicator label="Foundation only" tone="planned" />
          </div>
          <p className="text-sm leading-7 text-[var(--text-muted)]">{currentScope}</p>
          <ul className="space-y-3 text-sm leading-6 text-[var(--text-muted)]">
            {responsibilities.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-xl font-semibold text-[var(--text)]">Next Milestones</h2>
          <ul className="space-y-3 text-sm leading-6 text-[var(--text-muted)]">
            {nextMilestones.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

