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
        'flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm',
        tone === 'critical' ? 'border-red-200 bg-red-50/20' : '',
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="my-2.5 flex items-baseline gap-1.5">
        <span className="tabnum text-2xl font-black tracking-tight text-slate-900">{value}</span>
        {unit && <span className="text-xs text-slate-500 font-medium">{unit}</span>}
      </div>

      <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
        {status && (
          <div className="flex items-center gap-1.5">
            <StatusPill dot tone={tone}>
              {status}
            </StatusPill>
          </div>
        )}
        {context && <p className="text-[11px] text-slate-500 line-clamp-1">{context}</p>}
      </div>
    </div>
  );
}
