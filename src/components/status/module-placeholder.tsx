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
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Current Responsibility</h2>
            <StatusIndicator label="Foundation only" tone="planned" />
          </div>
          <p className="text-xs leading-relaxed text-slate-600">{currentScope}</p>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {responsibilities.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Next Milestones</h2>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {nextMilestones.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-dashed border-slate-300 bg-slate-50/30 px-4 py-3"
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
