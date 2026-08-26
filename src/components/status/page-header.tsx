import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';

export function PageHeader({
  actions,
  badge,
  description,
  title,
}: {
  actions?: ReactNode;
  badge?: string;
  description: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        {badge ? <Badge variant="outline">{badge}</Badge> : null}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">{title}</h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--text-muted)]">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

