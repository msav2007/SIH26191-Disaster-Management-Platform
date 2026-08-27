import type { HTMLAttributes, ReactNode } from 'react';

import type { DataProvenance } from '@/types/domain';
import { cn } from '@/lib/utils/cn';
import { ProvenanceTag } from '@/components/ui/provenance-tag';

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: ReactNode;
  provenance?: DataProvenance | string;
  bodyClassName?: string;
}

export function Panel({
  actions,
  bodyClassName,
  children,
  className,
  description,
  provenance,
  title,
  ...props
}: PanelProps) {
  return (
    <section
      className={cn(
        'flex flex-col rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-subtle)] overflow-hidden',
        className,
      )}
      {...props}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-[var(--text)]">{title}</h2>
            {provenance && <ProvenanceTag value={provenance} />}
          </div>
          {description && <p className="text-[11px] text-[var(--text-muted)]">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </section>
  );
}
