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
      <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="relative min-w-[200px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Filter relocation candidate sites by name or block"
            className="h-8.5 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-8.5 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:outline-none"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search site name, code, block..."
            value={searchQuery}
          />
        </div>

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

        <select
          aria-label="Filter by capacity status"
          className="h-8.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-cyan-500 focus:outline-none font-medium"
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
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-3.5 py-2.5">Site Name & District</th>
                <th className="px-3.5 py-2.5 text-right">Land Area</th>
                <th className="px-3.5 py-2.5 text-right">Nominal Cap</th>
                <th className="px-3.5 py-2.5 text-right">Occupied</th>
                <th className="px-3.5 py-2.5 text-right">Available Headroom</th>
                <th className="px-3.5 py-2.5">Utilization</th>
                <th className="px-3.5 py-2.5">Limiting Factor</th>
                <th className="px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSites.length === 0 ? (
                <tr>
                  <td
                    className="p-8 text-center text-xs text-slate-500"
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
                      aria-label={`Select ${site.name} candidate site assessment`}
                      aria-pressed={isSelected}
                      className={`cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-inset ${
                        isSelected
                          ? 'bg-blue-50/80 font-medium ring-1 ring-inset ring-blue-300'
                          : 'hover:bg-slate-50/80'
                      }`}
                      onClick={() => onSelect(site, capacity)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelect(site, capacity);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <td className="px-3.5 py-2.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{site.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {site.id} · {site.block} Block, {site.district}
                          </span>
                        </div>
                      </td>

                      <td className="tabnum px-3.5 py-2.5 text-right font-medium text-slate-800">
                        {site.areaHectares} ha
                      </td>

                      <td className="tabnum px-3.5 py-2.5 text-right font-medium text-slate-800">
                        {capacity.nominalCapacity.toLocaleString('en-IN')}
                      </td>

                      <td className="tabnum px-3.5 py-2.5 text-right text-slate-500">
                        {capacity.currentOccupancy.toLocaleString('en-IN')}
                      </td>

                      <td className="tabnum px-3.5 py-2.5 text-right font-bold text-emerald-700">
                        {capacity.availableHeadroom.toLocaleString('en-IN')}
                        <span className="block text-[10px] font-normal text-slate-500">
                          of {capacity.effectiveCapacity} eff
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5" style={{ minWidth: '120px' }}>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="tabnum font-bold text-slate-900">{capacity.utilizationPercent}%</span>
                            <span className="text-slate-500 font-mono">{capacity.occupancyBuffer * 100}% buf</span>
                          </div>
                          <MetricBar
                            max={100}
                            tone={tone}
                            value={capacity.utilizationPercent}
                          />
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5">
                        <div className="flex flex-col text-[11px]">
                          <span className="font-semibold capitalize text-amber-700">
                            {capacity.limitingFactor}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {capacity.limitingFactorLabel}
                          </span>
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5">
                        <StatusPill tone={tone}>{capacity.capacityStatus}</StatusPill>
                      </td>

                      <td className="px-3.5 py-2.5">
                        <ProvenanceTag value={site.provenance} />
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
