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
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-xs">
        No candidate relocation sites identified within the planning perimeter.
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
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
            className={`cursor-pointer rounded-xl border p-4.5 transition-all shadow-xs ${
              isSelected
                ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-card'
                : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-card hover:bg-slate-50/40'
            } ${isRecommended ? 'border-l-4 border-l-emerald-600' : ''}`}
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
                <h3 className="text-sm font-bold text-slate-900">{site.name}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {site.id} · {site.block} Block, {site.district} · {site.landClass.replace('_', ' ')}
                </p>
              </div>

              <div className="text-right">
                <span className="tabnum text-sm font-bold text-slate-900">{distanceKm} km</span>
                <span className="block text-[10px] text-slate-500 font-medium">transit distance</span>
              </div>
            </div>

            {/* Metrics Matrix */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Available Headroom</p>
                <p className="tabnum mt-1 text-base font-black text-emerald-700">
                  {capacity.availableHeadroom.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-emerald-700">of {capacity.effectiveCapacity} eff</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current Utilization</p>
                <p className="tabnum mt-1 text-sm font-bold text-slate-900">
                  {capacity.utilizationPercent}%
                </p>
                <p className="text-[10px] text-slate-500">{capacity.currentOccupancy} occupied</p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Limiting Factor</p>
                <p className="mt-1 text-xs font-bold capitalize text-amber-800">
                  {capacity.limitingFactor}
                </p>
                <p className="text-[10px] text-amber-700 line-clamp-1">{capacity.limitingFactorLabel}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Safety Envelope</p>
                <p className="mt-1 text-xs font-bold capitalize text-slate-900">
                  {site.hazardExposure} Risk
                </p>
                <p className="text-[10px] text-slate-500">Safety score {suitability.factors.safety.raw}%</p>
              </div>
            </div>

            {/* Population Absorption Progress */}
            <div className="mt-3">
              <div className="mb-1 flex items-baseline justify-between text-xs">
                <span className="text-slate-600 font-medium">Population Absorption Feasibility:</span>
                <span className="tabnum font-bold text-slate-900">
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
            <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-100 pt-2.5 text-[11px] sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-emerald-800">Key Strengths:</p>
                <ul className="space-y-0.5">
                  {suitability.strengths.slice(0, 3).map((st) => (
                    <li key={st} className="flex items-center gap-1.5 text-slate-700">
                      <CheckIcon className="size-3 shrink-0 text-emerald-600" />
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-amber-800">Constraints / Limiting Factors:</p>
                <ul className="space-y-0.5">
                  {match.evidence.limitingFactors.slice(0, 2).map((lf) => (
                    <li key={lf} className="flex items-center gap-1.5 text-slate-600">
                      <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
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
