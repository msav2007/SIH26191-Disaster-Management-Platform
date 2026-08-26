import type { DialogHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

export function Dialog({ className, ...props }: DialogHTMLAttributes<HTMLDialogElement>) {
  return (
    <dialog
      className={cn(
        'rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--text)] shadow-[var(--shadow-soft)] backdrop:bg-slate-900/40',
        className,
      )}
      {...props}
    />
  );
}

