import Link from 'next/link';

import { buttonStyles } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function NotFound() {
  return (
    <main className="surface-grid flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-xl space-y-4 p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
          Not Found
        </p>
        <h1 className="text-3xl font-semibold text-[var(--text)]">
          This route is not part of the Phase 0 foundation.
        </h1>
        <p className="text-base text-[var(--text-muted)]">
          The requested page does not exist yet or has moved outside the current module
          layout.
        </p>
        <Link className={buttonStyles({ variant: 'primary' })} href="/dashboard">
          Return to Command Center
        </Link>
      </Card>
    </main>
  );
}

