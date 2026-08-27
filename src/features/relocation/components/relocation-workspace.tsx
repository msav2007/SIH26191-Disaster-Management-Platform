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
  initialHabitationId?: string | null;
  siteInventory: Array<{
    site: RelocationSite;
    capacity: SiteCapacityAssessment;
  }>;
}

export function RelocationWorkspace({
  initialHabitationId,
  kpis,
  plans,
  siteInventory,
}: RelocationWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'matching' | 'inventory'>('matching');

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
  } | null>(() => siteInventory[0] ?? null);

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
    <div className="space-y-4">
      {/* Top Level Summary KPIs */}
      <RelocationKpiSummaryBar summary={kpis} />

      {/* Main Workspace Navigation & Habitation Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-subtle)]">
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-0.5">
            <button
              className={`rounded-sm px-3 py-1 text-xs font-semibold transition-colors ${
                activeTab === 'matching'
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
              onClick={() => setActiveTab('matching')}
              type="button"
            >
              Habitation Matching
            </button>
            <button
              className={`rounded-sm px-3 py-1 text-xs font-semibold transition-colors ${
                activeTab === 'inventory'
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
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
              <label className="label-xs" htmlFor="habitation-selector">
                Habitation:
              </label>
              <select
                id="habitation-selector"
                aria-label="Select target habitation for relocation matching"
                className="h-8 rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 text-xs font-semibold text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
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

          <ProvenanceTag value="DEMO DATA" />
        </div>

        {activePlan && (
          <div className="flex items-center gap-2">
            <Link
              className={buttonStyles({ size: 'sm', variant: 'secondary' })}
              href="/habitations"
            >
              Habitation Queue
            </Link>
            <Link
              className={buttonStyles({ size: 'sm', variant: 'secondary' })}
              href={`/map?selected=${activePlan.habitation.id}`}
            >
              <MapPinIcon className="size-3.5" />
              View Habitation on GIS
            </Link>
          </div>
        )}
      </div>

      {/* When in matching mode, display the Relocation Assessment Banner */}
      {activeTab === 'matching' && activePlan && (
        <RelocationAssessmentBanner plan={activePlan} />
      )}

      {/* Main Workspace Layout: Comparison / Candidate List + Right Dossier */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Section */}
        <section className="space-y-3 lg:col-span-7 xl:col-span-8">
          {activeTab === 'matching' ? (
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <h3 className="label-xs text-[var(--text)]">
                  Ranked Relocation Candidate Sectors ({allCandidateMatches.length} Evaluated)
                </h3>
                <span className="text-[11px] text-[var(--text-muted)]">
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
              <div className="mb-2.5 flex items-center justify-between">
                <h3 className="label-xs text-[var(--text)]">
                  Candidate Relocation Sites Master Inventory
                </h3>
                <span className="text-[11px] text-[var(--text-muted)]">
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
          className="rounded-sm border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-subtle)] lg:col-span-5 xl:col-span-4"
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
