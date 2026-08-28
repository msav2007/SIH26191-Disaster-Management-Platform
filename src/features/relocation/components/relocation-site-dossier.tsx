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
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-xs text-slate-500">
        <div className="mb-2.5 flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          📍
        </div>
        <p className="font-bold text-slate-900">No Relocation Sector Selected</p>
        <p className="mt-1 max-w-[240px] text-[11px] text-slate-500 leading-relaxed">
          Select any candidate site from the ranked options or inventory table to inspect its carrying capacity, limiting factors, and service readiness.
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
    <div className="flex h-full flex-col overflow-y-auto p-5">
      {/* Header */}
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={capacityTone}>
              {cap.capacityStatus}
            </StatusPill>
            {suitability && (
              <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                Suitability {suitability.suitabilityScore}/100 ({suitability.suitabilityBand})
              </span>
            )}
            {isRecommended && (
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                Rank #{rank} Recommended
              </span>
            )}
            <ProvenanceTag value={site.provenance} />
          </div>
          <h2 className="text-base font-bold text-slate-900">{site.name}</h2>
          <p className="text-xs text-slate-500 font-mono">
            {site.id} · {site.block} Block, {site.district}, {site.state}
          </p>
        </div>
        <button
          aria-label="Close site dossier"
          className="text-slate-400 hover:text-slate-700 transition-colors"
          onClick={onClose}
          type="button"
        >
          <CloseIcon className="size-4" />
        </button>
      </header>

      <div className="mt-4 space-y-4 text-xs">
        {/* 1. Capacity Overview Card */}
        <div className="grid grid-cols-3 gap-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Available Headroom</p>
            <p className="tabnum mt-1 text-lg font-black text-emerald-700">
              {cap.availableHeadroom.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-slate-500">of {cap.effectiveCapacity.toLocaleString('en-IN')} eff</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current Utilization</p>
            <p className="tabnum mt-1 text-base font-bold text-slate-900">
              {cap.utilizationPercent}%
            </p>
            <p className="text-[10px] text-slate-500">{cap.currentOccupancy.toLocaleString('en-IN')} occupied</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Data Confidence</p>
            <p className="tabnum mt-1 text-base font-bold text-slate-900">
              {Math.round(cap.confidence * 100)}%
            </p>
            <p className="text-[10px] text-slate-500">
              {cap.missingDataFields.length > 0 ? 'Data Required' : 'Field Verified'}
            </p>
          </div>
        </div>

        {/* 2. DECISION / CAPACITY EVIDENCE BOX */}
        <div
          className={`rounded-xl border p-3.5 ${
            isRecommended
              ? 'border-emerald-200 bg-emerald-50/40'
              : 'border-slate-200 bg-slate-50/60'
          }`}
        >
          <div className="flex items-center gap-1.5 text-slate-900">
            <AlertTriangleIcon className="size-4 text-sky-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              {isRecommended
                ? 'Why This Site Is Recommended'
                : selectedMatch
                  ? `Tradeoff Analysis (Rank #${rank})`
                  : 'Carrying Capacity Summary'}
            </h3>
          </div>
          <p className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-900">
            {selectedMatch?.evidence.recommendationSummary ?? cap.evidence.summary}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-amber-800">
            {cap.evidence.limitingFactorExplanation}
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            {cap.evidence.dataConfidenceText}
          </p>
        </div>

        {/* 3. Essential Services Readiness Matrix */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Essential Services Readiness Matrix</p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {Object.entries(site.services).map(([svc, rating]) => (
              <div
                key={svc}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 shadow-2xs"
              >
                <span className="capitalize text-slate-700">
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

        {/* 4. Collapsible Multi-Dimensional Capacity Table */}
        <details className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 group">
          <summary className="text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none flex items-center justify-between">
            <div>
              <span>Multi-Dimensional Capacity Assessment</span>
              <span className="ml-2 text-[10px] font-normal text-slate-500">
                (Bottleneck: <strong className="text-amber-800">{cap.limitingFactorLabel}</strong>)
              </span>
            </div>
            <span className="text-xs text-sky-700 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/90 text-[10px] uppercase font-semibold text-slate-600">
                <tr>
                  <th className="px-2.5 py-1.5 font-bold">Dimension</th>
                  <th className="px-2 py-1.5 text-right font-bold">Supported</th>
                  <th className="px-2.5 py-1.5 font-bold">Constraint Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.values(cap.dimensions).map((dim) => (
                  <tr
                    key={dim.dimension}
                    className={dim.isLimiting ? 'bg-amber-50/40 font-semibold' : 'hover:bg-slate-50/60'}
                  >
                    <td className="px-2.5 py-1.5 text-slate-900">
                      <span className="block font-medium">{dim.label}</span>
                      <span className="text-[10px] text-slate-500">{dim.notes}</span>
                    </td>
                    <td className="tabnum px-2 py-1.5 text-right text-slate-900 font-semibold">
                      {dim.supportedPopulation.toLocaleString('en-IN')}
                    </td>
                    <td className="px-2.5 py-1.5">
                      {dim.isLimiting ? (
                        <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                          Limiting Bottleneck
                        </span>
                      ) : dim.isDataMissing ? (
                        <span className="rounded-md border border-red-200 bg-red-50 px-1 py-0.5 text-[9px] font-bold uppercase text-red-700">
                          Data Required
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-semibold">Adequate Headroom</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        {/* 5. Structural Parameters */}
        <dl className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-1">
          <KeyValue label="Land Tenure Classification" value={site.landClass.replace('_', ' ')} />
          <KeyValue label="Total Site Area" value={`${site.areaHectares} hectares`} />
          <KeyValue label="Emergency Shelter Beds" mono value={`${site.shelterCapacity} beds`} />
          <KeyValue label="Commissioning Status" value={site.status} />
          <KeyValue label="Hazard Exposure Envelope" value={site.hazardExposure.toUpperCase()} />
        </dl>

        {/* 6. Operational GIS Action */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
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
