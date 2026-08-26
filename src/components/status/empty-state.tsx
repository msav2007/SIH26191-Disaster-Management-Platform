import type { ReactNode } from 'react';

import { Card } from '@/components/ui/card';

export function EmptyState({
  children,
  description,
  title,
}: {
  children?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Card className="space-y-4 p-8 text-center">
      <h2 className="text-2xl font-semibold text-[var(--text)]">{title}</h2>
      <p className="mx-auto max-w-2xl text-sm leading-7 text-[var(--text-muted)]">{description}</p>
      {children}
    </Card>
  );
}

