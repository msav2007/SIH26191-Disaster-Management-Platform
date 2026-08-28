'use client';

import { useState } from 'react';
import Link from 'next/link';

import type { HabitationWithRisk } from '@/server/risk/risk-service';
import { buttonStyles } from '@/components/ui/button';
import { ProvenanceTag } from '@/components/ui/provenance-tag';
import { MapPinIcon, SlidersIcon } from '@/components/ui/icons';
import { HabitationEvidenceDossier } from './habitation-evidence-dossier';
import { HabitationKpiSummary } from './habitation-kpi-summary';
import { HabitationPrioritizationTable } from './habitation-prioritization-table';

export interface HabitationsWorkspaceProps {
  initialSelectedId?: string | null | undefined;
  items: HabitationWithRisk[];
  rollup: {
    totalHabitations: number;
    priorityBreakdown: {
      immediate: number;
      shortTerm: number;
      mediumTerm: number;
      monitor: number;
      critical?: number;
      criticalScoreCount?: number;
    };
    avgCompositeScore: number;
    totalPopulationAtRisk: number;
  };
}

export function HabitationsWorkspace({
  initialSelectedId,
  items,
  rollup,
}: HabitationsWorkspaceProps) {
  const [selectedItem, setSelectedItem] = useState<HabitationWithRisk | null>(() => {
    if (initialSelectedId) {
      const match = items.find((i) => i.habitation.id === initialSelectedId);
      if (match) return match;
    }
    return items[0] ?? null;
  });

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
              State Disaster Management Authority
            </span>
            <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-700 ring-1 ring-sky-600/20">
              RISK ASSESSMENT
            </span>
          </div>
          <h1 className="mt-1 text-lg font-bold text-slate-900">
            Settlement Risk Assessment & Vulnerability Queue
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Multi-hazard risk scoring and vulnerability profiles for habitations across surveyed districts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <ProvenanceTag value="DEMO DATA" />
          <Link className={buttonStyles({ size: 'sm', variant: 'secondary' })} href="/map">
            <MapPinIcon className="size-3.5" />
            GIS Risk Map
          </Link>
          <Link className={buttonStyles({ size: 'sm', variant: 'secondary' })} href="/scenarios">
            <SlidersIcon className="size-3.5" />
            Scenario Simulator
          </Link>
        </div>
      </div>

      {/* 2. Top Level Summary KPIs */}
      <HabitationKpiSummary
        criticalHabitations={rollup.priorityBreakdown.criticalScoreCount ?? rollup.priorityBreakdown.critical ?? rollup.priorityBreakdown.immediate}
        immediateRelocation={rollup.priorityBreakdown.immediate}
        mediumTermRelocation={rollup.priorityBreakdown.mediumTerm ?? 0}
        populationAtRisk={rollup.totalPopulationAtRisk}
        shortTermRelocation={rollup.priorityBreakdown.shortTerm ?? 0}
        totalHabitations={rollup.totalHabitations}
      />

      {/* 3. Main Workspace Layout: Table + Right-Side Dossier */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left Side: Priority Queue Table */}
        <section className="lg:col-span-7 xl:col-span-8">
          <HabitationPrioritizationTable
            items={items}
            onSelect={(item) => setSelectedItem(item)}
            selectedId={selectedItem?.habitation.id ?? null}
          />
        </section>

        {/* Right Side: Authority Evidence Dossier */}
        <aside className="rounded-xl border border-slate-200 bg-white shadow-xs lg:col-span-5 xl:col-span-4" style={{ minHeight: '620px' }}>
          <HabitationEvidenceDossier
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        </aside>
      </div>
    </div>
  );
}
