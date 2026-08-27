import Link from 'next/link';

import type { HabitationRelocationPlan } from '@/server/relocation/matching-engine';
import { Badge } from '@/components/ui/badge';
import { buttonStyles } from '@/components/ui/button';
import { AlertTriangleIcon, MapPinIcon } from '@/components/ui/icons';
import { StatusPill } from '@/components/ui/status-pill';

export interface RelocationAssessmentBannerProps {
  plan: HabitationRelocationPlan;
}

export function RelocationAssessmentBanner({ plan }: RelocationAssessmentBannerProps) {
  const { decisionExplanation, habitation: h, riskAssessment, unabsorbedPopulation } = plan;

  const tone =
    h.priority === 'CRITICAL'
      ? 'critical'
      : h.priority === 'HIGH'
        ? 'high'
        : h.priority === 'MEDIUM'
          ? 'moderate'
          : 'neutral';

  return (
    <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-subtle)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              RELOCATION ASSESSMENT
            </span>
            <StatusPill tone={tone}>{h.priority} PRIORITY ({riskAssessment.urgencyWindow})</StatusPill>
            <Badge variant={h.primaryHazard === 'landslide' ? 'amber' : 'teal'}>
              {h.primaryHazard}
            </Badge>
          </div>
          <h2 className="text-base font-bold text-[var(--text)]">
            Habitation: {h.name}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {h.id} · {h.block} Block, {h.district}, {h.state}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right">
            <p className="label-xs">Composite Risk</p>
            <p className="tabnum text-base font-black text-[var(--critical)]">
              {riskAssessment.compositeScore.toFixed(1)}
              <span className="text-xs font-normal text-[var(--text-muted)]">/100</span>
            </p>
          </div>

          <div className="text-right">
            <p className="label-xs">Population Requiring Relocation</p>
            <p className="tabnum text-base font-bold text-[var(--text)]">
              {h.population.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-[var(--text-muted)]">
                ({h.households} HH)
              </span>
            </p>
          </div>

          <Link
            className={buttonStyles({ size: 'sm', variant: 'secondary' })}
            href={`/map?selected=${h.id}`}
          >
            <MapPinIcon className="size-3.5" />
            GIS Coordinates
          </Link>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
        <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2.5">
          <p className="font-semibold text-[var(--text)]">{decisionExplanation.headline}</p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">{decisionExplanation.rationaleText}</p>
        </div>

        <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2.5">
          <div className="flex items-center gap-1.5 text-[var(--accent-strong)]">
            <AlertTriangleIcon className="size-3.5 shrink-0" />
            <span className="font-semibold uppercase tracking-tight text-[10px]">
              Absorption Feasibility Status
            </span>
          </div>
          <p className="mt-1 text-[11px] font-medium text-[var(--text)]">
            {unabsorbedPopulation === 0 ? (
              <span className="text-[var(--safe)]">
                Fully feasible: Candidate site absorbs 100% of the {h.population} displaced residents.
              </span>
            ) : (
              <span className="text-[var(--high)]">
                Partial absorption: Deficit of {unabsorbedPopulation.toLocaleString('en-IN')} residents requires auxiliary phase or secondary parcel.
              </span>
            )}
          </p>
          <p className="mt-1 text-[10px] text-[var(--text-muted)]">
            {decisionExplanation.statutoryMandate}
          </p>
        </div>
      </div>
    </div>
  );
}
