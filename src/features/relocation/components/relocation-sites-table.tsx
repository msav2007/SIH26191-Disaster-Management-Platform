'use client';

import { useMemo, useState } from 'react';

import type { SiteCapacityAssessment } from '@/server/capacity/capacity-engine';
import type { RelocationSite } from '@/types/domain';
import { SearchIcon } from '@/components/ui/icons';
import { MetricBar } from '@/components/ui/metric-bar';
import { ProvenanceTag } from '@/components/ui/provenance-tag';
import { StatusPill } from '@/components/ui/status-pill';

export interface RelocationSitesTableProps {
  sites: Array<{
    site: RelocationSite;
    capacity: SiteCapacityAssessment;
  }>;
  selectedSiteId: string | null;
  onSelect: (site: RelocationSite, capacity: SiteCapacityAssessment) => void;
}

export function RelocationSitesTable({
  onSelect,
  selectedSiteId,
  sites,
}: RelocationSitesTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const districts = useMemo(() => {
    const set = new Set(sites.map((s) => s.site.district));
    return Array.from(set).sort();
  }, [sites]);

  const filteredSites = useMemo(() => {
    return sites.filter(({ capacity, site }) => {
      if (districtFilter !== 'all' && site.district.toLowerCase() !== districtFilter.toLowerCase()) {
        return false;
      }
      if (statusFilter !== 'all' && capacity.capacityStatus !== statusFilter) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const match =
          site.name.toLowerCase().includes(q) ||
          site.id.toLowerCase().includes(q) ||
          site.district.toLowerCase().includes(q) ||
          site.block.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [sites, districtFilter, statusFilter, searchQuery]);

  return (
    <div className="flex flex-col space-y-3">
      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-sm border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-[var(--shadow-subtle)]">
        <div className="relative min-w-[200px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            aria-label="Filter relocation candidate sites by name or block"
            className="h-8 w-full rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] pl-8 pr-2.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:outline-none"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search site name, code, block..."
            value={searchQuery}
          />
        </div>

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

        <select
          aria-label="Filter by capacity status"
          className="h-8 rounded-sm border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          onChange={(e) => setStatusFilter(e.target.value)}
          value={statusFilter}
        >
          <option value="all">All Capacity Statuses</option>
          <option value="AVAILABLE">Available Room (&gt;500)</option>
          <option value="LIMITED">Limited Room (70–90%)</option>
          <option value="NEAR_CAPACITY">Near Capacity (&gt;90%)</option>
          <option value="FULL">Fully Saturated</option>
          <option value="UNSUITABLE">Unsuitable / Disqualified</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2.5">Site Name & District</th>
                <th className="px-3 py-2.5 text-right">Land Area</th>
                <th className="px-3 py-2.5 text-right">Nominal Cap</th>
                <th className="px-3 py-2.5 text-right">Occupied</th>
                <th className="px-3 py-2.5 text-right">Available Headroom</th>
                <th className="px-3 py-2.5">Utilization</th>
                <th className="px-3 py-2.5">Limiting Factor</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredSites.length === 0 ? (
                <tr>
                  <td
                    className="p-8 text-center text-xs text-[var(--text-muted)]"
                    colSpan={9}
                  >
                    No candidate relocation sites found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSites.map(({ capacity, site }) => {
                  const isSelected = selectedSiteId === site.id;
                  const tone =
                    capacity.capacityStatus === 'AVAILABLE'
                      ? 'safe'
                      : capacity.capacityStatus === 'LIMITED'
                        ? 'moderate'
                        : capacity.capacityStatus === 'NEAR_CAPACITY'
                          ? 'high'
                          : 'critical';

                  return (
                    <tr
                      key={site.id}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[var(--accent-soft)]/50 font-medium'
                          : 'hover:bg-[var(--surface-muted)]'
                      }`}
                      onClick={() => onSelect(site, capacity)}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-[var(--text)]">{site.name}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {site.id} · {site.block} Block, {site.district}
                          </span>
                        </div>
                      </td>

                      <td className="tabnum px-3 py-2.5 text-right font-medium text-[var(--text)]">
                        {site.areaHectares} ha
                      </td>

                      <td className="tabnum px-3 py-2.5 text-right font-medium text-[var(--text)]">
                        {capacity.nominalCapacity.toLocaleString('en-IN')}
                      </td>

                      <td className="tabnum px-3 py-2.5 text-right text-[var(--text-muted)]">
                        {capacity.currentOccupancy.toLocaleString('en-IN')}
                      </td>

                      <td className="tabnum px-3 py-2.5 text-right font-bold text-[var(--safe)]">
                        {capacity.availableHeadroom.toLocaleString('en-IN')}
                        <span className="block text-[10px] font-normal text-[var(--text-muted)]">
                          of {capacity.effectiveCapacity} eff
                        </span>
                      </td>

                      <td className="px-3 py-2.5" style={{ minWidth: '120px' }}>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="tabnum font-bold">{capacity.utilizationPercent}%</span>
                            <span className="text-[var(--text-muted)]">{capacity.occupancyBuffer * 100}% buf</span>
                          </div>
                          <MetricBar
                            max={100}
                            tone={tone}
                            value={capacity.utilizationPercent}
                          />
                        </div>
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="flex flex-col text-[11px]">
                          <span className="font-semibold capitalize text-[var(--high)]">
                            {capacity.limitingFactor}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {capacity.limitingFactorLabel}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2.5">
                        <StatusPill tone={tone}>{capacity.capacityStatus}</StatusPill>
                      </td>

                      <td className="px-3 py-2.5">
                        <ProvenanceTag value={site.provenance} />
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
            Showing <strong>{filteredSites.length}</strong> of {sites.length} candidate sites
          </span>
          <span className="text-[11px]">
            Carrying capacity evaluated with limiting factor constraints and occupancy buffer (0.85)
          </span>
        </footer>
      </div>
    </div>
  );
}
