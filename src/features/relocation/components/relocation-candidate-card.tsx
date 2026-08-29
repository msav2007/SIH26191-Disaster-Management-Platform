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
      className={`cursor-pointer rounded-2xl border p-5 transition-all duration-150 ${
        isSelected
          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/30 shadow-card'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-subtle'
      } ${isRecommended ? 'border-l-4 border-l-emerald-600' : ''}`}
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
          <h3 className="text-sm font-bold text-slate-900">{site.name}</h3>
          <p className="text-xs text-slate-500 font-mono">
            {site.id} · {site.block} Block, {site.district} · {site.landClass.replace('_', ' ')}
          </p>
        </div>

        <div className="text-right">
          <span className="tabnum text-xs font-bold text-slate-900">{distanceKm} km</span>
          <span className="block text-[10px] text-slate-500 font-medium">transit distance</span>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Available Headroom</p>
          <p className="tabnum mt-1 text-sm font-black text-emerald-700">
            {capacity.availableHeadroom.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-emerald-800">of {capacity.effectiveCapacity} effective</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current Utilization</p>
          <p className="tabnum mt-1 text-sm font-bold text-slate-900">
            {capacity.utilizationPercent}%
          </p>
          <p className="text-[10px] text-slate-500">{capacity.currentOccupancy} occupied</p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Limiting Factor</p>
          <p className="mt-1 text-xs font-bold capitalize text-amber-900">
            {capacity.limitingFactor}
          </p>
          <p className="text-[10px] text-amber-700 truncate">{capacity.limitingFactorLabel}</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hazard Safety</p>
          <p className="mt-1 text-xs font-bold capitalize text-slate-900">
            {site.hazardExposure} Risk
          </p>
          <p className="text-[10px] text-slate-500">Safety score {suitability.factors.safety.raw}%</p>
        </div>
      </div>

      {/* Population Absorption Gauge */}
      <div className="mt-3.5">
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

      {/* Essential Services Snapshot */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5 text-[10px]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Services:</span>
        {Object.entries(site.services).map(([svc, rating]) => (
          <span
            key={svc}
            className={`rounded-md border px-2 py-0.5 capitalize font-medium ${
              rating === 'adequate'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : rating === 'partial'
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {svc}: {rating}
          </span>
        ))}
      </div>
    </div>
  );
}
