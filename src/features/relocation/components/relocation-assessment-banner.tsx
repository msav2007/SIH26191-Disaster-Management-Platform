import Link from 'next/link';

import type { HabitationRelocationPlan } from '@/server/relocation/matching-engine';
import { getPriorityTone } from '@/server/classification/classification-engine';
import { Badge } from '@/components/ui/badge';
import { buttonStyles } from '@/components/ui/button';
import { AlertTriangleIcon, MapPinIcon } from '@/components/ui/icons';
import { StatusPill } from '@/components/ui/status-pill';

export interface RelocationAssessmentBannerProps {
  plan: HabitationRelocationPlan;
}

export function RelocationAssessmentBanner({ plan }: RelocationAssessmentBannerProps) {
  const { decisionExplanation, habitation: h, riskAssessment, unabsorbedPopulation } = plan;

  const tone = getPriorityTone(riskAssessment.priority);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              RELOCATION ASSESSMENT
            </span>
            <StatusPill tone={tone}>{riskAssessment.priority} PRIORITY ({riskAssessment.urgencyWindow})</StatusPill>
            <Badge variant={h.primaryHazard === 'landslide' ? 'amber' : 'teal'}>
              {h.primaryHazard}
            </Badge>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Habitation: {h.name}
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            {h.id} · {h.block} Block, {h.district}, {h.state}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Composite Risk</p>
            <p className="tabnum text-base font-black text-red-700">
              {riskAssessment.compositeScore.toFixed(1)}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Population Requiring Relocation</p>
            <p className="tabnum text-base font-bold text-slate-900">
              {h.population.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-slate-400">
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

      <div className="mt-3.5 grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
          <p className="font-semibold text-slate-900">{decisionExplanation.headline}</p>
          <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">{decisionExplanation.rationaleText}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex items-center gap-1.5 text-sky-800">
            <AlertTriangleIcon className="size-3.5 shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[10px]">
              Absorption Feasibility Status
            </span>
          </div>
          <p className="mt-1 text-[11px] font-medium text-slate-900">
            {unabsorbedPopulation === 0 ? (
              <span className="text-emerald-700 font-semibold">
                Fully feasible: Candidate site absorbs 100% of the {h.population} displaced residents.
              </span>
            ) : (
              <span className="text-amber-800 font-semibold">
                Partial absorption: Deficit of {unabsorbedPopulation.toLocaleString('en-IN')} residents requires auxiliary phase or secondary parcel.
              </span>
            )}
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            {decisionExplanation.statutoryMandate}
          </p>
        </div>
      </div>
    </div>
  );
}
