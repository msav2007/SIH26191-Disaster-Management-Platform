import type { HTMLAttributes } from 'react';

import type { SemanticTone } from '@/types/domain';
import { cn } from '@/lib/utils/cn';

export interface MetricBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  tone?: SemanticTone;
  label?: string;
  showValue?: boolean;
}

const toneStyles: Record<SemanticTone, string> = {
  critical: 'bg-[var(--critical)]',
  high: 'bg-[var(--high)]',
  moderate: 'bg-[var(--moderate)]',
  safe: 'bg-[var(--safe)]',
  info: 'bg-[var(--info)]',
  neutral: 'bg-[var(--neutral)]',
};

export function MetricBar({
  className,
  label,
  max = 100,
  showValue = false,
  tone = 'info',
  value,
  ...props
}: MetricBarProps) {
  const percentage = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  const fillStyle = toneStyles[tone];

  return (
    <div className={cn('space-y-1', className)} {...props}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-[11px]">
          {label && <span className="text-[var(--text-muted)]">{label}</span>}
          {showValue && <span className="tabnum font-semibold text-[var(--text)]">{percentage}%</span>}
        </div>
      )}
      <div
        aria-label={label ?? 'Metric progress'}
        aria-valuemax={max}
        aria-valuemin={0}
        aria-valuenow={value}
        className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]"
        role="progressbar"
      >
        <div
          className={cn('h-full transition-all duration-300', fillStyle)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
