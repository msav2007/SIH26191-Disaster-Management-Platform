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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {/* 1. Habitations Escalated */}
      <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xs">
        <p className="label-xs">Escalated Settlements</p>
        <p className="tabnum mt-1 text-xl font-black text-[var(--accent-strong)]">
          {totalHabitationsEscalated}
        </p>
        <p className="text-[10px] text-[var(--text-muted)]">of {summary.totalHabitationsEvaluated} assessed</p>
      </div>

      {/* 2. Critical Settlements Shift */}
      <div className="rounded-sm border border-[var(--critical-border)] bg-[var(--critical-soft)] p-3 shadow-xs">
        <p className="label-xs text-[var(--critical)]">Critical Tiers</p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="tabnum text-xl font-black text-[var(--critical)]">{scenarioCriticalHabitations}</span>
          <span className="tabnum text-xs font-bold text-[var(--critical)]">(+{newlyCriticalHabitations})</span>
        </div>
        <p className="text-[10px] text-[var(--critical)]">was {baselineCriticalHabitations} in baseline</p>
      </div>

      {/* 3. Immediate Relocation Shift */}
      <div className="rounded-sm border border-[var(--high-border)] bg-[var(--high-soft)] p-3 shadow-xs">
        <p className="label-xs text-[var(--high)]">Immediate Relocation (0–6mo)</p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="tabnum text-xl font-black text-[var(--high)]">{scenarioImmediateRelocations}</span>
          <span className="tabnum text-xs font-bold text-[var(--high)]">(+{newlyImmediateRelocations})</span>
        </div>
        <p className="text-[10px] text-[var(--high)]">was {baselineImmediateRelocations} in baseline</p>
      </div>

      {/* 4. Population at Elevated Risk */}
      <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xs">
        <p className="label-xs">Elevated Pop. at Risk</p>
        <p className="tabnum mt-1 text-xl font-bold text-[var(--text)]">
          +{additionalPopulationAtRisk.toLocaleString('en-IN')}
        </p>
        <p className="text-[10px] text-[var(--text-muted)]">residents in escalated tiers</p>
      </div>

      {/* 5. Additional Relocation Demand */}
      <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xs">
        <p className="label-xs">Immediate Reloc. Demand</p>
        <p className="tabnum mt-1 text-xl font-bold text-[var(--text)]">
          {additionalRelocationDemand.toLocaleString('en-IN')}
        </p>
        <p className="text-[10px] text-[var(--text-muted)]">immediate absorption demand</p>
      </div>

      {/* 6. Net Absorption Headroom / Deficit */}
      <div
        className={`rounded-sm border p-3 shadow-xs ${
          capacityDeficit > 0
            ? 'border-[var(--critical-border)] bg-[var(--critical-soft)]'
            : 'border-[var(--safe-border)] bg-[var(--safe-soft)]'
        }`}
      >
        <p className="label-xs">Relocation Headroom</p>
        <p className="tabnum mt-1 text-xl font-black text-[var(--safe)]">
          {totalAvailableRelocationHeadroom.toLocaleString('en-IN')}
        </p>
        <p className="text-[10px] text-[var(--text-muted)]">
          {capacityDeficit > 0 ? `${capacityDeficit} deficit` : 'Sufficient headroom'}
        </p>
      </div>
    </div>
  );
}
