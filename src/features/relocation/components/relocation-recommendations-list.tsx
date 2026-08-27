import type { CandidateSiteMatchResult } from '@/server/relocation/matching-engine';
import { Badge } from '@/components/ui/badge';
import { CheckIcon } from '@/components/ui/icons';
import { MetricBar } from '@/components/ui/metric-bar';
import { StatusPill } from '@/components/ui/status-pill';

export interface RelocationRecommendationsListProps {
  matches: CandidateSiteMatchResult[];
  selectedSiteId: string | null;
  onSelect: (match: CandidateSiteMatchResult) => void;
}

export function RelocationRecommendationsList({
  matches,
  onSelect,
  selectedSiteId,
}: RelocationRecommendationsListProps) {
  if (matches.length === 0) {
    return (
      <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-xs text-[var(--text-muted)]">
        No candidate relocation sites identified within the planning perimeter.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const { capacity, distanceKm, isRecommended, rank, site, suitability } = match;
        const isSelected = selectedSiteId === site.id;

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
            key={site.id}
            className={`cursor-pointer rounded-sm border p-4 transition-all duration-150 ${
              isSelected
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]/30 ring-1 ring-[var(--accent)]'
                : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)]'
            } ${isRecommended ? 'border-l-4 border-l-[var(--safe)]' : ''}`}
            onClick={() => onSelect(match)}
          >
            {/* Top Bar */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {isRecommended ? (
                    <Badge variant="safe">RANK #{rank} · RECOMMENDED SECTOR</Badge>
                  ) : (
                    <Badge variant="outline">RANK #{rank} · ALTERNATIVE OPTION</Badge>
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
                <span className="tabnum text-sm font-bold text-[var(--text)]">{distanceKm} km</span>
                <span className="block text-[10px] text-[var(--text-muted)]">transit distance</span>
              </div>
            </div>

            {/* Metrics Matrix */}
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
                <p className="label-xs">Safety Envelope</p>
                <p className="mt-1 text-xs font-bold capitalize text-[var(--text)]">
                  {site.hazardExposure} Risk
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">Safety score {suitability.factors.safety.raw}%</p>
              </div>
            </div>

            {/* Population Absorption Progress */}
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

            {/* Key Strengths and Constraints */}
            <div className="mt-3 grid grid-cols-1 gap-2 border-t border-[var(--border)] pt-2.5 text-[11px] sm:grid-cols-2">
              <div>
                <p className="label-xs mb-1 text-[var(--safe)]">Key Strengths:</p>
                <ul className="space-y-0.5">
                  {suitability.strengths.slice(0, 3).map((st) => (
                    <li key={st} className="flex items-center gap-1.5 text-[var(--text)]">
                      <CheckIcon className="size-3 shrink-0 text-[var(--safe)]" />
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="label-xs mb-1 text-[var(--high)]">Constraints / Limiting Factors:</p>
                <ul className="space-y-0.5">
                  {match.evidence.limitingFactors.slice(0, 2).map((lf) => (
                    <li key={lf} className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <span className="size-1.5 shrink-0 rounded-full bg-[var(--high)]" />
                      <span>{lf}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
