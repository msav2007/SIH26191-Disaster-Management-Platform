import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'amber' | 'outline' | 'teal';

const variantClasses: Record<BadgeVariant, string> = {
  amber:
    'border border-amber-200 bg-amber-50 text-[var(--warning)]',
  outline:
    'border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]',
  teal:
    'border border-teal-200 bg-teal-50 text-[var(--accent)]',
};

export function Badge({
  className,
  children,
  variant = 'outline',
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

