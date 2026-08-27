import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

type BadgeVariant =
  | 'amber'
  | 'critical'
  | 'high'
  | 'info'
  | 'moderate'
  | 'outline'
  | 'safe'
  | 'teal';

const variantClasses: Record<BadgeVariant, string> = {
  amber: 'border-amber-200 bg-amber-50 text-[var(--high)]',
  critical: 'border-[var(--critical-border)] bg-[var(--critical-soft)] text-[var(--critical)]',
  high: 'border-[var(--high-border)] bg-[var(--high-soft)] text-[var(--high)]',
  moderate: 'border-[var(--moderate-border)] bg-[var(--moderate-soft)] text-[var(--moderate)]',
  safe: 'border-[var(--safe-border)] bg-[var(--safe-soft)] text-[var(--safe)]',
  info: 'border-[var(--info-border)] bg-[var(--info-soft)] text-[var(--info)]',
  outline: 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]',
  teal: 'border-teal-200 bg-teal-50 text-[var(--accent-strong)]',
};

export function Badge({
  children,
  className,
  variant = 'outline',
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
