import type { CandidateSiteMatchResult } from '@/server/relocation/matching-engine';
import { Badge } from '@/components/ui/badge';
import { MetricBar } from '@/components/ui/metric-bar';
import { StatusPill } from '@/components/ui/status-pill';

export interface RelocationCandidateCardProps {
  match: CandidateSiteMatchResult;
  isSelected: boolean;
  onSelect: () => void;
}

export function RelocationCandidateCard({
  isSelected,
  match,
  onSelect,
}: RelocationCandidateCardProps) {
  const { capacity, distanceKm, isRecommended, rank, site, suitability } = match;

  const suitabilityTone =
    suitability.suitabilityBand === 'EXCELLENT'
      ? 'safe'
      : suitability.suitabilityBand === 'GOOD'
        ? 'moderate'
        : suitability.suitabilityBand === 'CONDITIONAL'
          ? 'high'
          : 'critical';

  return (
    <div
      className={`cursor-pointer rounded-sm border p-4 transition-all duration-150 ${
        isSelected
          ? 'border-[var(--accent)] bg-[var(--accent-soft)]/30 ring-1 ring-[var(--accent)]'
          : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)]'
      } ${isRecommended ? 'border-l-4 border-l-[var(--safe)]' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {isRecommended ? (
              <Badge variant="safe">RANK #{rank} · RECOMMENDED SECTOR</Badge>
            ) : (
              <Badge variant="outline">RANK #{rank} · ALTERNATIVE</Badge>
            )}
            <StatusPill tone={suitabilityTone}>
              {suitability.suitabilityBand} ({suitability.suitabilityScore}/100)
            </StatusPill>
          </div>
          <h3 className="text-sm font-bold text-[var(--text)]">{site.name}</h3>
          <p className="text-xs text-[var(--text-muted)]">
            {site.id} · {site.block} Block, {site.district} · {site.landClass.replace('_', ' ')}
          </p>
        </div>

        <div className="text-right">
          <span className="tabnum text-xs font-bold text-[var(--text)]">{distanceKm} km</span>
          <span className="block text-[10px] text-[var(--text-muted)]">transit distance</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-2">
          <p className="label-xs">Available Headroom</p>
          <p className="tabnum mt-1 text-sm font-bold text-[var(--safe)]">
            {capacity.availableHeadroom.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">of {capacity.effectiveCapacity} eff</p>
        </div>

        <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-2">
          <p className="label-xs">Current Utilization</p>
          <p className="tabnum mt-1 text-sm font-bold text-[var(--text)]">
            {capacity.utilizationPercent}%
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">{capacity.currentOccupancy} occupied</p>
        </div>

        <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-2">
          <p className="label-xs">Limiting Factor</p>
          <p className="mt-1 text-xs font-bold capitalize text-[var(--high)]">
            {capacity.limitingFactor}
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">{capacity.limitingFactorLabel}</p>
        </div>

        <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-2">
          <p className="label-xs">Hazard Safety</p>
          <p className="mt-1 text-xs font-bold capitalize text-[var(--text)]">
            {site.hazardExposure} Risk
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">Safety score {suitability.factors.safety.raw}%</p>
        </div>
      </div>

      {/* Population Absorption Gauge */}
      <div className="mt-3">
        <div className="mb-1 flex items-baseline justify-between text-xs">
          <span className="text-[var(--text-muted)]">Population Absorption Feasibility:</span>
          <span className="tabnum font-bold text-[var(--text)]">
            {match.coveragePct}% ({match.shortfall === 0 ? 'Full Absorption' : `${match.shortfall} Shortfall`})
          </span>
        </div>
        <MetricBar
          max={100}
          tone={match.coveragePct >= 100 ? 'safe' : 'moderate'}
          value={match.coveragePct}
        />
      </div>

      {/* Essential Services Snapshot */}
      <div className="mt-3 flex flex-wrap gap-1 border-t border-[var(--border)] pt-2 text-[10px]">
        <span className="label-xs mr-1 self-center">Services:</span>
        {Object.entries(site.services).map(([svc, rating]) => (
          <span
            key={svc}
            className={`rounded-sm border px-1.5 py-0.5 capitalize ${
              rating === 'adequate'
                ? 'border-[var(--safe-border)] bg-[var(--safe-soft)] text-[var(--safe)]'
                : rating === 'partial'
                  ? 'border-[var(--high-border)] bg-[var(--high-soft)] text-[var(--high)]'
                  : 'border-[var(--critical-border)] bg-[var(--critical-soft)] text-[var(--critical)]'
            }`}
          >
            {svc}: {rating}
          </span>
        ))}
      </div>
    </div>
  );
}
