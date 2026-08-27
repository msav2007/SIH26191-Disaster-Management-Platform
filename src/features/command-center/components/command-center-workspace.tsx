'use client';

import Link from 'next/link';

import type { CommandCenterData } from '@/server/command-center/command-center-types';
import { buttonStyles } from '@/components/ui/button';
import { StatusPill } from '@/components/ui/status-pill';
import { ProvenanceTag } from '@/components/ui/provenance-tag';
import { MapPinIcon } from '@/components/ui/icons';

export interface CommandCenterWorkspaceProps {
  data: CommandCenterData;
}

export function CommandCenterWorkspace({ data }: CommandCenterWorkspaceProps) {
  const { actionQueue, activeScenario, capacityOverview, kpis, priorityQueue } = data;

  return (
    <div className="space-y-4">
      {/* 1. Header & Live Authority Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="label-xs text-[var(--accent-strong)]">State Disaster Management Authority</span>
            <span className="rounded-xs border border-[var(--safe-border)] bg-[var(--safe-soft)] px-1.5 py-0.2 text-[9px] font-bold text-[var(--safe)]">
              OPERATIONAL COMMAND
            </span>
          </div>
          <h1 className="text-base font-bold text-[var(--text)]">Multi-Hazard Disaster Relocation Command Center</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <ProvenanceTag value="DEMO DATA" />
          <Link className={buttonStyles({ size: 'sm', variant: 'primary' })} href="/map">
            <MapPinIcon className="size-3.5" />
            Open GIS Workspace
          </Link>
          <Link className={buttonStyles({ size: 'sm', variant: 'secondary' })} href="/reports">
            Statutory Reports
          </Link>
        </div>
      </div>

      {/* 2. Top Operational KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Assessed */}
        <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xs">
          <p className="label-xs">Assessed Habitations</p>
          <p className="tabnum mt-1 text-xl font-black text-[var(--text)]">{kpis.totalAssessedHabitations}</p>
          <p className="text-[10px] text-[var(--text-muted)]">across 6 high-risk districts</p>
        </div>

        {/* Critical */}
        <div className="rounded-sm border border-[var(--critical-border)] bg-[var(--critical-soft)] p-3 shadow-xs">
          <p className="label-xs text-[var(--critical)]">Critical Tiers</p>
          <p className="tabnum mt-1 text-xl font-black text-[var(--critical)]">{kpis.criticalHabitationsCount}</p>
          <p className="text-[10px] text-[var(--critical)]">require building moratorium</p>
        </div>

        {/* Immediate Relocation */}
        <div className="rounded-sm border border-[var(--high-border)] bg-[var(--high-soft)] p-3 shadow-xs">
          <p className="label-xs text-[var(--high)]">Immediate Relocation (0–6mo)</p>
          <p className="tabnum mt-1 text-xl font-black text-[var(--high)]">{kpis.immediateRelocationCount}</p>
          <p className="text-[10px] text-[var(--high)]">evacuation urgency active</p>
        </div>

        {/* Population at Risk */}
        <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xs">
          <p className="label-xs">Population Evaluated</p>
          <p className="tabnum mt-1 text-xl font-black text-[var(--text)]">
            {kpis.totalPopulationAtRisk.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">residents surveyed</p>
        </div>

        {/* Headroom */}
        <div className="rounded-sm border border-[var(--safe-border)] bg-[var(--safe-soft)] p-3 shadow-xs">
          <p className="label-xs text-[var(--safe)]">Relocation Headroom</p>
          <p className="tabnum mt-1 text-xl font-black text-[var(--safe)]">
            {kpis.totalAvailableRelocationHeadroom.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">across {capacityOverview.totalSites} safe sectors</p>
        </div>

        {/* Active Scenario Escalation */}
        <div className="rounded-sm border border-[var(--accent-border)] bg-[var(--accent-soft)]/40 p-3 shadow-xs">
          <p className="label-xs text-[var(--accent-strong)]">Scenario Stress Escalation</p>
          <p className="tabnum mt-1 text-xl font-black text-[var(--accent-strong)]">
            +{activeScenario.totalHabitationsEscalated}
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">+20% extreme rainfall</p>
        </div>
      </div>

      {/* 3. Main Grid: Priority Queue (Left) & Live Decision Panels (Right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Column: Operational Priority Queue */}
        <div className="space-y-4 lg:col-span-8">
          <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
              <div>
                <span className="label-xs text-[var(--accent-strong)]">Deterministic Triage Engine</span>
                <h2 className="text-sm font-bold text-[var(--text)]">Operational Habitation Priority Queue</h2>
              </div>
              <Link className="text-xs font-semibold text-[var(--accent-strong)] hover:underline" href="/habitations">
                View Full Habitations Queue →
              </Link>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10px] uppercase text-[var(--text-muted)]">
                  <tr>
                    <th className="px-2.5 py-2 font-bold">Rank</th>
                    <th className="px-2.5 py-2 font-bold">Settlement</th>
                    <th className="px-2.5 py-2 font-bold">District</th>
                    <th className="px-2.5 py-2 font-bold">Primary Hazard</th>
                    <th className="px-2.5 py-2 text-right font-bold">Risk Score</th>
                    <th className="px-2.5 py-2 font-bold">Priority</th>
                    <th className="px-2.5 py-2 font-bold">Timeline</th>
                    <th className="px-2.5 py-2 font-bold">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {priorityQueue.map((item) => (
                    <tr key={item.habitationId} className="hover:bg-[var(--surface-muted)]">
                      <td className="tabnum px-2.5 py-2 font-mono text-[11px] font-bold text-[var(--text-muted)]">
                        #{item.rank}
                      </td>
                      <td className="px-2.5 py-2">
                        <Link
                          className="font-bold text-[var(--text)] hover:text-[var(--accent-strong)] hover:underline"
                          href={`/habitations?selected=${item.habitationId}`}
                        >
                          {item.habitationName}
                        </Link>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          {item.population.toLocaleString('en-IN')} pop · {item.households} HH
                        </div>
                      </td>
                      <td className="px-2.5 py-2 text-[11px] font-medium text-[var(--text-muted)]">{item.district}</td>
                      <td className="px-2.5 py-2 text-[11px] capitalize text-[var(--text)]">
                        {item.primaryHazard.replace('_', ' ')}
                      </td>
                      <td className="tabnum px-2.5 py-2 text-right text-xs font-black text-[var(--critical)]">
                        {item.compositeRiskScore.toFixed(1)}
                      </td>
                      <td className="px-2.5 py-2">
                        <StatusPill tone={item.priority === 'CRITICAL' ? 'critical' : 'high'}>
                          {item.priority}
                        </StatusPill>
                      </td>
                      <td className="px-2.5 py-2 text-[11px] font-semibold text-[var(--text)]">
                        {item.timeline === 'immediate' ? '0–6 months' : '6–18 months'}
                      </td>
                      <td className="px-2.5 py-2">
                        <Link
                          className="text-[11px] font-medium text-[var(--accent-strong)] hover:underline"
                          href={`/relocation?habitationId=${item.habitationId}`}
                        >
                          Relocation Options →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Authority Action Queue */}
          <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <div>
                <span className="label-xs text-[var(--critical)]">Deterministic Decision Directives</span>
                <h2 className="text-sm font-bold text-[var(--text)]">Authority Action Queue ({actionQueue.length} items)</h2>
              </div>
              <span className="text-[10px] text-[var(--text-muted)]">Derived from live multi-hazard assessments</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {actionQueue.map((action) => (
                <div
                  key={action.id}
                  className={`flex items-start justify-between gap-3 rounded-sm border p-3 ${
                    action.severity === 'critical'
                      ? 'border-[var(--critical-border)] bg-[var(--critical-soft)]/40'
                      : 'border-[var(--high-border)] bg-[var(--high-soft)]/30'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded-xs bg-[var(--critical)] px-1 py-0.2 text-[9px] font-black uppercase text-white">
                        {action.severity}
                      </span>
                      <h3 className="text-xs font-bold text-[var(--text)]">{action.title}</h3>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">{action.description}</p>
                    <div className="text-[10px] font-mono text-[var(--text-muted)]">Ref: {action.evidenceReference}</div>
                  </div>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Link className={buttonStyles({ size: 'sm', variant: 'secondary' })} href={action.href as any}>
                    Review →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Decision Panels */}
        <div className="space-y-4 lg:col-span-4">
          {/* Live GIS Spatial Panel */}
          <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="label-xs text-[var(--accent-strong)]">GIS Spatial Engine</span>
              <Link className="text-xs font-semibold text-[var(--accent-strong)] hover:underline" href="/map">
                Full Map →
              </Link>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <p className="text-[11px] text-[var(--text-muted)]">
                WGS84 EPSG:4326 spatial projection active across 7 high-risk settlements and 4 gazetted Red Zones.
              </p>
              <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2.5">
                <div className="flex justify-between font-semibold">
                  <span>Gazetted Red Zones:</span>
                  <span className="tabnum font-bold text-[var(--critical)]">4 zones</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Candidate Resettlement Sectors:</span>
                  <span className="tabnum font-bold text-[var(--safe)]">4 sectors</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Critical Infrastructure Elements:</span>
                  <span className="tabnum font-bold text-[var(--text)]">10 facilities</span>
                </div>
              </div>
              <Link
                className={`w-full text-center ${buttonStyles({ size: 'sm', variant: 'secondary' })}`}
                href="/map"
              >
                Inspect Spatial Runout Envelopes
              </Link>
            </div>
          </div>

          {/* Relocation Carrying Capacity Panel */}
          <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <div>
                <span className="label-xs text-[var(--safe)]">Carrying Capacity Engine</span>
                <h3 className="text-xs font-bold text-[var(--text)]">Relocation Headroom & Bottlenecks</h3>
              </div>
              <span className="rounded-xs border border-[var(--safe-border)] px-1 py-0.2 text-[9px] font-bold uppercase text-[var(--safe)]">
                Capacity ≠ Suitability
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Total Absorption Headroom:</span>
                <span className="tabnum font-bold text-[var(--safe)]">
                  {capacityOverview.totalAvailableHeadroom.toLocaleString('en-IN')} persons
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Average Site Utilization:</span>
                <span className="tabnum font-bold text-[var(--text)]">
                  {capacityOverview.averageUtilizationPercent}%
                </span>
              </div>

              <div className="mt-2 space-y-1.5">
                <p className="label-xs">Constrained Resettlement Sectors:</p>
                {capacityOverview.topConstrainedSites.map((site) => (
                  <div
                    key={site.siteId}
                    className="flex items-center justify-between rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2 text-[11px]"
                  >
                    <div>
                      <div className="font-bold text-[var(--text)]">{site.siteName}</div>
                      <div className="text-[10px] text-[var(--critical)]">Bottleneck: {site.limitingFactor}</div>
                    </div>
                    <div className="text-right">
                      <div className="tabnum font-bold text-[var(--safe)]">{site.headroom} free</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{site.utilizationPercent}% used</div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                className={`mt-2 w-full text-center ${buttonStyles({ size: 'sm', variant: 'secondary' })}`}
                href="/relocation"
              >
                Open Relocation Planning →
              </Link>
            </div>
          </div>

          {/* Active Climate Scenario Simulator Panel */}
          <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <div>
                <span className="label-xs text-[var(--accent-strong)]">Multi-Hazard Scenario Simulator</span>
                <h3 className="text-xs font-bold text-[var(--text)]">{activeScenario.scenario.shortLabel}</h3>
              </div>
              <Link className="text-xs font-semibold text-[var(--accent-strong)] hover:underline" href="/scenarios">
                Simulator →
              </Link>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <p className="text-[11px] text-[var(--text-muted)]">{activeScenario.scenario.description}</p>
              <div className="rounded-sm border border-[var(--accent-border)] bg-[var(--accent-soft)]/30 p-2.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Escalated Settlements:</span>
                  <span className="tabnum font-bold text-[var(--accent-strong)]">
                    +{activeScenario.totalHabitationsEscalated}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Newly Critical:</span>
                  <span className="tabnum font-bold text-[var(--critical)]">
                    +{activeScenario.newlyCriticalHabitations}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Elevated Population at Risk:</span>
                  <span className="tabnum font-bold text-[var(--text)]">
                    +{activeScenario.additionalPopulationAtRisk.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <Link
                className={`w-full text-center ${buttonStyles({ size: 'sm', variant: 'secondary' })}`}
                href="/scenarios"
              >
                Run Custom Simulation Modifiers →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
