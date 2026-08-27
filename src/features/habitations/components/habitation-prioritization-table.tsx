'use client';

import { useMemo, useState } from 'react';

import type { HabitationWithRisk } from '@/server/risk/risk-service';
import { Badge } from '@/components/ui/badge';
import { MetricBar } from '@/components/ui/metric-bar';
import { ProvenanceTag } from '@/components/ui/provenance-tag';
import { SearchIcon } from '@/components/ui/icons';
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
    <div className="flex flex-col space-y-3">
      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-sm border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-[var(--shadow-subtle)]">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            aria-label="Filter habitations by settlement name or code"
            className="h-8 w-full rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] pl-8 pr-2.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:outline-none"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settlement name, code..."
            value={searchQuery}
          />
        </div>

        {/* District Filter */}
        <select
          aria-label="Filter by district"
          className="h-8 rounded-sm border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
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
          className="h-8 rounded-sm border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
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
          className="h-8 rounded-sm border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
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
          className="h-8 rounded-sm border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
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

      {/* Table Content */}
      <div className="overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2.5">Habitation Name & District</th>
                <th className="px-3 py-2.5">Hazard Drivers</th>
                <th className="px-3 py-2.5 text-right">Population</th>
                <th className="px-3 py-2.5">Composite Risk</th>
                <th className="px-3 py-2.5">Priority & Window</th>
                <th className="px-3 py-2.5">Vulnerability Gaps</th>
                <th className="px-3 py-2.5">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    className="p-8 text-center text-xs text-[var(--text-muted)]"
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
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[var(--accent-soft)]/50 font-medium'
                          : 'hover:bg-[var(--surface-muted)]'
                      }`}
                      onClick={() => onSelect(item)}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-[var(--text)]">{h.name}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {h.id} · {h.block} Block, {h.district}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2.5">
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

                      <td className="tabnum px-3 py-2.5 text-right font-semibold text-[var(--text)]">
                        {h.population.toLocaleString('en-IN')}
                        <span className="block text-[10px] font-normal text-[var(--text-muted)]">
                          {h.households} HH
                        </span>
                      </td>

                      <td className="px-3 py-2.5" style={{ minWidth: '130px' }}>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="tabnum font-bold text-[var(--text)]">
                              {assessment.compositeScore.toFixed(1)}
                            </span>
                            <span className="text-[10px] uppercase text-[var(--text-muted)]">
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

                      <td className="px-3 py-2.5">
                        <div className="flex flex-col gap-1">
                          <StatusPill tone={tone}>{assessment.priority}</StatusPill>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {assessment.urgencyWindow}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="flex flex-col text-[10px] text-[var(--text-muted)]">
                          <span>Slope: {h.slopeDeg}°</span>
                          <span>BPL: {h.demographics.belowPovertyLine} residents</span>
                          <span>
                            Road: {h.infrastructure.allWeatherRoad ? 'Paved' : 'Unpaved/No Access'}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2.5">
                        <ProvenanceTag value={h.provenance} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-xs text-[var(--text-muted)]">
          <span>
            Showing <strong>{filteredItems.length}</strong> of {items.length} habitations
          </span>
          <span className="text-[11px]">
            Sorted by Operational Urgency & Composite Multi-Hazard Score
          </span>
        </footer>
      </div>
    </div>
  );
}
