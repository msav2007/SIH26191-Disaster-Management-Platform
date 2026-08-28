'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import type { SiteCapacityAssessment } from '@/server/capacity/capacity-engine';
import type {
  CandidateSiteMatchResult,
  HabitationRelocationPlan,
} from '@/server/relocation/matching-engine';
import type { RelocationKpiSummary } from '@/server/relocation/relocation-service';
import type { RelocationSite } from '@/types/domain';
import { buttonStyles } from '@/components/ui/button';
import { MapPinIcon } from '@/components/ui/icons';
import { ProvenanceTag } from '@/components/ui/provenance-tag';
import { RelocationAssessmentBanner } from './relocation-assessment-banner';
import { RelocationKpiSummaryBar } from './relocation-kpi-summary';
import { RelocationRecommendationsList } from './relocation-recommendations-list';
import { RelocationSiteDossier } from './relocation-site-dossier';
import { RelocationSitesTable } from './relocation-sites-table';

export interface RelocationWorkspaceProps {
  plans: HabitationRelocationPlan[];
  kpis: RelocationKpiSummary;
  initialHabitationId?: string | null | undefined;
  initialSiteId?: string | null | undefined;
  siteInventory: Array<{
    site: RelocationSite;
    capacity: SiteCapacityAssessment;
  }>;
}

