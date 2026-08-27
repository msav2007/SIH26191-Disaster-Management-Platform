import type { HTMLAttributes } from 'react';

import type { DataProvenance } from '@/types/domain';
import { cn } from '@/lib/utils/cn';

export interface ProvenanceTagProps extends HTMLAttributes<HTMLSpanElement> {
  value: DataProvenance | string;
}

export function ProvenanceTag({ className, value, ...props }: ProvenanceTagProps) {
  const isLive = value === 'LIVE CONNECTED';
  const isRequired = value === 'DATA SOURCE REQUIRED';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        isLive
          ? 'border-[var(--safe-border)] bg-[var(--safe-soft)] text-[var(--safe)]'
          : isRequired
            ? 'border-[var(--critical-border)] bg-[var(--critical-soft)] text-[var(--critical)]'
            : 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-1.5 rounded-full',
          isLive ? 'bg-[var(--safe)]' : isRequired ? 'bg-[var(--critical)]' : 'bg-[var(--text-muted)]',
        )}
      />
      {value}
    </span>
  );
}
