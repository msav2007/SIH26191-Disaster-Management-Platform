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
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-xs text-[var(--text-muted)]">
        <div className="mb-2 size-8 rounded-full border border-dashed border-[var(--border)] p-2">
          📋
        </div>
        <p className="font-semibold text-[var(--text)]">No Habitation Selected</p>
        <p className="mt-1 max-w-[240px]">
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
    <div className="flex h-full flex-col overflow-y-auto p-4 sm:p-5">
      {/* Header */}
      <header className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3.5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={tone}>{assessment.priority} PRIORITY</StatusPill>
            <span className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--text-muted)]">
              Window: {assessment.urgencyWindow}
            </span>
            <ProvenanceTag value={h.provenance} />
          </div>
          <h2 className="text-base font-bold text-[var(--text)]">{h.name}</h2>
          <p className="text-xs text-[var(--text-muted)]">
            {h.id} · {h.block} Block, {h.district}, {h.state}
          </p>
        </div>
        <button
          aria-label="Close evidence dossier"
          className="text-[var(--text-muted)] hover:text-[var(--text)]"
          onClick={onClose}
          type="button"
        >
          <CloseIcon className="size-4" />
        </button>
      </header>

      <div className="mt-4 space-y-4 text-xs">
        {/* Composite Score Card */}
        <div className="grid grid-cols-3 gap-2.5 rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-3">
          <div>
            <p className="label-xs">Composite Risk</p>
            <p className="tabnum mt-1 text-xl font-black text-[var(--critical)]">
              {assessment.compositeScore.toFixed(1)}
              <span className="text-xs font-normal text-[var(--text-muted)]">/100</span>
            </p>
          </div>
          <div>
            <p className="label-xs">Population</p>
            <p className="tabnum mt-1 text-base font-bold text-[var(--text)]">
              {h.population.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">{h.households} households</p>
          </div>
          <div>
            <p className="label-xs">Data Confidence</p>
            <p className="tabnum mt-1 text-base font-bold text-[var(--text)]">
              {Math.round(assessment.confidenceScore * 100)}%
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">Verified Multi-Source</p>
          </div>
        </div>

        {/* DECISION EXPLANATION: WHY THIS HABITATION IS PRIORITIZED */}
        <div className="rounded-sm border border-[var(--critical-border)] bg-[var(--critical-soft)]/60 p-3.5">
          <div className="flex items-center gap-1.5 text-[var(--critical)]">
            <AlertTriangleIcon className="size-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Why This Habitation Is Prioritized
            </h3>
          </div>
          <p className="mt-1.5 text-xs font-medium leading-relaxed text-[var(--text)]">
            {assessment.explanation.headline}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
            {assessment.explanation.primaryDriverText}
          </p>
          <p className="mt-1.5 text-[11px] font-semibold text-[var(--critical)]">
            {assessment.explanation.urgencyJustification}
          </p>
        </div>

        {/* Multi-Criteria Factor Contribution Table */}
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <p className="label-xs">Risk Factor Contribution Model</p>
            <span className="text-[10px] text-[var(--text-muted)]">
              $S = \sum w_i \cdot S_i$
            </span>
          </div>
          <div className="overflow-hidden rounded-sm border border-[var(--border)]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10px] uppercase text-[var(--text-muted)]">
                <tr>
                  <th className="px-2.5 py-1.5 font-bold">Factor</th>
                  <th className="px-2 py-1.5 text-right font-bold">Score</th>
                  <th className="px-2 py-1.5 text-right font-bold">Weight</th>
                  <th className="px-2.5 py-1.5 text-right font-bold">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {Object.entries(assessment.factors).map(([factorKey, f]) => (
                  <tr key={factorKey} className="hover:bg-[var(--surface-muted)]">
                    <td className="px-2.5 py-1.5 font-medium capitalize text-[var(--text)]">
                      {factorKey}
                    </td>
                    <td className="tabnum px-2 py-1.5 text-right font-semibold text-[var(--text)]">
                      {f.raw}
                    </td>
                    <td className="tabnum px-2 py-1.5 text-right text-[var(--text-muted)]">
                      {Math.round(f.weight * 100)}%
                    </td>
                    <td className="tabnum px-2.5 py-1.5 text-right font-bold text-[var(--accent-strong)]">
                      +{f.weightedContribution.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Demographic Vulnerability Breakdown */}
        <div>
          <p className="label-xs mb-1.5">Demographic Vulnerability Cohort</p>
          <div className="grid grid-cols-2 gap-2 rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2.5 text-[11px]">
            <div>
              Below Poverty Line: <span className="tabnum font-bold text-[var(--text)]">{h.demographics.belowPovertyLine}</span>
            </div>
            <div>
              Elderly (60+ yrs): <span className="tabnum font-bold text-[var(--text)]">{h.demographics.elderly}</span>
            </div>
            <div>
              Children (&lt;10 yrs): <span className="tabnum font-bold text-[var(--text)]">{h.demographics.children}</span>
            </div>
            <div>
              Persons w/ Disabilities: <span className="tabnum font-bold text-[var(--text)]">{h.demographics.pwd}</span>
            </div>
          </div>
        </div>

        {/* Critical Infrastructure Isolation Audit */}
        <div>
          <p className="label-xs mb-1.5">Critical Infrastructure Status</p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 rounded-sm border border-[var(--border)] p-1.5">
              {h.infrastructure.allWeatherRoad ? (
                <CheckIcon className="size-3.5 text-[var(--safe)]" />
              ) : (
                <CloseIcon className="size-3.5 text-[var(--critical)]" />
              )}
              <span className={h.infrastructure.allWeatherRoad ? 'text-[var(--text)]' : 'font-semibold text-[var(--critical)]'}>
                All-Weather Road
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-sm border border-[var(--border)] p-1.5">
              {h.infrastructure.healthSubCentre ? (
                <CheckIcon className="size-3.5 text-[var(--safe)]" />
              ) : (
                <CloseIcon className="size-3.5 text-[var(--critical)]" />
              )}
              <span className={h.infrastructure.healthSubCentre ? 'text-[var(--text)]' : 'font-semibold text-[var(--critical)]'}>
                Health Sub-Centre
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-sm border border-[var(--border)] p-1.5">
              {h.infrastructure.pipedWater ? (
                <CheckIcon className="size-3.5 text-[var(--safe)]" />
              ) : (
                <CloseIcon className="size-3.5 text-[var(--critical)]" />
              )}
              <span>Piped Drinking Water</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-sm border border-[var(--border)] p-1.5">
              {h.infrastructure.mobileCoverage ? (
                <CheckIcon className="size-3.5 text-[var(--safe)]" />
              ) : (
                <CloseIcon className="size-3.5 text-[var(--critical)]" />
              )}
              <span>Emergency Telecom</span>
            </div>
          </div>
        </div>

        {/* Historical Disaster Events */}
        {h.history && h.history.length > 0 && (
          <div>
            <p className="label-xs mb-1.5">Historical Recurrence Log</p>
            <div className="space-y-1.5">
              {h.history.map((evt) => (
                <div
                  key={evt.id}
                  className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-2"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-[var(--text)]">
                      {evt.year} · {evt.type.toUpperCase()}
                    </span>
                    <span className="tabnum text-[10px] text-[var(--critical)]">
                      {evt.casualties} casualties · {evt.displaced} displaced
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{evt.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topographic Hazard Metrics */}
        <dl>
          <KeyValue label="Terrain Slope Gradient" mono value={`${h.slopeDeg}° (${h.slopeDeg > 30 ? 'Extreme Hazard' : 'Moderate'})`} />
          <KeyValue label="Terrace Elevation" mono value={`${h.elevationM} m MSL`} />
          <KeyValue label="Distance to River Scour" mono value={`${h.distanceToRiverKm} km`} />
          <KeyValue label="Last Field Geotechnical Survey" mono value={h.lastSurvey} />
        </dl>

        {/* Operational Authority Action Buttons */}
        <div className="space-y-2 border-t border-[var(--border)] pt-3">
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
