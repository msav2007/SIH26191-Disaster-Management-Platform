import Link from 'next/link';
import type { Route } from 'next';

import { siteConfig } from '@/config/app/site';
import { Badge } from '@/components/ui/badge';
import { buttonStyles } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  BuildingIcon,
  ChevronRightIcon,
  FileTextIcon,
  MapPinIcon,
  ShieldAlertIcon,
  SlidersIcon,
  CheckIcon,
} from '@/components/ui/icons';

const officialRequirements = [
  {
    title: 'Identify & Update Multi-Hazard Red Zones',
    desc: 'Statutory landslide, flood, and coastal erosion hazard envelopes with spatial buffers.',
  },
  {
    title: 'Assess Carrying Capacity of Safer Sites',
    desc: '10-dimension geotechnical & infrastructure bottleneck analysis with 15% safety buffer.',
  },
  {
    title: 'Prioritize Habitations by Relocation Urgency',
    desc: 'Deterministic multi-criteria scoring across 5 weighted vulnerability dimensions.',
  },
  {
    title: 'Integrate Hazard Intensity & Disaster History',
    desc: 'Historical disaster recurrence logs linked to census demographics and road isolation.',
  },
];

interface CapabilityItem {
  icon: typeof MapPinIcon;
  title: string;
  desc: string;
  link: Route;
  action: string;
  color: string;
  bg: string;
  border: string;
}

