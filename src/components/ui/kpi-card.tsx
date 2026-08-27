import type { HTMLAttributes, ReactNode } from 'react';

import type { SemanticTone } from '@/types/domain';
import { cn } from '@/lib/utils/cn';
import { StatusPill } from '@/components/ui/status-pill';

export interface KpiCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  unit?: string;
  status?: string;
  context?: string;
  tone?: SemanticTone;
  icon?: ReactNode;
}

export function KpiCard({
  className,
  context,
  icon,
  label,
  status,
  tone = 'neutral',
  unit,
  value,
  ...props
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col justify-between rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-subtle)]',
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="label-xs">{label}</p>
        {icon && <div className="text-[var(--text-muted)]">{icon}</div>}
      </div>

      <div className="my-2 flex items-baseline gap-1.5">
        <span className="tabnum text-2xl font-bold tracking-tight text-[var(--text)]">{value}</span>
        {unit && <span className="text-xs text-[var(--text-muted)]">{unit}</span>}
      </div>

      <div className="space-y-1 border-t border-[var(--border)] pt-2">
        {status && (
          <div className="flex items-center gap-1.5">
            <StatusPill dot tone={tone}>
              {status}
            </StatusPill>
          </div>
        )}
        {context && <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">{context}</p>}
      </div>
    </div>
  );
}
