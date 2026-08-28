'use client';

import { useState } from 'react';
import { defaultRiskModel } from '@/config/risk/default-model';
import { buttonStyles } from '@/components/ui/button';
import {
  CheckIcon,
  DownloadIcon,
  RefreshIcon,
} from '@/components/ui/icons';
import { ProvenanceTag } from '@/components/ui/provenance-tag';
import { StatusPill } from '@/components/ui/status-pill';

type AdminTab = 'data' | 'system' | 'audit' | 'users';

export function AdministrationWorkspace() {
  const [activeTab, setActiveTab] = useState<AdminTab>('data');

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
              State Disaster Management Authority
            </span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200">
              PLATFORM GOVERNANCE
            </span>
          </div>
          <h1 className="mt-1 text-lg font-bold text-slate-900">
            Administration & Technical Governance Console
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Manage system configurations, data registries, audit trails, and role-based permissions safely isolated from operational workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <ProvenanceTag value="DEMO DATA" />
        </div>
      </div>

      {/* 2. Admin Navigation Tabs */}
      <div className="flex rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs">
        <button
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
            activeTab === 'data'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          onClick={() => setActiveTab('data')}
          type="button"
        >
          Data Management & Registries
        </button>
        <button
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
            activeTab === 'system'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          onClick={() => setActiveTab('system')}
          type="button"
        >
          System Configuration & Model Weights
        </button>
        <button
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
            activeTab === 'audit'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          onClick={() => setActiveTab('audit')}
          type="button"
        >
          Statutory Audit Logs & Provenance
        </button>
        <button
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
            activeTab === 'users'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          onClick={() => setActiveTab('users')}
          type="button"
        >
          User Management & Roles
        </button>
      </div>

      {/* 3. Tab Content */}
      {activeTab === 'data' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Surveyed Habitations
                </span>
                <span className="size-2 rounded-full bg-emerald-500" />
              </div>
              <p className="tabnum mt-2 text-2xl font-black text-slate-900">7 Records</p>
              <p className="mt-1 text-[11px] text-slate-500">100% census data verified</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Relocation Sites Inventory
                </span>
                <span className="size-2 rounded-full bg-sky-500" />
              </div>
              <p className="tabnum mt-2 text-2xl font-black text-slate-900">7 Parcels</p>
              <p className="mt-1 text-[11px] text-slate-500">10-dimension capacity verified</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Statutory Red Zones
                </span>
                <span className="size-2 rounded-full bg-red-500" />
              </div>
              <p className="tabnum mt-2 text-2xl font-black text-slate-900">3 Moratoriums</p>
              <p className="mt-1 text-[11px] text-slate-500">Official gazette boundaries</p>
            </div>
          </div>

          {/* Master Registries Overview Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Seeded Dataset Registries</h2>
              <div className="flex items-center gap-2">
                <button className={buttonStyles({ size: 'sm', variant: 'secondary' })} type="button">
                  <RefreshIcon className="size-3.5 text-slate-500" />
                  Verify Seed Fixtures
                </button>
                <button className={buttonStyles({ size: 'sm', variant: 'secondary' })} type="button">
                  <DownloadIcon className="size-3.5 text-slate-500" />
                  Export Master DB Backup
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                <div>
                  <span className="font-bold text-slate-900">Habitations Master File (disaster-data.ts)</span>
                  <p className="text-[11px] text-slate-500">Contains demographic, infrastructure, topographic, and hazard data across 6 districts.</p>
                </div>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">ACTIVE & VERIFIED</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                <div>
                  <span className="font-bold text-slate-900">Relocation Sites Master File (disaster-data.ts)</span>
                  <p className="text-[11px] text-slate-500">Contains carrying capacity metrics (water, power, terrain, shelter, road accessibility).</p>
                </div>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">ACTIVE & VERIFIED</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                <div>
                  <span className="font-bold text-slate-900">GIS Spatial Vector Layers</span>
                  <p className="text-[11px] text-slate-500">EPSG:4326 runout hazard zones, river flood contours, and candidate resettlement polygons.</p>
                </div>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">ACTIVE & VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-5">
          {/* Multi-Hazard Risk Weight Model */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Multi-Hazard Risk Model Weights (Configuration Invariant)</h2>
                <p className="text-[11px] text-slate-500">All weights must strictly sum to 1.00 (100%)</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <CheckIcon className="size-3 text-emerald-600" />
                Σ wi = 1.00 VALIDATED
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-500">Hazard Weight (w₁)</span>
                <p className="tabnum mt-1 text-xl font-bold text-sky-700">
                  {(defaultRiskModel.factors.hazard * 100).toFixed(1)}%
                </p>
                <p className="text-[10px] text-slate-500">Slope, scour, rainfall</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-500">Vulnerability (w₂)</span>
                <p className="tabnum mt-1 text-xl font-bold text-sky-700">
                  {(defaultRiskModel.factors.vulnerability * 100).toFixed(1)}%
                </p>
                <p className="text-[10px] text-slate-500">BPL, elderly, children</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-500">History (w₃)</span>
                <p className="tabnum mt-1 text-xl font-bold text-sky-700">
                  {(defaultRiskModel.factors.history * 100).toFixed(1)}%
                </p>
                <p className="text-[10px] text-slate-500">Past recurrence & loss</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-500">Exposure (w₄)</span>
                <p className="tabnum mt-1 text-xl font-bold text-sky-700">
                  {(defaultRiskModel.factors.exposure * 100).toFixed(1)}%
                </p>
                <p className="text-[10px] text-slate-500">Terrace density & assets</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-500">Infrastructure (w₅)</span>
                <p className="tabnum mt-1 text-xl font-bold text-sky-700">
                  {(defaultRiskModel.factors.infrastructure * 100).toFixed(1)}%
                </p>
                <p className="text-[10px] text-slate-500">Road, health, power</p>
              </div>
            </div>
          </div>

          {/* Classification Thresholds */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Statutory Priority Classification Engine Thresholds</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4 text-xs">
              <div className="rounded-lg border border-red-200 bg-red-50/40 p-3">
                <span className="text-[10px] uppercase font-bold text-red-800">Critical Priority</span>
                <p className="mt-1 font-bold text-red-900">Score ≥ {defaultRiskModel.bands.critical.toFixed(1)}</p>
                <p className="text-[10px] text-red-700">or Active Red Zone Moratorium ({defaultRiskModel.priorityThresholds.immediate.window})</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3">
                <span className="text-[10px] uppercase font-bold text-amber-800">High Priority</span>
                <p className="mt-1 font-bold text-amber-900">{defaultRiskModel.priorityThresholds.shortTerm.minCompositeScore.toFixed(1)} ≤ Score &lt; {defaultRiskModel.bands.critical.toFixed(1)}</p>
                <p className="text-[10px] text-amber-700">{defaultRiskModel.priorityThresholds.shortTerm.window} window</p>
              </div>
              <div className="rounded-lg border border-yellow-200 bg-yellow-50/40 p-3">
                <span className="text-[10px] uppercase font-bold text-yellow-800">Medium Priority</span>
                <p className="mt-1 font-bold text-yellow-900">{defaultRiskModel.priorityThresholds.mediumTerm.minCompositeScore.toFixed(1)} ≤ Score &lt; {defaultRiskModel.priorityThresholds.shortTerm.minCompositeScore.toFixed(1)}</p>
                <p className="text-[10px] text-yellow-700">{defaultRiskModel.priorityThresholds.mediumTerm.window} window</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-600">Low Priority</span>
                <p className="mt-1 font-bold text-slate-900">Score &lt; {defaultRiskModel.priorityThresholds.mediumTerm.minCompositeScore.toFixed(1)}</p>
                <p className="text-[10px] text-slate-500">{defaultRiskModel.priorityThresholds.monitor.window}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Statutory Audit Logs & System Provenance</h2>
            <ProvenanceTag value="DEMO DATA" />
          </div>

          <div className="mt-4 space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
              <span className="text-slate-800">[AUDIT-2026-08-27 10:00:00 UTC] Deterministic Risk Engine V2.0 initialized with 7 habitations.</span>
              <span className="text-emerald-700 font-bold">VERIFIED</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
              <span className="text-slate-800">[AUDIT-2026-08-27 10:05:00 UTC] Statutory Red Zone boundaries confirmed by Revenue Department.</span>
              <span className="text-emerald-700 font-bold">VERIFIED</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
              <span className="text-slate-800">[AUDIT-2026-08-27 10:15:00 UTC] IMD / IPCC Climate Simulation preset models loaded into memory.</span>
              <span className="text-emerald-700 font-bold">VERIFIED</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
              <span className="text-slate-800">[AUDIT-2026-08-27 10:30:00 UTC] 10-Dimension Carrying Capacity headroom audits generated for all 7 candidate sites.</span>
              <span className="text-emerald-700 font-bold">VERIFIED</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Role-Based Access Control (RBAC) Overview</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">SDMA Administrator</span>
                <StatusPill tone="safe">Active</StatusPill>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Full system configuration, scenario engine execution, and statutory report export privileges.</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">District Collector</span>
                <StatusPill tone="safe">Active</StatusPill>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">District-level settlement reviews, resettlement orders, and spatial GIS inspections.</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Field Geotechnical Surveyor</span>
                <StatusPill tone="safe">Active</StatusPill>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Slope gradient surveys, infrastructure status audits, and household census validation.</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Statutory Auditor</span>
                <StatusPill tone="safe">Active</StatusPill>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Audit logs inspection, provenance validation, and compliance verification under DMA 2005.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
