import Link from 'next/link';

import type {
  CriticalInfrastructure,
  Habitation,
  RedZone,
  RelocationSite,
} from '@/types/domain';
import { Badge } from '@/components/ui/badge';
import { CloseIcon } from '@/components/ui/icons';
import { KeyValue } from '@/components/ui/key-value';
import { MetricBar } from '@/components/ui/metric-bar';
import { ProvenanceTag } from '@/components/ui/provenance-tag';
import { StatusPill } from '@/components/ui/status-pill';
import { evaluateCandidateSites } from '@/server/gis/spatial-queries';
import { calculateHabitationRisk } from '@/server/risk/risk-engine';
import { calculateSiteCapacity } from '@/server/capacity/capacity-engine';
import { getPriorityTone } from '@/server/classification/classification-engine';

export type SelectedFeature =
  | { type: 'red_zone'; data: RedZone }
  | { type: 'habitation'; data: Habitation }
  | { type: 'relocation_site'; data: RelocationSite }
  | { type: 'infrastructure'; data: CriticalInfrastructure };

export interface GisFeatureInspectorProps {
  feature: SelectedFeature | null;
  onClose: () => void;
  onSelectFeature?: (feature: SelectedFeature) => void;
}

export function GisFeatureInspector({
  feature,
  onClose,
  onSelectFeature,
}: GisFeatureInspectorProps) {
  if (!feature) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-xs text-[var(--text-muted)]">
        <div className="mb-2 size-8 rounded-full border border-dashed border-[var(--border)] p-2">
          🗺️
        </div>
        <p className="font-medium text-[var(--text)]">No feature selected</p>
        <p className="mt-1 max-w-[220px]">
          Click on any Red Zone, habitation, relocation site, or infrastructure marker on the map to inspect evidence.
        </p>
      </div>
    );
  }

  if (feature.type === 'red_zone') {
    const z = feature.data;
    const tone = z.severity === 'critical' ? 'critical' : z.severity === 'high' ? 'high' : 'moderate';

    return (
      <div className="flex h-full flex-col overflow-y-auto p-4">
        <header className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-800">
                RED ZONE
              </span>
              <StatusPill tone={tone}>{z.severity}</StatusPill>
              <ProvenanceTag value={z.provenance} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{z.name}</h3>
            <p className="text-[11px] text-slate-500 font-mono">
              {z.id} · {z.district}, {z.state}
            </p>
          </div>
          <button
            aria-label="Close inspector"
            className="text-slate-400 hover:text-slate-700 transition-colors"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        <div className="mt-3 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-red-200 bg-red-50/40 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-800">Affected Population</p>
              <p className="tabnum mt-1 text-base font-black text-red-700">
                {z.affectedPopulation.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Zone Area</p>
              <p className="tabnum mt-1 text-base font-bold text-slate-900">{z.areaSqKm} sq km</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Identified Hazards</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="critical">Primary: {z.primaryHazard}</Badge>
              {z.secondaryHazards.map((hz) => (
                <Badge key={hz} variant="outline">
                  {hz}
                </Badge>
              ))}
            </div>
          </div>

          <dl className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 space-y-1">
            <KeyValue label="Radial Boundary" value={`${z.radiusKm} km radius`} />
            <KeyValue label="Affected Settlements" value={`${z.affectedHabitations} habitations`} />
            <KeyValue label="Notification Status" value={z.status} />
            <KeyValue label="Last Assessed" mono value={z.lastUpdated} />
            <KeyValue label="Coordinates" mono value={`${z.coordinates.latitude.toFixed(4)}°N, ${z.coordinates.longitude.toFixed(4)}°E`} />
          </dl>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Scientific Source Provenance</p>
            <p className="text-[11px] leading-relaxed text-slate-600">{z.source}</p>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <Link
              className="inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition-colors"
              href="/habitations"
            >
              View Vulnerable Settlements Queue →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (feature.type === 'habitation') {
    const h = feature.data;
    const risk = calculateHabitationRisk(h);
    const tone = getPriorityTone(risk.priority);
    const candidateMatches = evaluateCandidateSites(h);

    return (
      <div className="flex h-full flex-col overflow-y-auto p-4">
        <header className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-800">
                HABITATION
              </span>
              <StatusPill tone={tone}>{risk.priority} Priority</StatusPill>
              <ProvenanceTag value={h.provenance} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{h.name}</h3>
            <p className="text-[11px] text-slate-500 font-mono">
              {h.id} · {h.block} Block, {h.district}, {h.state}
            </p>
            <p className="text-[11px] font-semibold text-red-700 mt-0.5">
              Composite Risk: {risk.compositeScore.toFixed(1)} / 100
            </p>
          </div>
          <button
            aria-label="Close inspector"
            className="text-slate-400 hover:text-slate-700 transition-colors"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        <div className="mt-3 space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Population</p>
              <p className="tabnum mt-1 text-sm font-bold text-slate-900">{h.population.toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Households</p>
              <p className="tabnum mt-1 text-sm font-bold text-slate-900">{h.households}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Slope / Elev</p>
              <p className="tabnum mt-1 text-sm font-bold text-slate-900">{h.slopeDeg}° / {h.elevationM}m</p>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Multi-Criteria Vulnerability Factors</p>
              <span className="text-[10px] text-slate-400 font-mono">Factor weights</span>
            </div>
            <div className="space-y-1.5">
              <MetricBar label="Hazard Intensity" showValue tone={h.factors.hazardIntensity >= 90 ? 'critical' : 'high'} value={h.factors.hazardIntensity} />
              <MetricBar label="Population Vulnerability" showValue tone="high" value={h.factors.populationVulnerability} />
              <MetricBar label="Disaster History Impact" showValue tone="high" value={h.factors.disasterHistory} />
              <MetricBar label="Infrastructure Risk" showValue tone="moderate" value={h.factors.infrastructureRisk} />
              <MetricBar label="Terrain Exposure" showValue tone="moderate" value={h.factors.exposure} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Demographics Breakdown</p>
            <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-[11px]">
              <div>Elderly: <span className="tabnum font-bold text-slate-900">{h.demographics.elderly}</span></div>
              <div>Children: <span className="tabnum font-bold text-slate-900">{h.demographics.children}</span></div>
              <div>PWD: <span className="tabnum font-bold text-slate-900">{h.demographics.pwd}</span></div>
              <div>BPL: <span className="tabnum font-bold text-slate-900">{h.demographics.belowPovertyLine}</span></div>
            </div>
          </div>

          {candidateMatches.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Candidate Relocation Sites</p>
              <div className="space-y-2">
                {candidateMatches.slice(0, 2).map((m) => (
                  <div
                    key={m.site.id}
                    className="cursor-pointer rounded-xl border border-slate-200 bg-white p-2.5 transition-all hover:border-blue-300 hover:bg-blue-50/30"
                    onClick={() => onSelectFeature?.({ type: 'relocation_site', data: m.site })}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-bold text-slate-900 line-clamp-1">{m.site.name}</p>
                      <span className="tabnum text-[10px] text-slate-500 font-mono">{m.distanceKm} km</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Available headroom:</span>
                      <span className="tabnum font-bold text-emerald-700">{m.availableCapacity.toLocaleString('en-IN')} persons</span>
                    </div>
                    <MetricBar className="mt-1.5" label="Population Absorption Coverage" showValue tone={m.coveragePct >= 100 ? 'safe' : 'moderate'} value={m.coveragePct} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-3 space-y-2">
            <Link
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
              href={`/habitations?selected=${h.id}`}
            >
              Open Full Habitation Dossier →
            </Link>
            <Link
              className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              href={`/relocation?habitationId=${h.id}`}
            >
              View Candidate Relocation Sites →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (feature.type === 'relocation_site') {
    const s = feature.data;
    const capacityAssessment = calculateSiteCapacity(s);
    const available = capacityAssessment.availableHeadroom;
    const utilPct = capacityAssessment.utilizationPercent;
    const suitabilityTone = s.suitability === 'suitable' ? 'safe' : s.suitability === 'conditionally_suitable' ? 'moderate' : 'critical';

    return (
      <div className="flex h-full flex-col overflow-y-auto p-4">
        <header className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-800">
                RELOCATION SITE
              </span>
              <StatusPill tone={suitabilityTone}>{s.suitability.replace('_', ' ')}</StatusPill>
              <ProvenanceTag value={s.provenance} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{s.name}</h3>
            <p className="text-[11px] text-slate-500 font-mono">
              {s.id} · {s.block} Block, {s.district}, {s.state}
            </p>
          </div>
          <button
            aria-label="Close inspector"
            className="text-slate-400 hover:text-slate-700 transition-colors"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        <div className="mt-3 space-y-4 text-xs">
          {/* Capacity vs Suitability Callout */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-2.5 text-[11px] text-blue-900">
            <p className="font-bold">Capacity vs Suitability Distinction</p>
            <p className="mt-0.5 leading-relaxed text-slate-700">
              This site has <strong className="text-emerald-700">{available.toLocaleString('en-IN')} persons</strong> effective absorption headroom (bottleneck: {capacityAssessment.limitingFactorLabel}), with suitability status <strong>{s.suitability.replace('_', ' ')}</strong> based on infrastructure and statutory clearances.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Effective Capacity</p>
              <p className="tabnum mt-1 text-base font-bold text-slate-900">{capacityAssessment.effectiveCapacity.toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Available Headroom</p>
              <p className="tabnum mt-1 text-base font-black text-emerald-700">{available.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Current Utilization</p>
              <span className="tabnum text-[11px] font-bold text-slate-900">{utilPct}%</span>
            </div>
            <MetricBar max={100} tone={utilPct > 80 ? 'critical' : 'safe'} value={utilPct} />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Essential Services Readiness Matrix</p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {Object.entries(s.services).map(([service, rating]) => (
                <div key={service} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 shadow-2xs">
                  <span className="capitalize text-slate-600">{service.replace(/([A-Z])/g, ' $1')}</span>
                  <StatusPill dot={false} tone={rating === 'adequate' ? 'safe' : rating === 'partial' ? 'moderate' : 'critical'}>
                    {rating}
                  </StatusPill>
                </div>
              ))}
            </div>
          </div>

          <dl className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 space-y-1">
            <KeyValue label="Land Classification" value={s.landClass.replace('_', ' ')} />
            <KeyValue label="Site Area" value={`${s.areaHectares} hectares`} />
            <KeyValue label="Emergency Shelter Capacity" value={`${s.shelterCapacity} persons`} />
            <KeyValue label="Hazard Exposure Level" value={s.hazardExposure} />
            <KeyValue label="Commissioning Status" value={s.status} />
          </dl>

          <div className="border-t border-slate-100 pt-3">
            <Link
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
              href={`/relocation?siteId=${s.id}`}
            >
              Open Site Assessment →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Infrastructure
  const inf = feature.data;
  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <header className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-800">
              CRITICAL INFRASTRUCTURE
            </span>
            <StatusPill tone="info">{inf.kind.toUpperCase()}</StatusPill>
          </div>
          <h3 className="text-sm font-bold text-slate-900">{inf.name}</h3>
          <p className="text-[11px] text-slate-500 font-mono">
            {inf.id} · {inf.district}, {inf.state}
          </p>
        </div>
        <button
          aria-label="Close inspector"
          className="text-slate-400 hover:text-slate-700 transition-colors"
          onClick={onClose}
          type="button"
        >
          <CloseIcon className="size-4" />
        </button>
      </header>

      <div className="mt-3 space-y-4 text-xs">
        <dl className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 space-y-1">
          <KeyValue label="Infrastructure Asset Type" value={inf.kind.replace('_', ' ').toUpperCase()} />
          <KeyValue label="District Jurisdiction" value={inf.district} />
          <KeyValue label="State" value={inf.state} />
          <KeyValue label="Coordinates" mono value={`${inf.coordinates.latitude.toFixed(4)}°N, ${inf.coordinates.longitude.toFixed(4)}°E`} />
        </dl>
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Operational Use</p>
          <p className="text-[11px] text-slate-600">
            Identified as critical emergency response asset for nearby vulnerable habitations and planned relocation sites.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-3">
          <Link
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            href="/dashboard"
          >
            View Command Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
