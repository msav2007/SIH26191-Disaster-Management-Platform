import Link from 'next/link';

import type { SiteCapacityAssessment } from '@/server/capacity/capacity-engine';
import type { CandidateSiteMatchResult } from '@/server/relocation/matching-engine';
import type { RelocationSite } from '@/types/domain';
import { buttonStyles } from '@/components/ui/button';
import {
  AlertTriangleIcon,
  CloseIcon,
  MapPinIcon,
} from '@/components/ui/icons';
import { KeyValue } from '@/components/ui/key-value';
import { ProvenanceTag } from '@/components/ui/provenance-tag';
import { StatusPill } from '@/components/ui/status-pill';

export interface RelocationSiteDossierProps {
  selectedSite: RelocationSite | null;
  capacity: SiteCapacityAssessment | null;
  selectedMatch?: CandidateSiteMatchResult | null;
  targetHabitationName?: string;
  onClose: () => void;
}

export function RelocationSiteDossier({
  capacity,
  onClose,
  selectedMatch,
  selectedSite,
}: RelocationSiteDossierProps) {
  const site = selectedMatch?.site ?? selectedSite;
  const cap = selectedMatch?.capacity ?? capacity;

  if (!site || !cap) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-xs text-[var(--text-muted)]">
        <div className="mb-2 size-8 rounded-full border border-dashed border-[var(--border)] p-2">
          📍
        </div>
        <p className="font-semibold text-[var(--text)]">No Relocation Sector Selected</p>
        <p className="mt-1 max-w-[240px]">
          Select any candidate site from the ranked options or inventory table to inspect its 10-dimension carrying capacity, limiting factors, and service readiness.
        </p>
      </div>
    );
  }

  const suitability = selectedMatch?.suitability;
  const rank = selectedMatch?.rank;
  const isRecommended = selectedMatch?.isRecommended;

  const capacityTone =
    cap.capacityStatus === 'AVAILABLE'
      ? 'safe'
      : cap.capacityStatus === 'LIMITED'
        ? 'moderate'
        : cap.capacityStatus === 'NEAR_CAPACITY'
          ? 'high'
          : 'critical';

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 sm:p-5">
      {/* Header */}
      <header className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3.5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={capacityTone}>
              {cap.capacityStatus}
            </StatusPill>
            {suitability && (
              <span className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--text)]">
                Suitability {suitability.suitabilityScore}/100 ({suitability.suitabilityBand})
              </span>
            )}
            {isRecommended && (
              <span className="rounded-sm border border-[var(--safe-border)] bg-[var(--safe-soft)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--safe)]">
                Rank #{rank} Recommended
              </span>
            )}
            <ProvenanceTag value={site.provenance} />
          </div>
          <h2 className="text-base font-bold text-[var(--text)]">{site.name}</h2>
          <p className="text-xs text-[var(--text-muted)]">
            {site.id} · {site.block} Block, {site.district}, {site.state}
          </p>
        </div>
        <button
          aria-label="Close site dossier"
          className="text-[var(--text-muted)] hover:text-[var(--text)]"
          onClick={onClose}
          type="button"
        >
          <CloseIcon className="size-4" />
        </button>
      </header>

      <div className="mt-4 space-y-4 text-xs">
        {/* Capacity Overview Card */}
        <div className="grid grid-cols-3 gap-2.5 rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-3">
          <div>
            <p className="label-xs">Available Headroom</p>
            <p className="tabnum mt-1 text-lg font-black text-[var(--safe)]">
              {cap.availableHeadroom.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">of {cap.effectiveCapacity} eff</p>
          </div>
          <div>
            <p className="label-xs">Current Utilization</p>
            <p className="tabnum mt-1 text-base font-bold text-[var(--text)]">
              {cap.utilizationPercent}%
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">{cap.currentOccupancy} occupied</p>
          </div>
          <div>
            <p className="label-xs">Data Confidence</p>
            <p className="tabnum mt-1 text-base font-bold text-[var(--text)]">
              {Math.round(cap.confidence * 100)}%
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              {cap.missingDataFields.length > 0 ? 'Data Required' : 'Field Verified'}
            </p>
          </div>
        </div>

        {/* DECISION / CAPACITY EVIDENCE BOX */}
        <div
          className={`rounded-sm border p-3.5 ${
            isRecommended
              ? 'border-[var(--safe-border)] bg-[var(--safe-soft)]/50'
              : 'border-[var(--border)] bg-[var(--surface-muted)]'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[var(--text)]">
            <AlertTriangleIcon className="size-4 text-[var(--accent-strong)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              {isRecommended
                ? 'Why This Site Is Recommended'
                : selectedMatch
                  ? `Tradeoff Analysis (Rank #${rank})`
                  : 'Carrying Capacity Summary'}
            </h3>
          </div>
          <p className="mt-1.5 text-xs font-medium leading-relaxed text-[var(--text)]">
            {selectedMatch?.evidence.recommendationSummary ?? cap.evidence.summary}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-[var(--high)]">
            {cap.evidence.limitingFactorExplanation}
          </p>
          <p className="mt-1 text-[10px] text-[var(--text-muted)]">
            {cap.evidence.dataConfidenceText}
          </p>
        </div>

        {/* Multi-Dimensional Capacity Table */}
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <p className="label-xs">Multi-Dimensional Capacity Assessment</p>
            <span className="text-[10px] text-[var(--text-muted)]">
              Limiting factor: <strong className="text-[var(--high)]">{cap.limitingFactorLabel}</strong>
            </span>
          </div>
          <div className="overflow-hidden rounded-sm border border-[var(--border)]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10px] uppercase text-[var(--text-muted)]">
                <tr>
                  <th className="px-2.5 py-1.5 font-bold">Dimension</th>
                  <th className="px-2 py-1.5 text-right font-bold">Supported</th>
                  <th className="px-2.5 py-1.5 font-bold">Constraint Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {Object.values(cap.dimensions).map((dim) => (
                  <tr
                    key={dim.dimension}
                    className={dim.isLimiting ? 'bg-[var(--high-soft)]/40 font-semibold' : 'hover:bg-[var(--surface-muted)]'}
                  >
                    <td className="px-2.5 py-1.5 text-[var(--text)]">
                      <span className="block font-medium">{dim.label}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{dim.notes}</span>
                    </td>
                    <td className="tabnum px-2 py-1.5 text-right text-[var(--text)]">
                      {dim.supportedPopulation.toLocaleString('en-IN')}
                    </td>
                    <td className="px-2.5 py-1.5">
                      {dim.isLimiting ? (
                        <span className="rounded-sm border border-[var(--high-border)] bg-[var(--high-soft)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--high)]">
                          Limiting Bottleneck
                        </span>
                      ) : dim.isDataMissing ? (
                        <span className="rounded-sm border border-[var(--critical-border)] bg-[var(--critical-soft)] px-1 py-0.5 text-[9px] font-bold uppercase text-[var(--critical)]">
                          Data Required
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--safe)]">Adequate Headroom</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Essential Services Readiness Matrix */}
        <div>
          <p className="label-xs mb-1.5">Essential Services Readiness Matrix</p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {Object.entries(site.services).map(([svc, rating]) => (
              <div
                key={svc}
                className="flex items-center justify-between rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2"
              >
                <span className="capitalize text-[var(--text-muted)]">
                  {svc.replace(/([A-Z])/g, ' $1')}
                </span>
                <StatusPill
                  dot={false}
                  tone={
                    rating === 'adequate'
                      ? 'safe'
                      : rating === 'partial'
                        ? 'moderate'
                        : rating === 'inadequate'
                          ? 'critical'
                          : 'neutral'
                  }
                >
                  {rating}
                </StatusPill>
              </div>
            ))}
          </div>
        </div>

        {/* Structural Parameters */}
        <dl>
          <KeyValue label="Land Tenure Classification" value={site.landClass.replace('_', ' ')} />
          <KeyValue label="Total Site Area" value={`${site.areaHectares} hectares`} />
          <KeyValue label="Emergency Shelter Beds" mono value={`${site.shelterCapacity} beds`} />
          <KeyValue label="Commissioning Status" value={site.status} />
          <KeyValue label="Hazard Exposure Envelope" value={site.hazardExposure.toUpperCase()} />
        </dl>

        {/* Operational GIS Action */}
        <div className="space-y-2 border-t border-[var(--border)] pt-3">
          <Link
            className={buttonStyles({ className: 'w-full', size: 'sm', variant: 'secondary' })}
            href={`/map?selected=${site.id}`}
          >
            <MapPinIcon className="size-3.5" />
            View on GIS Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
