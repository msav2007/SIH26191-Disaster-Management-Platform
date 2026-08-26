import Link from 'next/link';

import { siteConfig } from '@/config/app/site';
import { EmptyState } from '@/components/status/empty-state';
import { buttonStyles } from '@/components/ui/button';

export function LoginPanel() {
  return (
    <EmptyState
      description="This route reserves the authentication entry point for the future Auth.js integration. Phase 0 intentionally stops at safe structure, environment handling, and role-oriented navigation preparation."
      title="Authentication foundation placeholder"
    >
      <div className="flex flex-wrap justify-center gap-3">
        <Link className={buttonStyles({ variant: 'primary' })} href="/dashboard">
          Continue to dashboard shell
        </Link>
        <span className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-sm text-[var(--text-muted)]">
          {siteConfig.phaseLabel}
        </span>
      </div>
    </EmptyState>
  );
}

