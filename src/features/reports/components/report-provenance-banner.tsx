import type { ReportMetadata } from '@/server/reports/report-types';
import { ProvenanceTag } from '@/components/ui/provenance-tag';

export interface ReportProvenanceBannerProps {
  metadata: ReportMetadata;
}

export function ReportProvenanceBanner({ metadata }: ReportProvenanceBannerProps) {
  return (
    <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-[var(--accent-strong)]">
            {metadata.reportId}
          </span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[var(--text-muted)]">{metadata.authorityJurisdiction}</span>
          <ProvenanceTag value={metadata.provenance} />
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
          <span>Engine: <strong>{metadata.modelVersion}</strong></span>
          <span>·</span>
          <span>Generated: {new Date(metadata.generatedAt).toLocaleString('en-IN')}</span>
        </div>
      </div>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--critical)]">
        {metadata.disclaimer}
      </p>
    </div>
  );
}
