'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function ErrorState({
  actionLabel,
  message,
  onAction,
  title,
}: {
  actionLabel?: string;
  message: string;
  onAction?: () => void;
  title: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="max-w-2xl space-y-4 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--danger)]">
          Error State
        </p>
        <h1 className="text-3xl font-semibold text-[var(--text)]">{title}</h1>
        <p className="text-sm leading-7 text-[var(--text-muted)]">{message}</p>
        {onAction && actionLabel ? <Button onClick={onAction}>{actionLabel}</Button> : null}
      </Card>
    </div>
  );
}

