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
        <header className="flex items-start justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <StatusPill tone={tone}>{z.severity} Red Zone</StatusPill>
              <ProvenanceTag value={z.provenance} />
            </div>
            <h3 className="mt-1 text-sm font-bold text-[var(--text)]">{z.name}</h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              {z.id} · {z.district}, {z.state}
            </p>
          </div>
          <button
            aria-label="Close inspector"
            className="text-[var(--text-muted)] hover:text-[var(--text)]"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        <div className="mt-3 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2">
              <p className="label-xs">Affected Population</p>
              <p className="tabnum mt-1 text-base font-bold text-[var(--critical)]">
                {z.affectedPopulation.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2">
              <p className="label-xs">Zone Area</p>
              <p className="tabnum mt-1 text-base font-bold text-[var(--text)]">{z.areaSqKm} sq km</p>
            </div>
          </div>

          <div>
            <p className="label-xs mb-1.5">Identified Hazards</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="critical">Primary: {z.primaryHazard}</Badge>
              {z.secondaryHazards.map((hz) => (
                <Badge key={hz} variant="outline">
                  {hz}
                </Badge>
              ))}
            </div>
          </div>

          <dl>
            <KeyValue label="Radial Boundary" value={`${z.radiusKm} km radius`} />
            <KeyValue label="Affected Settlements" value={`${z.affectedHabitations} habitations`} />
            <KeyValue label="Notification Status" value={z.status} />
            <KeyValue label="Last Assessed" mono value={z.lastUpdated} />
            <KeyValue label="Coordinates" mono value={`${z.coordinates.latitude.toFixed(4)}°N, ${z.coordinates.longitude.toFixed(4)}°E`} />
          </dl>

          <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2.5">
            <p className="label-xs mb-1">Scientific Source Provenance</p>
            <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">{z.source}</p>
          </div>
        </div>
      </div>
    );
  }

  if (feature.type === 'habitation') {
    const h = feature.data;
    const tone = h.priority === 'CRITICAL' ? 'critical' : h.priority === 'HIGH' ? 'high' : 'moderate';
    const candidateMatches = evaluateCandidateSites(h);

    return (
      <div className="flex h-full flex-col overflow-y-auto p-4">
        <header className="flex items-start justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <StatusPill tone={tone}>{h.priority} Priority</StatusPill>
              <ProvenanceTag value={h.provenance} />
            </div>
            <h3 className="mt-1 text-sm font-bold text-[var(--text)]">{h.name}</h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              {h.id} · {h.block} Block, {h.district}, {h.state}
            </p>
          </div>
          <button
            aria-label="Close inspector"
            className="text-[var(--text-muted)] hover:text-[var(--text)]"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        <div className="mt-3 space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2">
              <p className="label-xs">Population</p>
              <p className="tabnum mt-1 text-sm font-bold text-[var(--text)]">{h.population.toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2">
              <p className="label-xs">Households</p>
              <p className="tabnum mt-1 text-sm font-bold text-[var(--text)]">{h.households}</p>
            </div>
            <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2">
              <p className="label-xs">Slope / Elev</p>
              <p className="tabnum mt-1 text-sm font-bold text-[var(--text)]">{h.slopeDeg}° / {h.elevationM}m</p>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <p className="label-xs">Multi-Criteria Vulnerability Factors</p>
              <span className="text-[10px] text-[var(--text-muted)]">Score weights</span>
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
            <p className="label-xs mb-1">Demographic Vulnerability Breakdown</p>
            <div className="grid grid-cols-2 gap-1.5 rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2 text-[11px]">
              <div>Elderly: <span className="tabnum font-bold text-[var(--text)]">{h.demographics.elderly}</span></div>
              <div>Children: <span className="tabnum font-bold text-[var(--text)]">{h.demographics.children}</span></div>
              <div>PWD: <span className="tabnum font-bold text-[var(--text)]">{h.demographics.pwd}</span></div>
              <div>BPL Households: <span className="tabnum font-bold text-[var(--text)]">{h.demographics.belowPovertyLine}</span></div>
            </div>
          </div>

          {candidateMatches.length > 0 && (
            <div>
              <p className="label-xs mb-1.5">Candidate Relocation Sites</p>
              <div className="space-y-2">
                {candidateMatches.slice(0, 2).map((m) => (
                  <div
                    key={m.site.id}
                    className="cursor-pointer rounded-sm border border-[var(--border)] bg-[var(--surface)] p-2.5 transition-colors hover:bg-[var(--surface-muted)]"
                    onClick={() => onSelectFeature?.({ type: 'relocation_site', data: m.site })}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-semibold text-[var(--text)] line-clamp-1">{m.site.name}</p>
                      <span className="tabnum text-[10px] text-[var(--text-muted)]">{m.distanceKm} km</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-[var(--text-muted)]">Available headroom:</span>
                      <span className="tabnum font-bold text-[var(--safe)]">{m.availableCapacity.toLocaleString('en-IN')} persons</span>
                    </div>
                    <MetricBar className="mt-1.5" label="Population Absorption Coverage" showValue tone={m.coveragePct >= 100 ? 'safe' : 'moderate'} value={m.coveragePct} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-[var(--border)] pt-2">
            <Link className="inline-flex w-full items-center justify-center rounded-sm bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-strong)]" href="/habitations">
              Open Full Habitation Dossier →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (feature.type === 'relocation_site') {
    const s = feature.data;
    const available = Math.max(0, s.carryingCapacity - s.currentOccupancy);
    const utilPct = Math.round((s.currentOccupancy / s.carryingCapacity) * 100);
    const suitabilityTone = s.suitability === 'suitable' ? 'safe' : s.suitability === 'conditionally_suitable' ? 'moderate' : 'critical';

    return (
      <div className="flex h-full flex-col overflow-y-auto p-4">
        <header className="flex items-start justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <StatusPill tone={suitabilityTone}>{s.suitability.replace('_', ' ')}</StatusPill>
              <ProvenanceTag value={s.provenance} />
            </div>
            <h3 className="mt-1 text-sm font-bold text-[var(--text)]">{s.name}</h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              {s.id} · {s.block} Block, {s.district}, {s.state}
            </p>
          </div>
          <button
            aria-label="Close inspector"
            className="text-[var(--text-muted)] hover:text-[var(--text)]"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        <div className="mt-3 space-y-4 text-xs">
          {/* Capacity vs Suitability Callout */}
          <div className="rounded-sm border border-[var(--info-border)] bg-[var(--info-soft)] p-2.5 text-[11px] text-[var(--info)]">
            <p className="font-semibold">Capacity vs Suitability Distinction</p>
            <p className="mt-0.5 leading-relaxed text-[var(--text)]">
              This site has <strong>{available.toLocaleString('en-IN')} persons</strong> headroom, but suitability status is <strong>{s.suitability.replace('_', ' ')}</strong> based on infrastructure and statutory clearances.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2">
              <p className="label-xs">Total Capacity</p>
              <p className="tabnum mt-1 text-base font-bold text-[var(--text)]">{s.carryingCapacity.toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2">
              <p className="label-xs">Available Headroom</p>
              <p className="tabnum mt-1 text-base font-bold text-[var(--safe)]">{available.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <p className="label-xs">Current Utilization</p>
              <span className="tabnum text-[11px] font-bold text-[var(--text)]">{utilPct}%</span>
            </div>
            <MetricBar max={100} tone={utilPct > 80 ? 'critical' : 'safe'} value={utilPct} />
          </div>

          <div>
            <p className="label-xs mb-1.5">Essential Services Readiness Matrix</p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {Object.entries(s.services).map(([service, rating]) => (
                <div key={service} className="flex items-center justify-between rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2">
                  <span className="capitalize text-[var(--text-muted)]">{service.replace(/([A-Z])/g, ' $1')}</span>
                  <StatusPill dot={false} tone={rating === 'adequate' ? 'safe' : rating === 'partial' ? 'moderate' : 'critical'}>
                    {rating}
                  </StatusPill>
                </div>
              ))}
            </div>
          </div>

          <dl>
            <KeyValue label="Land Classification" value={s.landClass.replace('_', ' ')} />
            <KeyValue label="Site Area" value={`${s.areaHectares} hectares`} />
            <KeyValue label="Emergency Shelter Capacity" value={`${s.shelterCapacity} persons`} />
            <KeyValue label="Hazard Exposure Level" value={s.hazardExposure} />
            <KeyValue label="Commissioning Status" value={s.status} />
          </dl>

          <div className="border-t border-[var(--border)] pt-2">
            <Link className="inline-flex w-full items-center justify-center rounded-sm bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-strong)]" href="/relocation">
              Open Full Site Assessment →
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
      <header className="flex items-start justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <StatusPill tone="info">{inf.kind.toUpperCase()}</StatusPill>
          <h3 className="mt-1 text-sm font-bold text-[var(--text)]">{inf.name}</h3>
          <p className="text-[11px] text-[var(--text-muted)]">
            {inf.id} · {inf.district}, {inf.state}
          </p>
        </div>
        <button
          aria-label="Close inspector"
          className="text-[var(--text-muted)] hover:text-[var(--text)]"
          onClick={onClose}
          type="button"
        >
          <CloseIcon className="size-4" />
        </button>
      </header>

      <div className="mt-3 space-y-4 text-xs">
        <dl>
          <KeyValue label="Infrastructure Asset Type" value={inf.kind.replace('_', ' ').toUpperCase()} />
          <KeyValue label="District Jurisdiction" value={inf.district} />
          <KeyValue label="State" value={inf.state} />
          <KeyValue label="Coordinates" mono value={`${inf.coordinates.latitude.toFixed(4)}°N, ${inf.coordinates.longitude.toFixed(4)}°E`} />
        </dl>
        <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2.5">
          <p className="label-xs mb-1">Operational Use</p>
          <p className="text-[11px] text-[var(--text-muted)]">
            Identified as critical emergency response asset for nearby vulnerable habitations and planned relocation sites.
          </p>
        </div>
      </div>
    </div>
  );
}