export function RelocationWorkspace({
  initialHabitationId,
  initialSiteId,
  kpis,
  plans,
  siteInventory,
}: RelocationWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'matching' | 'inventory'>(() => {
    if (initialSiteId) return 'inventory';
    return 'matching';
  });

  // Selected habitation state
  const [selectedHabitationId, setSelectedHabitationId] = useState<string>(() => {
    if (initialHabitationId) {
      const match = plans.find((p) => p.habitation.id === initialHabitationId);
      if (match) return match.habitation.id;
    }
    return plans[0]?.habitation.id ?? '';
  });

  const activePlan = useMemo(() => {
    return plans.find((p) => p.habitation.id === selectedHabitationId) ?? plans[0] ?? null;
  }, [plans, selectedHabitationId]);

  // Selected candidate match in matching mode
  const [selectedMatch, setSelectedMatch] = useState<CandidateSiteMatchResult | null>(() => {
    const p = plans.find((x) => x.habitation.id === (initialHabitationId || plans[0]?.habitation.id));
    return p?.recommendedSite ?? p?.alternativeSites[0] ?? null;
  });

  // Selected site in inventory mode
  const [selectedInventorySite, setSelectedInventorySite] = useState<{
    site: RelocationSite;
    capacity: SiteCapacityAssessment;
  } | null>(() => {
    if (initialSiteId) {
      const match = siteInventory.find((s) => s.site.id === initialSiteId);
      if (match) return match;
    }
    return siteInventory[0] ?? null;
  });

  const handleSelectHabitation = (habId: string) => {
    setSelectedHabitationId(habId);
    setActiveTab('matching');
    const targetPlan = plans.find((p) => p.habitation.id === habId);
    setSelectedMatch(targetPlan?.recommendedSite ?? targetPlan?.alternativeSites[0] ?? null);
  };

  const allCandidateMatches = useMemo(() => {
    if (!activePlan) return [];
    const list: CandidateSiteMatchResult[] = [];
    if (activePlan.recommendedSite) list.push(activePlan.recommendedSite);
    list.push(...activePlan.alternativeSites);
    return list;
  }, [activePlan]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              State Disaster Management Authority
            </span>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-emerald-600/20">
              RELOCATION PLANNING
            </span>
          </div>
          <h1 className="mt-1 text-lg font-bold text-slate-900">
            Relocation Planning &amp; Site Matching
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Match displaced populations from high-risk habitations to safe candidate resettlement sites based on carrying capacity, transit distance, and essential services readiness.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <ProvenanceTag value="DEMO DATA" />
          {activePlan && (
            <Link
              className={buttonStyles({ size: 'sm', variant: 'primary' })}
              href={`/map?selected=${activePlan.habitation.id}`}
              title="Inspect habitation and candidate relocation sites on interactive GIS vector map"
            >
              <MapPinIcon className="size-3.5" />
              Open GIS Risk Map →
            </Link>
          )}
        </div>
      </div>

      {/* 2. Top Level Summary KPIs */}
      <RelocationKpiSummaryBar summary={kpis} />

      {/* 3. Main Workspace Navigation & Habitation Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1">
            <button
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'matching'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('matching')}
              type="button"
            >
              Habitation Matching
            </button>
            <button
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('inventory')}
              type="button"
            >
              Candidate Sites Inventory ({siteInventory.length})
            </button>
          </div>

          {/* Habitation Selector */}
          {activeTab === 'matching' && (
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500" htmlFor="habitation-selector">
                Target Habitation:
              </label>
              <select
                id="habitation-selector"
                aria-label="Select target habitation for relocation matching"
                className="h-8.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                onChange={(e) => handleSelectHabitation(e.target.value)}
                value={selectedHabitationId}
              >
                {plans.map((p) => (
                  <option key={p.habitation.id} value={p.habitation.id}>
                    {p.habitation.name} ({p.habitation.district} · {p.habitation.population} pop · {p.habitation.priority})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {activePlan && (
          <div className="flex items-center gap-2">
            <Link
              className={buttonStyles({ size: 'sm', variant: 'secondary' })}
              href="/habitations"
              title="View all assessed habitations and risk rankings"
            >
              View Risk Queue →
            </Link>
            <Link
              className={buttonStyles({ size: 'sm', variant: 'outline' })}
              href={`/map?selected=${activePlan.habitation.id}`}
              title="Inspect habitation and candidate relocation sites on interactive GIS vector map"
            >
              <MapPinIcon className="size-3.5" />
              View on Map
            </Link>
          </div>
        )}
      </div>

      {/* When in matching mode, display the Relocation Assessment Banner */}
      {activeTab === 'matching' && activePlan && (
        <RelocationAssessmentBanner plan={activePlan} />
      )}

      {/* Main Workspace Layout: Comparison / Candidate List + Right Dossier */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left Section */}
        <section className="space-y-4 lg:col-span-7 xl:col-span-8">
          {activeTab === 'matching' ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Ranked Relocation Candidate Sectors ({allCandidateMatches.length} Evaluated)
                </h3>
                <span className="text-[11px] text-slate-500">
                  Ranked by 10-Factor Suitability & Limiting Headroom
                </span>
              </div>
              <RelocationRecommendationsList
                matches={allCandidateMatches}
                onSelect={(match) => setSelectedMatch(match)}
                selectedSiteId={selectedMatch?.site.id ?? null}
              />
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Candidate Relocation Sites Master Inventory
                </h3>
                <span className="text-[11px] text-slate-500">
                  Evaluated with 10-Dimension Carrying Capacity Engine
                </span>
              </div>
              <RelocationSitesTable
                onSelect={(site, cap) => setSelectedInventorySite({ site, capacity: cap })}
                selectedSiteId={selectedInventorySite?.site.id ?? null}
                sites={siteInventory}
              />
            </div>
          )}
        </section>

        {/* Right Section: Deep Site Dossier */}
        <aside
          className="rounded-xl border border-slate-200 bg-white shadow-xs lg:col-span-5 xl:col-span-4"
          style={{ minHeight: '640px' }}
        >
          {activeTab === 'matching' ? (
            <RelocationSiteDossier
              capacity={selectedMatch?.capacity ?? null}
              onClose={() => setSelectedMatch(null)}
              selectedMatch={selectedMatch}
              selectedSite={selectedMatch?.site ?? null}
              targetHabitationName={activePlan?.habitation.name ?? 'Selected Habitation'}
            />
          ) : (
            <RelocationSiteDossier
              capacity={selectedInventorySite?.capacity ?? null}
              onClose={() => setSelectedInventorySite(null)}
              selectedSite={selectedInventorySite?.site ?? null}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
