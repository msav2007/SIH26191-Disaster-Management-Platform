'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buttonStyles } from '@/components/ui/button';
import { ShieldAlertIcon, CheckIcon, BuildingIcon, MapPinIcon } from '@/components/ui/icons';

const roles = [
  {
    id: 'sdma_admin',
    title: 'SDMA Relief Commissioner / Admin',
    desc: 'Full executive command, scenario simulation, and statutory relocation orders.',
    icon: ShieldAlertIcon,
    badge: 'FULL ACCESS',
  },
  {
    id: 'district_collector',
    title: 'District Collector / Magistrate',
    desc: 'District prioritization review, site approvals, and resettlement planning.',
    icon: BuildingIcon,
    badge: 'DISTRICT GOVERNANCE',
  },
  {
    id: 'geotech_surveyor',
    title: 'Field Geotechnical Surveyor',
    desc: 'Topographic slope data verification, household audits, and sensor logging.',
    icon: MapPinIcon,
    badge: 'FIELD AUDIT',
  },
];

export function LoginPanel() {
  const [selectedRole, setSelectedRole] = useState('sdma_admin');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-sky-800 text-white shadow-sm ring-1 ring-white/20">
          <ShieldAlertIcon className="size-6" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
            National Disaster Management Authority / SDMA
          </span>
          <h1 className="text-xl font-black text-slate-900">
            Disaster Management & Relocation Decision Platform
          </h1>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-600 leading-relaxed">
        Select your authorized role profile to access the operational command center, risk triage queues, and relocation capacity engines.
      </p>

      <div className="mt-6 space-y-3">
        {roles.map((role) => {
          const isSelected = selectedRole === role.id;
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-50/40 ring-2 ring-cyan-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
              onClick={() => setSelectedRole(role.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-9 items-center justify-center rounded-lg ${
                      isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="size-4.5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900">{role.title}</span>
                    <p className="mt-0.5 text-[11px] text-slate-500">{role.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-700">
                    {role.badge}
                  </span>
                  {isSelected && <CheckIcon className="size-4 text-cyan-600 font-bold" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>Statutory Authority Invariants Active (DMA 2005)</span>
        </div>

        <Link
          className={buttonStyles({ size: 'md', variant: 'primary' })}
          href="/dashboard"
        >
          Enter Command Dashboard →
        </Link>
      </div>
    </div>
  );
}

