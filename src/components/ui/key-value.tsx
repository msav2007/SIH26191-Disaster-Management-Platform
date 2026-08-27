import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

export interface KeyValueProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  mono?: boolean;
}

export function KeyValue({ className, label, mono = false, value, ...props }: KeyValueProps) {
  return (
    <div
      className={cn('flex items-baseline justify-between border-b border-[var(--border)] py-1.5 text-xs last:border-b-0', className)}
      {...props}
    >
      <dt className="text-[var(--text-muted)]">{label}</dt>
      <dd className={cn('font-semibold text-[var(--text)]', mono && 'tabnum font-mono')}>{value}</dd>
    </div>
  );
}
