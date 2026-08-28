'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import type { HabitationWithRisk } from '@/server/risk/risk-service';
import { Badge } from '@/components/ui/badge';
import { MetricBar } from '@/components/ui/metric-bar';
import { ProvenanceTag } from '@/components/ui/provenance-tag';
import { SearchIcon, ChevronRightIcon } from '@/components/ui/icons';
import { StatusPill } from '@/components/ui/status-pill';

export interface HabitationPrioritizationTableProps {
  items: HabitationWithRisk[];
  selectedId: string | null;
  onSelect: (item: HabitationWithRisk) => void;
}

const PRIORITY_ORDER: Record<string, number> = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
};

export function HabitationPrioritizationTable({
  items,
  onSelect,
  selectedId,
}: HabitationPrioritizationTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [hazardFilter, setHazardFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [timelineFilter, setTimelineFilter] = useState('all');

  // Extract unique filter options
  const districts = useMemo(() => {
    const set = new Set(items.map((i) => i.habitation.district));
    return Array.from(set).sort();
  }, [items]);

  const hazards = useMemo(() => {
    const set = new Set(items.map((i) => i.habitation.primaryHazard));
    return Array.from(set).sort();
  }, [items]);

  // Filter and Sort
  const filteredItems = useMemo(() => {
    return items
      .filter(({ assessment, habitation: h }) => {
        if (districtFilter !== 'all' && h.district.toLowerCase() !== districtFilter.toLowerCase()) {
          return false;
        }
        if (hazardFilter !== 'all' && h.primaryHazard !== hazardFilter) {
          return false;
        }
        if (priorityFilter !== 'all' && assessment.priority !== priorityFilter) {
          return false;
        }
        if (timelineFilter !== 'all' && assessment.timeline !== timelineFilter) {
          return false;
        }
        if (searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase();
          const match =
            h.name.toLowerCase().includes(q) ||
            h.id.toLowerCase().includes(q) ||
            h.block.toLowerCase().includes(q) ||
            h.district.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Operational Urgency first, Composite Score second
        const prioDiff =
          (PRIORITY_ORDER[a.assessment.priority] ?? 9) -
          (PRIORITY_ORDER[b.assessment.priority] ?? 9);
        if (prioDiff !== 0) return prioDiff;
        return b.assessment.compositeScore - a.assessment.compositeScore;
      });
  }, [items, districtFilter, hazardFilter, priorityFilter, timelineFilter, searchQuery]);

  return (
    <div className="flex flex-col space-y-4">
      {/* 1. Quick Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
            priorityFilter === 'all' && hazardFilter === 'all' && timelineFilter === 'all'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
          onClick={() => {
            setPriorityFilter('all');
            setHazardFilter('all');
            setTimelineFilter('all');
          }}
          type="button"
        >
          All Settlements ({items.length})
        </button>

        <button
          className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
            priorityFilter === 'CRITICAL'
              ? 'bg-red-700 text-white shadow-xs'
              : 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
          }`}
          onClick={() => setPriorityFilter(priorityFilter === 'CRITICAL' ? 'all' : 'CRITICAL')}
          type="button"
        >
          Critical Priority ({items.filter((i) => i.assessment.priority === 'CRITICAL').length})
        </button>

        <button
          className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
            timelineFilter === 'immediate'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
          onClick={() => setTimelineFilter(timelineFilter === 'immediate' ? 'all' : 'immediate')}
          type="button"
        >
          Immediate Relocation (0–6 mo)
        </button>

        <button
          className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
            hazardFilter === 'landslide'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
          onClick={() => setHazardFilter(hazardFilter === 'landslide' ? 'all' : 'landslide')}
          type="button"
        >
          Landslide Risk
        </button>

        <button
          className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
            hazardFilter === 'flood'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
          onClick={() => setHazardFilter(hazardFilter === 'flood' ? 'all' : 'flood')}
          type="button"
        >
          Flood Inundation
        </button>
      </div>

      {/* 2. Detailed Filter Dropdowns Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
        {/* Search */}
        <div className="relative min-w-[220px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Filter habitations by settlement name or code"
            className="h-8.5 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-8.5 pr-3 text-xs text-slate-900 placeholder:text-slate-400 transition-colors focus:border-cyan-500 focus:bg-white focus:outline-none"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settlement, code, district..."
            value={searchQuery}
          />
        </div>

        {/* District Filter */}
        <select
          aria-label="Filter by district"
          className="h-8.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-cyan-500 focus:outline-none font-medium"
          onChange={(e) => setDistrictFilter(e.target.value)}
          value={districtFilter}
        >
          <option value="all">All Districts ({districts.length})</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Hazard Filter */}
        <select
          aria-label="Filter by primary hazard"
          className="h-8.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-cyan-500 focus:outline-none font-medium"
          onChange={(e) => setHazardFilter(e.target.value)}
          value={hazardFilter}
        >
          <option value="all">All Hazards</option>
          {hazards.map((hz) => (
            <option key={hz} value={hz}>
              {hz.replace('_', ' ').toUpperCase()}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          aria-label="Filter by priority classification"
          className="h-8.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-cyan-500 focus:outline-none font-medium"
          onChange={(e) => setPriorityFilter(e.target.value)}
          value={priorityFilter}
        >
          <option value="all">All Priorities</option>
          <option value="CRITICAL">Critical (Immediate)</option>
          <option value="HIGH">High (Short-Term)</option>
          <option value="MEDIUM">Medium (Medium-Term)</option>
          <option value="LOW">Low (Monitoring)</option>
        </select>

        {/* Timeline Filter */}
        <select
          aria-label="Filter by relocation timeline"
          className="h-8.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-cyan-500 focus:outline-none font-medium"
          onChange={(e) => setTimelineFilter(e.target.value)}
          value={timelineFilter}
        >
          <option value="all">All Windows</option>
          <option value="immediate">0–6 Months (Immediate)</option>
          <option value="short_term">6–18 Months (Short-Term)</option>
          <option value="medium_term">18–36 Months (Medium-Term)</option>
          <option value="monitoring">Surveillance (Monitoring)</option>
        </select>
      </div>

      {/* 3. Table Content */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-3.5 py-2.5">Habitation Name & District</th>
                <th className="px-3.5 py-2.5">Hazard Drivers</th>
                <th className="px-3.5 py-2.5 text-right">Population</th>
                <th className="px-3.5 py-2.5">Composite Risk</th>
                <th className="px-3.5 py-2.5">Priority & Window</th>
                <th className="px-3.5 py-2.5">Vulnerability Gaps</th>
                <th className="px-3.5 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    className="p-8 text-center text-xs text-slate-500"
                    colSpan={7}
                  >
                    No habitations found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const { assessment, habitation: h } = item;
                  const isSelected = selectedId === h.id;
                  const tone =
                    assessment.priority === 'CRITICAL'
                      ? 'critical'
                      : assessment.priority === 'HIGH'
                        ? 'high'
                        : assessment.priority === 'MEDIUM'
                          ? 'moderate'
                          : 'neutral';

                  return (
                    <tr
                      key={h.id}
                      aria-label={`Select ${h.name} habitation dossier`}
                      aria-pressed={isSelected}
                      className={`cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-inset ${
                        isSelected
                          ? 'bg-blue-50/80 font-medium ring-1 ring-inset ring-blue-300'
                          : 'hover:bg-slate-50/70'
                      }`}
                      onClick={() => onSelect(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelect(item);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <td className="px-3.5 py-2.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{h.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {h.id} · {h.block} Block, {h.district}
                          </span>
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={h.primaryHazard === 'landslide' ? 'amber' : 'teal'}>
                            {h.primaryHazard}
                          </Badge>
                          {assessment.hazardDrivers.secondary.map((sec) => (
                            <Badge key={sec} variant="outline">
                              +{sec}
                            </Badge>
                          ))}
                        </div>
                      </td>

                      <td className="tabnum px-3.5 py-2.5 text-right font-semibold text-slate-800">
                        {h.population.toLocaleString('en-IN')}
                        <span className="block text-[10px] font-normal text-slate-500">
                          {h.households} HH
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5" style={{ minWidth: '130px' }}>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="tabnum font-bold text-slate-900">
                              {assessment.compositeScore.toFixed(1)}
                            </span>
                            <span className="text-[10px] uppercase text-slate-500">
                              {assessment.riskLevel}
                            </span>
                          </div>
                          <MetricBar
                            max={100}
                            tone={tone}
                            value={assessment.compositeScore}
                          />
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5">
                        <div className="flex flex-col gap-1">
                          <StatusPill tone={tone}>{assessment.priority}</StatusPill>
                          <span className="text-[10px] text-slate-500">
                            {assessment.urgencyWindow}
                          </span>
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5">
                        <div className="flex flex-col text-[10px] text-slate-600">
                          <span>Slope: {h.slopeDeg}°</span>
                          <span>BPL: {h.demographics.belowPovertyLine} residents</span>
                          <span>
                            Road: {h.infrastructure.allWeatherRoad ? 'Paved' : 'Unpaved'}
                          </span>
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5">
                        <Link
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-900 hover:underline"
                          href={`/relocation?habitationId=${h.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Relocate <ChevronRightIcon className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-500">
          <span>
            Showing <strong>{filteredItems.length}</strong> of {items.length} habitations
          </span>
          <div className="flex items-center gap-2">
            <ProvenanceTag value="DEMO DATA" />
            <span className="text-[11px]">
              Sorted by Operational Urgency & Composite Risk Score
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
