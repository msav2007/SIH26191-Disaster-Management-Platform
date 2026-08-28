import type { HTMLAttributes } from 'react';

import type { SemanticTone } from '@/types/domain';
import { cn } from '@/lib/utils/cn';

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: SemanticTone;
  dot?: boolean;
}

const toneStyles: Record<SemanticTone, { pill: string; dot: string }> = {
  critical: {
    pill: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
  high: {
    pill: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  moderate: {
    pill: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    dot: 'bg-yellow-500',
  },
  safe: {
    pill: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  info: {
    pill: 'bg-sky-50 text-sky-800 border-sky-200',
    dot: 'bg-sky-500',
  },
  neutral: {
    pill: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
};

export function StatusPill({
  children,
  className,
  dot = true,
  tone = 'neutral',
  ...props
}: StatusPillProps) {
  const styles = toneStyles[tone] ?? toneStyles.neutral;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-tight uppercase shadow-2xs',
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
