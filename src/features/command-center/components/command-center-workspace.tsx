'use client';

import Link from 'next/link';

import type { CommandCenterData } from '@/server/command-center/command-center-types';
import { getPriorityTone, getTimelineWindow } from '@/server/classification/classification-engine';
import { buttonStyles } from '@/components/ui/button';
import { StatusPill } from '@/components/ui/status-pill';
import { ProvenanceTag } from '@/components/ui/provenance-tag';
import { MapPinIcon, SlidersIcon, ShieldAlertIcon, ChevronRightIcon } from '@/components/ui/icons';

export interface CommandCenterWorkspaceProps {
  data: CommandCenterData;
}

export function CommandCenterWorkspace({ data }: CommandCenterWorkspaceProps) {
  const { activeScenario, capacityOverview, kpis, priorityQueue } = data;

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Operational Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
              State Disaster Management Authority
            </span>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
              OPERATIONAL
            </span>
          </div>
          <h1 className="mt-1 text-lg font-bold text-slate-900">
            Multi-Hazard Disaster Relocation Command Center
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Real-time situational overview of vulnerable settlements, population risk, and relocation capacity across surveyed districts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <ProvenanceTag value="DEMO DATA" />
          <Link className={buttonStyles({ size: 'sm', variant: 'primary' })} href="/map">
            <MapPinIcon className="size-3.5" />
            GIS Risk Map
          </Link>
          <Link className={buttonStyles({ size: 'sm', variant: 'secondary' })} href="/scenarios">
            <SlidersIcon className="size-3.5" />
            Scenario Simulator
          </Link>
        </div>
      </div>

      {/* 2. Five Compact Operational KPI Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {/* KPI 1: Assessed Settlements */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Assessed Settlements
            </p>
            <span className="size-2 rounded-full bg-slate-400" />
          </div>
          <p className="tabnum mt-2 text-2xl font-black text-slate-900">{kpis.totalAssessedHabitations}</p>
          <p className="mt-1 text-[11px] text-slate-500">Across 6 surveyed districts</p>
        </div>

        {/* KPI 2: Critical Settlements */}
        <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 shadow-xs transition-all hover:border-red-300">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-red-800">
              Critical Status
            </p>
            <span className="size-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          <p className="tabnum mt-2 text-2xl font-black text-red-700">{kpis.criticalHabitationsCount}</p>
          <p className="mt-1 text-[11px] font-medium text-red-600">Immediate moratorium</p>
        </div>

        {/* KPI 3: High Risk / Immediate Relocation */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs transition-all hover:border-amber-300">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
              Immediate Relocation
            </p>
            <span className="size-2 rounded-full bg-amber-500" />
          </div>
          <p className="tabnum mt-2 text-2xl font-black text-amber-700">{kpis.immediateRelocationCount}</p>
          <p className="mt-1 text-[11px] font-medium text-amber-700">0–6 month mandate</p>
        </div>

        {/* KPI 4: Population at Risk */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              People at Risk
            </p>
            <span className="size-2 rounded-full bg-sky-500" />
          </div>
          <p className="tabnum mt-2 text-2xl font-black text-slate-900">
            {kpis.totalPopulationAtRisk.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">High vulnerability residents</p>
        </div>

        {/* KPI 5: Relocation Headroom */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs transition-all hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
              Relocation Headroom
            </p>
            <span className="size-2 rounded-full bg-emerald-500" />
          </div>
          <p className="tabnum mt-2 text-2xl font-black text-emerald-700">
            {kpis.totalAvailableRelocationHeadroom.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-[11px] text-emerald-700">Across {capacityOverview.totalSites} safe sectors</p>
        </div>
      </div>

      {/* 3. Middle Section: Left (Geographic Overview) + Right (Scenario Simulator) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left 7 Cols: Risk Map / Geographic Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <MapPinIcon className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Geographic Risk Overview</h2>
                  <p className="text-[11px] text-slate-500">Spatial runout & vulnerable settlement catchment</p>
                </div>
              </div>
              <Link className="text-xs font-semibold text-sky-700 hover:text-sky-800 hover:underline" href="/map">
                Open Interactive Map →
              </Link>
            </div>

            {/* Geographic Information & Summary */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                  Spatial Bounds
                </span>
                <span className="font-mono text-xs font-bold text-slate-800 mt-1 block">
                  11.55°N, 76.13°E
                </span>
                <span className="text-[10px] text-slate-500">Wayanad & Ghats Sector</span>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                  Active Red Zones
                </span>
                <span className="font-mono text-xs font-bold text-red-700 mt-1 block">
                  3 Statutory Zones
                </span>
                <span className="text-[10px] text-slate-500">High runout risk areas</span>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                  Safe Sectors
                </span>
                <span className="font-mono text-xs font-bold text-emerald-700 mt-1 block">
                  {capacityOverview.totalSites} Relocation Sites
                </span>
                <span className="text-[10px] text-slate-500">Government revenue land</span>
              </div>
            </div>

            {/* Constrained Sectors Preview */}
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-800 mb-2">Relocation Sectors & Limiting Bottlenecks</p>
              <div className="space-y-2">
                {capacityOverview.topConstrainedSites.slice(0, 3).map((site) => (
                  <div
                    key={site.siteId}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2.5 text-xs shadow-2xs hover:border-slate-200"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{site.siteName}</span>
                      <div className="text-[11px] text-amber-700">
                        Constrained by: <span className="font-semibold">{site.limitingFactor}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="tabnum font-bold text-emerald-700">{site.headroom.toLocaleString('en-IN')} available</span>
                      <div className="text-[10px] text-slate-500">{site.utilizationPercent}% utilized</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Projection: WGS84 EPSG:4326</span>
            <Link className={buttonStyles({ size: 'sm', variant: 'secondary' })} href="/map">
              Inspect Spatial Layers →
            </Link>
          </div>
        </div>

        {/* Right 5 Cols: Scenario Simulator Panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                  <SlidersIcon className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Scenario Simulator</h2>
                  <p className="text-[11px] text-slate-500">Climate & stress escalation model</p>
                </div>
              </div>
              <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-[10px] font-bold text-cyan-800 ring-1 ring-cyan-600/20">
                ACTIVE
              </span>
            </div>

            {/* Active Preset Description */}
            <div className="mt-3.5">
              <span className="text-xs font-bold text-slate-900 block">
                {activeScenario.scenario.name}
              </span>
              <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                {activeScenario.scenario.description}
              </p>
            </div>

            {/* Parameter Pills */}
            <div className="mt-3.5 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2 text-xs">
                <span className="text-[10px] text-slate-500 block">Rainfall Multiplier</span>
                <span className="tabnum font-bold text-sky-700 mt-0.5 block">
                  {activeScenario.modifiersApplied.rainfallMultiplier.toFixed(2)}×
                </span>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2 text-xs">
                <span className="text-[10px] text-slate-500 block">Cloudburst Surge</span>
                <span className="tabnum font-bold text-amber-700 mt-0.5 block">
                  +{activeScenario.modifiersApplied.cloudburstSurge} pts
                </span>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2 text-xs">
                <span className="text-[10px] text-slate-500 block">Slope Saturation</span>
                <span className="tabnum font-bold text-red-700 mt-0.5 block">
                  {activeScenario.modifiersApplied.slopeSaturationFactor.toFixed(2)}×
                </span>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2 text-xs">
                <span className="text-[10px] text-slate-500 block">Infra Strain</span>
                <span className="tabnum font-bold text-slate-800 mt-0.5 block">
                  {activeScenario.modifiersApplied.infrastructureStrainMultiplier.toFixed(2)}×
                </span>
              </div>
            </div>

            {/* Impact Highlights */}
            <div className="mt-3.5 rounded-lg border border-cyan-100 bg-cyan-50/50 p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Settlements Escalated:</span>
                <span className="tabnum font-bold text-cyan-900">
                  +{activeScenario.totalHabitationsEscalated}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Newly Critical:</span>
                <span className="tabnum font-bold text-red-700">
                  +{activeScenario.newlyCriticalHabitations}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Elevated Population at Risk:</span>
                <span className="tabnum font-bold text-slate-900">
                  +{activeScenario.additionalPopulationAtRisk.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <Link
              className={`w-full text-center ${buttonStyles({ size: 'sm', variant: 'primary' })}`}
              href="/scenarios"
            >
              <SlidersIcon className="size-3.5" />
              Open Scenario Simulator & Modifiers
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Full Width: Top Priority Settlements Matrix */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlertIcon className="size-4 text-red-600" />
              <h2 className="text-sm font-bold text-slate-900">Top Priority Settlements</h2>
            </div>
            <p className="text-[11px] text-slate-500">
              Ranked by deterministic risk scoring and statutory relocation timelines
            </p>
          </div>
          <Link className="text-xs font-semibold text-sky-700 hover:text-sky-800 hover:underline" href="/habitations">
            View All Habitations ({kpis.totalAssessedHabitations}) →
          </Link>
        </div>

        <div className="mt-3.5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase font-semibold text-slate-600">
              <tr>
                <th className="px-3 py-2.5">#</th>
                <th className="px-3 py-2.5">Settlement</th>
                <th className="px-3 py-2.5">District</th>
                <th className="px-3 py-2.5 text-right">Baseline</th>
                <th className="px-3 py-2.5 text-right">Scenario</th>
                <th className="px-3 py-2.5 text-right">Change</th>
                <th className="px-3 py-2.5">Risk Tier</th>
                <th className="px-3 py-2.5">Timeline</th>
                <th className="px-3 py-2.5 text-right">Population</th>
                <th className="px-3 py-2.5">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {priorityQueue.map((item) => {
                const isCritical = item.priority === 'CRITICAL';
                const scenarioMatch = activeScenario.allHabitations.find(
                  (s) => s.habitation.id === item.habitationId,
                );
                const scenarioScore = scenarioMatch?.scenarioScore ?? item.compositeRiskScore;
                const delta = scenarioMatch?.delta ?? 0;

                return (
                  <tr
                    key={item.habitationId}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      isCritical ? 'bg-red-50/20' : ''
                    }`}
                  >
                    <td className="tabnum px-3 py-2.5 font-mono text-xs font-bold text-slate-500">
                      #{item.rank}
                    </td>
                    <td className="px-3 py-2.5">
                      <Link
                        className="font-bold text-slate-900 hover:text-sky-700 hover:underline"
                        href={`/habitations?selected=${item.habitationId}`}
                      >
                        {item.habitationName}
                      </Link>
                      <div className="text-[10px] text-slate-500">
                        {item.households} households
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{item.district}</td>
                    <td className="tabnum px-3 py-2.5 text-right font-medium text-slate-700">
                      {item.compositeRiskScore.toFixed(1)}
                    </td>
                    <td className="tabnum px-3 py-2.5 text-right font-bold text-slate-900">
                      {scenarioScore.toFixed(1)}
                    </td>
                    <td className="tabnum px-3 py-2.5 text-right font-bold">
                      {delta > 0 ? (
                        <span className="text-amber-700">+{delta.toFixed(1)}</span>
                      ) : delta < 0 ? (
                        <span className="text-emerald-700">{delta.toFixed(1)}</span>
                      ) : (
                        <span className="text-slate-400">0.0</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusPill tone={getPriorityTone(item.priority)}>
                        {item.priority}
                      </StatusPill>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-700">
                      {item.urgencyWindow || getTimelineWindow(item.timeline)}
                    </td>
                    <td className="tabnum px-3 py-2.5 text-right font-semibold text-slate-800">
                      {item.population.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2.5">
                      <Link
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-900 hover:underline"
                        href={`/relocation?habitationId=${item.habitationId}`}
                      >
                        Relocate <ChevronRightIcon className="size-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
