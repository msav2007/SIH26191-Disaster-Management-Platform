import type { HTMLAttributes, TableHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

export function TableWrapper({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]',
        className,
      )}
      {...props}
    />
  );
}

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn('min-w-full border-collapse text-left text-sm', className)} {...props} />;
}

