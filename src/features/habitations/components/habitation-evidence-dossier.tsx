import Link from 'next/link';

import type { HabitationWithRisk } from '@/server/risk/risk-service';
import { buttonStyles } from '@/components/ui/button';
import {
  AlertTriangleIcon,
  CheckIcon,
  CloseIcon,
  MapPinIcon,
} from '@/components/ui/icons';
import { KeyValue } from '@/components/ui/key-value';
import { ProvenanceTag } from '@/components/ui/provenance-tag';
import { StatusPill } from '@/components/ui/status-pill';

export interface HabitationEvidenceDossierProps {
  item: HabitationWithRisk | null;
  onClose: () => void;
}

export function HabitationEvidenceDossier({ item, onClose }: HabitationEvidenceDossierProps) {
  if (!item) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-xs text-slate-500">
        <div className="mb-2.5 flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          📋
        </div>
        <p className="font-bold text-slate-900">No Habitation Selected</p>
        <p className="mt-1 max-w-[240px] text-[11px] text-slate-500 leading-relaxed">
          Select any settlement row from the priority queue to inspect its complete risk evidence, vulnerability metrics, and statutory relocation rationale.
        </p>
      </div>
    );
  }

  const { assessment, habitation: h } = item;
  const tone =
    assessment.priority === 'CRITICAL'
      ? 'critical'
      : assessment.priority === 'HIGH'
        ? 'high'
        : assessment.priority === 'MEDIUM'
          ? 'moderate'
          : 'neutral';

  return (
    <div className="flex h-full flex-col overflow-y-auto p-5">
      {/* Header */}
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={tone}>{assessment.priority} PRIORITY</StatusPill>
            <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
              Window: {assessment.urgencyWindow}
            </span>
            <ProvenanceTag value={h.provenance} />
          </div>
          <h2 className="text-base font-bold text-slate-900">{h.name}</h2>
          <p className="text-xs text-slate-500 font-mono">
            {h.id} · {h.block} Block, {h.district}, {h.state}
          </p>
        </div>
        <button
          aria-label="Close evidence dossier"
          className="text-slate-400 hover:text-slate-700 transition-colors"
          onClick={onClose}
          type="button"
        >
          <CloseIcon className="size-4" />
        </button>
      </header>

      <div className="mt-4 space-y-4 text-xs">
        {/* 1. Composite Score Card */}
        <div className="grid grid-cols-3 gap-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Composite Risk</p>
            <p className="tabnum mt-1 text-xl font-black text-red-700">
              {assessment.compositeScore.toFixed(1)}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Population</p>
            <p className="tabnum mt-1 text-base font-bold text-slate-900">
              {h.population.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-slate-500">{h.households} households</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confidence</p>
            <p className="tabnum mt-1 text-base font-bold text-slate-900">
              {Math.round(assessment.confidenceScore * 100)}%
            </p>
            <p className="text-[10px] text-slate-500">Verified</p>
          </div>
        </div>

        {/* 2. DECISION EXPLANATION: WHY THIS HABITATION IS PRIORITIZED */}
        <div className="rounded-xl border border-red-200 bg-red-50/40 p-3.5">
          <div className="flex items-center gap-1.5 text-red-700">
            <AlertTriangleIcon className="size-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Why This Habitation Is Prioritized
            </h3>
          </div>
          <p className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-900">
            {assessment.explanation.headline}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
            {assessment.explanation.primaryDriverText}
          </p>
          <p className="mt-1.5 text-[11px] font-semibold text-red-800">
            {assessment.explanation.urgencyJustification}
          </p>
        </div>

        {/* 3. Demographic Vulnerability Breakdown */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Demographic Vulnerability Cohort</p>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 text-[11px]">
            <div>
              Below Poverty Line: <span className="tabnum font-bold text-slate-900">{h.demographics.belowPovertyLine}</span>
            </div>
            <div>
              Elderly (60+ yrs): <span className="tabnum font-bold text-slate-900">{h.demographics.elderly}</span>
            </div>
            <div>
              Children (&lt;10 yrs): <span className="tabnum font-bold text-slate-900">{h.demographics.children}</span>
            </div>
            <div>
              Persons w/ Disabilities: <span className="tabnum font-bold text-slate-900">{h.demographics.pwd}</span>
            </div>
          </div>
        </div>

        {/* 4. Critical Infrastructure Isolation Audit */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Critical Infrastructure Status</p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 bg-white shadow-2xs">
              {h.infrastructure.allWeatherRoad ? (
                <CheckIcon className="size-3.5 text-emerald-600" />
              ) : (
                <CloseIcon className="size-3.5 text-red-600" />
              )}
              <span className={h.infrastructure.allWeatherRoad ? 'text-slate-800' : 'font-semibold text-red-700'}>
                All-Weather Road
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 bg-white shadow-2xs">
              {h.infrastructure.healthSubCentre ? (
                <CheckIcon className="size-3.5 text-emerald-600" />
              ) : (
                <CloseIcon className="size-3.5 text-red-600" />
              )}
              <span className={h.infrastructure.healthSubCentre ? 'text-slate-800' : 'font-semibold text-red-700'}>
                Health Sub-Centre
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 bg-white shadow-2xs">
              {h.infrastructure.pipedWater ? (
                <CheckIcon className="size-3.5 text-emerald-600" />
              ) : (
                <CloseIcon className="size-3.5 text-red-600" />
              )}
              <span className="text-slate-800">Piped Water</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 bg-white shadow-2xs">
              {h.infrastructure.mobileCoverage ? (
                <CheckIcon className="size-3.5 text-emerald-600" />
              ) : (
                <CloseIcon className="size-3.5 text-red-600" />
              )}
              <span className="text-slate-800">Telecom</span>
            </div>
          </div>
        </div>

        {/* 5. Historical Events */}
        {h.history && h.history.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Historical Recurrence Log</p>
            <div className="space-y-1.5">
              {h.history.map((evt) => (
                <div
                  key={evt.id}
                  className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-slate-900">
                      {evt.year} · {evt.type.toUpperCase()}
                    </span>
                    <span className="tabnum text-[10px] font-semibold text-red-700">
                      {evt.casualties} casualties · {evt.displaced} displaced
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-600">{evt.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Collapsible Advanced Details: Multi-Factor Weights & Geotechnical Proof */}
        <details className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 group">
          <summary className="text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none flex items-center justify-between">
            <span>Advanced Geotechnical & Mathematical Proof</span>
            <span className="text-xs text-sky-700 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          
          <div className="mt-3 space-y-3 pt-2 border-t border-slate-200">
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Risk Factor Contribution Model</p>
                <span className="text-[10px] text-slate-400 font-mono">
                  S = Σ wi · Si
                </span>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/90 text-[10px] uppercase font-semibold text-slate-600">
                    <tr>
                      <th className="px-2.5 py-1.5">Factor</th>
                      <th className="px-2 py-1.5 text-right">Score</th>
                      <th className="px-2 py-1.5 text-right">Weight</th>
                      <th className="px-2.5 py-1.5 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(assessment.factors).map(([factorKey, f]) => (
                      <tr key={factorKey} className="hover:bg-slate-50/60">
                        <td className="px-2.5 py-1.5 font-medium capitalize text-slate-900">
                          {factorKey}
                        </td>
                        <td className="tabnum px-2 py-1.5 text-right font-semibold text-slate-800">
                          {f.raw}
                        </td>
                        <td className="tabnum px-2 py-1.5 text-right text-slate-500">
                          {Math.round(f.weight * 100)}%
                        </td>
                        <td className="tabnum px-2.5 py-1.5 text-right font-bold text-sky-700">
                          +{f.weightedContribution.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <dl className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-1">
              <KeyValue label="Terrain Slope Gradient" mono value={`${h.slopeDeg}° (${h.slopeDeg > 30 ? 'Extreme Hazard' : 'Moderate'})`} />
              <KeyValue label="Terrace Elevation" mono value={`${h.elevationM} m MSL`} />
              <KeyValue label="Distance to River Scour" mono value={`${h.distanceToRiverKm} km`} />
              <KeyValue label="Last Field Geotechnical Survey" mono value={h.lastSurvey} />
            </dl>
          </div>
        </details>

        {/* 7. Operational Authority Action Buttons */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <Link
            className={buttonStyles({ className: 'w-full', size: 'md', variant: 'primary' })}
            href={`/relocation?habitationId=${h.id}`}
          >
            Find Relocation Options →
          </Link>
          <Link
            className={buttonStyles({ className: 'w-full', size: 'sm', variant: 'secondary' })}
            href={`/map?selected=${h.id}`}
          >
            <MapPinIcon className="size-3.5" />
            View on GIS Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
