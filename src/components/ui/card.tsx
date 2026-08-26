import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]',
        className,
      )}
      {...props}
    />
  );
}

