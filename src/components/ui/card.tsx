import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white shadow-xs transition-all hover:border-slate-300 hover:shadow-sm',
        className,
      )}
      {...props}
    />
  );
}
