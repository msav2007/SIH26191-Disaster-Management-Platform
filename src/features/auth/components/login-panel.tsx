'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buttonStyles } from '@/components/ui/button';
import { ShieldAlertIcon, CheckIcon, BuildingIcon, MapPinIcon } from '@/components/ui/icons';
import { AVAILABLE_ROLES, getActiveRole, setActiveRole } from '@/lib/auth/session';

const roleItems = [
  {
    id: AVAILABLE_ROLES.sdma_admin.id,
    title: AVAILABLE_ROLES.sdma_admin.title,
    desc: 'Full executive command, scenario simulation, and statutory relocation orders.',
    icon: ShieldAlertIcon,
    badge: AVAILABLE_ROLES.sdma_admin.badge,
    jurisdiction: AVAILABLE_ROLES.sdma_admin.jurisdiction,
  },
  {
    id: AVAILABLE_ROLES.district_collector.id,
    title: AVAILABLE_ROLES.district_collector.title,
    desc: 'District prioritization review, site approvals, and resettlement planning.',
    icon: BuildingIcon,
    badge: AVAILABLE_ROLES.district_collector.badge,
    jurisdiction: AVAILABLE_ROLES.district_collector.jurisdiction,
  },
  {
    id: AVAILABLE_ROLES.geotech_surveyor.id,
    title: AVAILABLE_ROLES.geotech_surveyor.title,
    desc: 'Topographic slope data verification, household audits, and sensor logging.',
    icon: MapPinIcon,
    badge: AVAILABLE_ROLES.geotech_surveyor.badge,
    jurisdiction: AVAILABLE_ROLES.geotech_surveyor.jurisdiction,
  },
];

export function LoginPanel() {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(() => {
    return getActiveRole().id;
  });

  const handleSelectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    setActiveRole(roleId);
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-card sm:p-10">
      <div className="flex items-center gap-3.5">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs ring-1 ring-blue-700/30">
          <ShieldAlertIcon className="size-5.5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
            STATE DISASTER MANAGEMENT AUTHORITY
          </span>
          <h1 className="text-xl font-extrabold text-slate-900">
            Disaster Relocation Intelligence Platform
          </h1>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-600 leading-relaxed">
        Select your authorized statutory role profile to enter the operational command center, risk triage queues, and carrying capacity allocation engines.
      </p>

      <div className="mt-6 space-y-3">
        {roleItems.map((role) => {
          const isSelected = selectedRoleId === role.id;
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/25 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
              onClick={() => handleSelectRole(role.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-9 items-center justify-center rounded-lg ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="size-4.5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900">{role.title}</span>
                    <p className="mt-0.5 text-[11px] text-slate-500">{role.desc}</p>
                    <span className="mt-1 inline-block text-[10px] text-slate-400 font-mono">
                      Jurisdiction: {role.jurisdiction}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-700">
                    {role.badge}
                  </span>
                  {isSelected && <CheckIcon className="size-4 text-blue-600 font-bold" />}
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
          onClick={() => setActiveRole(selectedRoleId)}
        >
          Enter Command Dashboard →
        </Link>
      </div>
    </div>
  );
}

