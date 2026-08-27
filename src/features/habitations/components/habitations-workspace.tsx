'use client';

import { useState } from 'react';

import type { HabitationWithRisk } from '@/server/risk/risk-service';
import { HabitationEvidenceDossier } from './habitation-evidence-dossier';
import { HabitationKpiSummary } from './habitation-kpi-summary';
import { HabitationPrioritizationTable } from './habitation-prioritization-table';

export interface HabitationsWorkspaceProps {
  items: HabitationWithRisk[];
  rollup: {
    totalHabitations: number;
    priorityBreakdown: {
      immediate: number;
      shortTerm: number;
      mediumTerm: number;
      monitor: number;
    };
    avgCompositeScore: number;
    totalPopulationAtRisk: number;
  };
}

export function HabitationsWorkspace({ items, rollup }: HabitationsWorkspaceProps) {
  const [selectedItem, setSelectedItem] = useState<HabitationWithRisk | null>(() => items[0] ?? null);

  return (
    <div className="space-y-4">
      {/* Top Level Summary KPIs */}
      <HabitationKpiSummary
        criticalHabitations={rollup.priorityBreakdown.immediate}
        immediateRelocation={rollup.priorityBreakdown.immediate}
        mediumTermRelocation={rollup.priorityBreakdown.mediumTerm}
        populationAtRisk={rollup.totalPopulationAtRisk}
        shortTermRelocation={rollup.priorityBreakdown.shortTerm}
        totalHabitations={rollup.totalHabitations}
      />

      {/* Main Workspace Layout: Table + Right-Side Dossier */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Side: Priority Queue Table */}
        <section className="lg:col-span-7 xl:col-span-8">
          <HabitationPrioritizationTable
            items={items}
            onSelect={(item) => setSelectedItem(item)}
            selectedId={selectedItem?.habitation.id ?? null}
          />
        </section>

        {/* Right Side: Authority Evidence Dossier */}
        <aside className="rounded-sm border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-subtle)] lg:col-span-5 xl:col-span-4" style={{ minHeight: '620px' }}>
          <HabitationEvidenceDossier
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        </aside>
      </div>
    </div>
  );
}