const capabilities: CapabilityItem[] = [
  {
    icon: MapPinIcon,
    title: 'Operational GIS Risk Map',
    desc: 'EPSG:4326 vector coordinates, statutory red zones, settlement centroids, and emergency response infrastructure.',
    link: '/map',
    action: 'Open Interactive Map →',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'hover:border-blue-300',
  },
  {
    icon: ShieldAlertIcon,
    title: 'Deterministic Risk Engine',
    desc: 'Strict 35/25/20/10/10 multi-criteria weighting across hazard intensity, vulnerability, history, exposure, and isolation.',
    link: '/habitations',
    action: 'View Risk Queue →',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'hover:border-red-300',
  },
  {
    icon: BuildingIcon,
    title: 'Carrying Capacity Allocation',
    desc: '10-dimension site capacity audits with limiting factor detection and 0.85 safety factor to prevent secondary disasters.',
    link: '/relocation',
    action: 'Inspect Relocation Sites →',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'hover:border-emerald-300',
  },
  {
    icon: SlidersIcon,
    title: 'Climate Stress Simulator',
    desc: 'Simulate extreme precipitation, cloudburst surges, and slope pore pressure to project settlement risk escalation.',
    link: '/scenarios',
    action: 'Run Climate Scenario →',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'hover:border-sky-300',
  },
  {
    icon: FileTextIcon,
    title: 'Statutory Authority Reports',
    desc: 'Machine-readable decision dossiers, executive summaries, and relocation justification orders under DMA 2005.',
    link: '/reports',
    action: 'Generate Reports →',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'hover:border-indigo-300',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-8 sm:px-6 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        {/* 1. Top Command Header Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white/95 px-6 py-4 shadow-xs backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-sm ring-1 ring-white/20">
              <span className="font-mono text-xs font-black tracking-wider">SDMA</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  SIH26191
                </span>
                <span className="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-200 ring-1 ring-slate-700/50">
                  Gov Command
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                State Disaster Management Authority Platform
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <Badge variant="info">{siteConfig.problemCode}</Badge>
            <Badge variant="outline">{siteConfig.phaseLabel}</Badge>
            <Link
              className={buttonStyles({ size: 'sm', variant: 'primary' })}
              href="/dashboard"
            >
              Command Center →
            </Link>
          </div>
        </header>

        {/* 2. Hero Section */}
        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          {/* Main Hero Card */}
          <Card className="relative flex flex-col justify-between overflow-hidden p-8 sm:p-10 border border-slate-200/90 shadow-card bg-white/95 backdrop-blur-md">
            {/* Subtle Ambient Glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-blue-600/5 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 size-80 rounded-full bg-sky-500/5 blur-3xl" />

            <div className="relative space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-800">
                <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
                Smart India Hackathon 2026 · Disaster Management
              </div>

              <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl sm:leading-[1.18] lg:text-5xl">
                Production Decision-Support System for Multi-Hazard Relocation.
              </h1>

              <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600">
                An authoritative, GIS-enabled multi-criteria decision platform for State Disaster Management Authorities. Evaluates deterministic settlement vulnerability, calculates 10-dimension site carrying capacity, runs climate stress simulations, and generates statutory resettlement orders.
              </p>

              {/* 5 Core Visual Indicators */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs">
                  <span className="size-1.5 rounded-full bg-blue-600" />
                  GIS Vector Mapping
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs">
                  <span className="size-1.5 rounded-full bg-red-600" />
                  Deterministic Risk Triage
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs">
                  <span className="size-1.5 rounded-full bg-emerald-600" />
                  10-D Carrying Capacity
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs">
                  <span className="size-1.5 rounded-full bg-amber-600" />
                  Climate Scenario Model
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs">
                  <span className="size-1.5 rounded-full bg-indigo-600" />
                  DMA 2005 Resettlement
                </span>
              </div>
            </div>

            {/* CTAs and Status Strip */}
            <div className="relative mt-8 space-y-4 border-t border-slate-100 pt-6">
              <div className="flex flex-wrap items-center gap-3">
                <Link className={buttonStyles({ size: 'md', variant: 'primary' })} href="/dashboard">
                  Open Command Center <ChevronRightIcon className="size-4" />
                </Link>
                <Link className={buttonStyles({ size: 'md', variant: 'secondary' })} href="/map">
                  <MapPinIcon className="size-3.5" />
                  Inspect GIS Map
                </Link>
                <Link className={buttonStyles({ size: 'md', variant: 'outline' })} href="/login">
                  Role Login Entry
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-4 text-center">
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2 text-xs">
                  <span className="tabnum font-bold text-slate-900 block text-sm">7 Settlements</span>
                  <span className="text-[10px] text-slate-500">Field Surveyed</span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2 text-xs">
                  <span className="tabnum font-bold text-red-700 block text-sm">3 Red Zones</span>
                  <span className="text-[10px] text-slate-500">Statutory Runout</span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2 text-xs">
                  <span className="tabnum font-bold text-emerald-700 block text-sm">7 Relocation Sites</span>
                  <span className="text-[10px] text-slate-500">Capacity Audited</span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2 text-xs">
                  <span className="tabnum font-bold text-blue-700 block text-sm">WGS84 EPSG:4326</span>
                  <span className="text-[10px] text-slate-500">Coordinate Basis</span>
                </div>
              </div>
            </div>
          </Card>

          {/* SIH Scope Card */}
          <Card className="flex flex-col justify-between space-y-5 p-8 border border-slate-200/90 shadow-card bg-white">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Official SIH Scope &amp; Core Mandate
                </h2>
                <span className="font-mono text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  PROBLEM ID: SIH26191
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {officialRequirements.map((req) => (
                  <div
                    key={req.title}
                    className="flex items-start gap-3 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 transition-all hover:bg-slate-50 hover:border-slate-300"
                  >
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white mt-0.5 shadow-2xs">
                      <CheckIcon className="size-3" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{req.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{req.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 text-xs text-slate-600">
              <span className="font-bold text-blue-950 block">Statutory Authority Governance</span>
              <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                Operates under Disaster Management Act (DMA) 2005 protocols with deterministic multi-criteria scoring, 15% carrying safety buffer, and machine-readable resettlement orders.
              </p>
            </div>
          </Card>
        </section>

        {/* 3. Operational Capabilities Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Platform Decision Engines &amp; Modules
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              5 Integrated Operational Systems
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <Link
                  key={cap.title}
                  className={`group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all ${cap.border} hover:shadow-card hover:-translate-y-0.5`}
                  href={cap.link}
                >
                  <div className="space-y-3">
                    <div className={`flex size-9 items-center justify-center rounded-xl ${cap.bg} ${cap.color}`}>
                      <Icon className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {cap.title}
                      </h3>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                        {cap.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-600 group-hover:text-blue-700">
                    <span>{cap.action}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 4. Technical Architecture & Deterministic Foundations */}
        <section className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-3 p-6 border border-slate-200/90 shadow-card bg-white">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-red-600" />
              <h3 className="text-sm font-bold text-slate-900">Deterministic Multi-Criteria Risk</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Strict 35/25/20/10/10 multi-criteria weighting across hazard intensity, demographic vulnerability, disaster history, exposure, and infrastructure disruption with statutory red zone priority overrides.
            </p>
            <div className="pt-2">
              <span className="font-mono text-[10px] text-slate-400">Model Weight Invariant: Σ wi = 1.00</span>
            </div>
          </Card>

          <Card className="space-y-3 p-6 border border-slate-200/90 shadow-card bg-white">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">10-Dimension Carrying Capacity</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Geotechnical and infrastructure bottleneck analysis with a mandatory 15% safety buffer (0.85 safety factor) to prevent secondary disaster creation at resettlement sectors.
            </p>
            <div className="pt-2">
              <span className="font-mono text-[10px] text-slate-400">Headroom Formula: C_eff = min(C_dim) · 0.85</span>
            </div>
          </Card>

          <Card className="space-y-3 p-6 border border-slate-200/90 shadow-card bg-white">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Statutory Authority Governance</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Role-based command profiles, GIS spatial vector inspections (EPSG:4326), climate stress scenario simulations, and machine-readable statutory report exports under DMA 2005.
            </p>
            <div className="pt-2">
              <span className="font-mono text-[10px] text-slate-400">Authoritative Provenance: Verified Seed Fixtures</span>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

