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
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  critical: 'border-red-200 bg-red-50 text-red-800',
  high: 'border-amber-200 bg-amber-50 text-amber-800',
  moderate: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  safe: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  outline: 'border-slate-200 bg-slate-50 text-slate-700',
  teal: 'border-blue-200 bg-blue-50 text-blue-800',
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
