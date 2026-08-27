import { KpiCard } from '@/components/ui/kpi-card';
import { ShieldAlertIcon } from '@/components/ui/icons';

export interface HabitationKpiSummaryProps {
  totalHabitations: number;
  criticalHabitations: number;
  immediateRelocation: number;
  shortTermRelocation: number;
  mediumTermRelocation: number;
  populationAtRisk: number;
}

export function HabitationKpiSummary({
  criticalHabitations,
  immediateRelocation,
  populationAtRisk,
  shortTermRelocation,
  totalHabitations,
}: HabitationKpiSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <KpiCard
        context="Multi-hazard assessed settlements"
        label="Assessed Habitations"
        status="Active Scope"
        tone="neutral"
        unit="villages"
        value={String(totalHabitations)}
      />

      <KpiCard
        context="Composite risk score ≥ 80"
        icon={<ShieldAlertIcon className="size-4 text-[var(--critical)]" />}
        label="Critical Priority"
        status="Action Required"
        tone="critical"
        unit="settlements"
        value={String(criticalHabitations)}
      />

      <KpiCard
        context="Mandatory window: 0–6 months"
        label="Immediate Relocation"
        status="Urgent"
        tone="critical"
        unit="clusters"
        value={String(immediateRelocation)}
      />

      <KpiCard
        context="Planned window: 6–18 months"
        label="Short-Term Relocation"
        status="Planning"
        tone="high"
        unit="clusters"
        value={String(shortTermRelocation)}
      />

      <KpiCard
        context="Residents in high-risk zones"
        label="Population at Risk"
        status="Priority Cohort"
        tone="critical"
        unit="persons"
        value={populationAtRisk.toLocaleString('en-IN')}
      />
    </div>
  );
}
