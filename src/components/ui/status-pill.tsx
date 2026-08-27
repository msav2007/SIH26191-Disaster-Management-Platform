import type { HTMLAttributes } from 'react';

import type { SemanticTone } from '@/types/domain';
import { cn } from '@/lib/utils/cn';

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: SemanticTone;
  dot?: boolean;
}

const toneStyles: Record<SemanticTone, { pill: string; dot: string }> = {
  critical: {
    pill: 'bg-[var(--critical-soft)] text-[var(--critical)] border-[var(--critical-border)]',
    dot: 'bg-[var(--critical)]',
  },
  high: {
    pill: 'bg-[var(--high-soft)] text-[var(--high)] border-[var(--high-border)]',
    dot: 'bg-[var(--high)]',
  },
  moderate: {
    pill: 'bg-[var(--moderate-soft)] text-[var(--moderate)] border-[var(--moderate-border)]',
    dot: 'bg-[var(--moderate)]',
  },
  safe: {
    pill: 'bg-[var(--safe-soft)] text-[var(--safe)] border-[var(--safe-border)]',
    dot: 'bg-[var(--safe)]',
  },
  info: {
    pill: 'bg-[var(--info-soft)] text-[var(--info)] border-[var(--info-border)]',
    dot: 'bg-[var(--info)]',
  },
  neutral: {
    pill: 'bg-[var(--neutral-soft)] text-[var(--neutral)] border-[var(--neutral-border)]',
    dot: 'bg-[var(--neutral)]',
  },
};

export function StatusPill({
  children,
  className,
  dot = true,
  tone = 'neutral',
  ...props
}: StatusPillProps) {
  const styles = toneStyles[tone];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] font-semibold tracking-tight uppercase',
        styles.pill,
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('size-1.5 shrink-0 rounded-full', styles.dot)} aria-hidden="true" />}
      {children}
    </span>
  );
}
