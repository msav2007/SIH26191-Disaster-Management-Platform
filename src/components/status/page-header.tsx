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
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white rounded-2xl p-5 shadow-xs lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        {badge ? <Badge variant="info">{badge}</Badge> : null}
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="max-w-3xl text-xs leading-relaxed text-slate-500">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
    </div>
  );
}

