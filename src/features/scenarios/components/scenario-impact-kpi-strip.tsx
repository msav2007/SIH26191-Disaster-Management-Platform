import type { ScenarioImpactSummary } from '@/server/scenarios/scenario-types';

export interface ScenarioImpactKpiStripProps {
  summary: ScenarioImpactSummary;
}

export function ScenarioImpactKpiStrip({ summary }: ScenarioImpactKpiStripProps) {
  const {
    additionalPopulationAtRisk,
    additionalRelocationDemand,
    baselineCriticalHabitations,
    baselineImmediateRelocations,
    capacityDeficit,
    newlyCriticalHabitations,
    newlyImmediateRelocations,
    scenarioCriticalHabitations,
    scenarioImmediateRelocations,
    totalAvailableRelocationHeadroom,
    totalHabitationsEscalated,
  } = summary;

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
      {/* 1. Habitations Escalated */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition-all hover:border-slate-300">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Escalated Settlements
        </p>
        <p className="tabnum mt-1 text-xl font-black text-sky-700">
          {totalHabitationsEscalated}
        </p>
        <p className="text-[10px] text-slate-500 font-medium">
          {totalHabitationsEscalated > 0 ? `${totalHabitationsEscalated} of ${summary.totalHabitationsEvaluated} escalated` : 'All at baseline level'}
        </p>
      </div>

      {/* 2. Critical Settlements Shift */}
      <div className="rounded-xl border border-red-200 bg-red-50/40 p-3.5 shadow-xs transition-all hover:border-red-300">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-red-800">
          Critical Tiers
        </p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="tabnum text-xl font-black text-red-700">
            {baselineCriticalHabitations} → {scenarioCriticalHabitations}
          </span>
          {newlyCriticalHabitations > 0 && (
            <span className="tabnum text-xs font-bold text-red-600">(+{newlyCriticalHabitations})</span>
          )}
        </div>
        <p className="text-[10px] text-red-600">
          {newlyCriticalHabitations > 0 ? `+${newlyCriticalHabitations} newly critical` : 'No new critical habitations'}
        </p>
      </div>

      {/* 3. Immediate Relocation Shift */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 shadow-xs transition-all hover:border-amber-300">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
          Immediate Relocation (0–6mo)
        </p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="tabnum text-xl font-black text-amber-700">
            {baselineImmediateRelocations} → {scenarioImmediateRelocations}
          </span>
          {newlyImmediateRelocations > 0 && (
            <span className="tabnum text-xs font-bold text-amber-600">(+{newlyImmediateRelocations})</span>
          )}
        </div>
        <p className="text-[10px] text-amber-700">
          {newlyImmediateRelocations > 0 ? `+${newlyImmediateRelocations} immediate mandate` : 'No urgent escalation'}
        </p>
      </div>

      {/* 4. Population at Elevated Risk */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition-all hover:border-slate-300">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Elevated Pop. at Risk
        </p>
        <p className="tabnum mt-1 text-xl font-black text-slate-900">
          +{additionalPopulationAtRisk.toLocaleString('en-IN')}
        </p>
        <p className="text-[10px] text-slate-500">
          {additionalPopulationAtRisk > 0 ? 'Residents entering high tiers' : 'Zero additional risk exposure'}
        </p>
      </div>

      {/* 5. Additional Relocation Demand */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition-all hover:border-slate-300">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Immediate Reloc. Demand
        </p>
        <p className="tabnum mt-1 text-xl font-black text-slate-900">
          {additionalRelocationDemand.toLocaleString('en-IN')}
        </p>
        <p className="text-[10px] text-slate-500">
          {additionalRelocationDemand > 0 ? 'Newly displaced residents' : 'Baseline demand sufficient'}
        </p>
      </div>

      {/* 6. Net Absorption Headroom / Deficit */}
      <div
        className={`rounded-xl border p-3.5 shadow-xs transition-all ${
          capacityDeficit > 0
            ? 'border-red-200 bg-red-50/40 hover:border-red-300'
            : 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-300'
        }`}
      >
        <p
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            capacityDeficit > 0 ? 'text-red-800' : 'text-emerald-800'
          }`}
        >
          Relocation Headroom
        </p>
        <p
          className={`tabnum mt-1 text-xl font-black ${
            capacityDeficit > 0 ? 'text-red-700' : 'text-emerald-700'
          }`}
        >
          {totalAvailableRelocationHeadroom.toLocaleString('en-IN')}
        </p>
        <p
          className={`text-[10px] font-medium ${
            capacityDeficit > 0 ? 'text-red-600' : 'text-emerald-700'
          }`}
        >
          {capacityDeficit > 0
            ? `${capacityDeficit.toLocaleString('en-IN')} person deficit`
            : 'Sufficient safe headroom'}
        </p>
      </div>
    </div>
  );
}
