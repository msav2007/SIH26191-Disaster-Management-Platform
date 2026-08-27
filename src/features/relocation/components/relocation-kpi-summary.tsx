import { KpiCard } from '@/components/ui/kpi-card';
import { BuildingIcon } from '@/components/ui/icons';
import type { RelocationKpiSummary } from '@/server/relocation/relocation-service';

export interface RelocationKpiProps {
  summary: RelocationKpiSummary;
}

export function RelocationKpiSummaryBar({ summary }: RelocationKpiProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        context="Surveyed candidate sectors"
        icon={<BuildingIcon className="size-4 text-[var(--accent-strong)]" />}
        label="Candidate Sites"
        status="Surveyed Scope"
        tone="neutral"
        unit="sites"
        value={String(summary.totalCandidateSites)}
      />

      <KpiCard
        context="Structural planned ceiling"
        label="Total Nominal Capacity"
        status="Gross Ceiling"
        tone="neutral"
        unit="persons"
        value={summary.totalNominalCapacity.toLocaleString('en-IN')}
      />

      <KpiCard
        context="Effective net absorption capacity"
        label="Available Headroom"
        status="Net Available"
        tone="safe"
        unit="persons"
        value={summary.totalAvailableHeadroom.toLocaleString('en-IN')}
      />

      <KpiCard
        context="Sites at >= 70% utilization"
        label="Sites Near Capacity"
        status={summary.sitesNearCapacity > 0 ? 'Limited Room' : 'Optimal Room'}
        tone={summary.sitesNearCapacity > 0 ? 'moderate' : 'safe'}
        unit="sites"
        value={String(summary.sitesNearCapacity)}
      />

      <KpiCard
        context="Parcels missing field audit"
        label="Sites Requiring Data"
        status={summary.sitesRequiringData > 0 ? 'Data Needed' : 'Field Verified'}
        tone={summary.sitesRequiringData > 0 ? 'critical' : 'safe'}
        unit="unverified"
        value={String(summary.sitesRequiringData)}
      />

      <KpiCard
        context="Vulnerable settlements in queue"
        label="Priority Habitations"
        status={`${summary.immediateRelocationHabitations} Immediate`}
        tone="critical"
        unit="settlements"
        value={String(summary.totalHabitationsRequiringRelocation)}
      />
    </div>
  );
}
