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
} from '@/components/ui/icons';

const workflowSteps = [
  {
    step: '01',
    label: 'IDENTIFY',
    title: 'Multi-Hazard Red Zones',
    desc: 'Statutory landslide, flood, and coastal erosion hazard runout envelopes with verified spatial buffers.',
  },
  {
    step: '02',
    label: 'ASSESS',
    title: 'Vulnerable Habitations',
    desc: 'Census demographics, poverty index, infrastructure isolation, and historical disaster recurrence logs.',
  },
  {
    step: '03',
    label: 'PRIORITIZE',
    title: 'Relocation Urgency',
    desc: 'Deterministic 35/25/20/10/10 multi-criteria scoring across 5 weighted vulnerability dimensions.',
  },
  {
    step: '04',
    label: 'MATCH',
    title: 'Safer Candidate Sites',
    desc: '10-dimension geotechnical & infrastructure bottleneck analysis with a mandatory 15% safety buffer.',
  },
  {
    step: '05',
    label: 'SIMULATE',
    title: 'Climate Stress',
    desc: 'Simulate extreme precipitation surges, cloudburst torrents, and slope pore pressure escalation.',
  },
  {
    step: '06',
    label: 'DECIDE',
    title: 'Statutory Relocation Action',
    desc: 'Machine-readable decision dossiers, executive summaries, and resettlement orders under DMA 2005.',
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
  badge: string;
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
    badge: 'GIS LAYER',
  },
  {
    icon: ShieldAlertIcon,
    title: 'Deterministic Risk Engine',
    desc: 'Strict 35/25/20/10/10 multi-criteria weighting across hazard intensity, vulnerability, history, exposure, and isolation.',
    link: '/habitations',
    action: 'View Risk Queue →',
    color: 'text-red-600',
    bg: 'bg-red-50',
    badge: 'TRIAGE',
  },
  {
    icon: BuildingIcon,
    title: 'Carrying Capacity Allocation',
    desc: '10-dimension site capacity audits with limiting factor detection and 0.85 safety factor to prevent secondary disasters.',
    link: '/relocation',
    action: 'Inspect Relocation Sites →',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    badge: 'CAPACITY',
  },
  {
    icon: SlidersIcon,
    title: 'Climate Stress Simulator',
    desc: 'Simulate extreme precipitation, cloudburst surges, and slope pore pressure to project settlement risk escalation.',
    link: '/scenarios',
    action: 'Run Climate Scenario →',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    badge: 'SIMULATION',
  },
  {
    icon: FileTextIcon,
    title: 'Statutory Authority Reports',
    desc: 'Machine-readable decision dossiers, executive summaries, and relocation justification orders under DMA 2005.',
    link: '/reports',
    action: 'Generate Reports →',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    badge: 'DMA 2005',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-8 sm:px-6 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 sm:gap-16">
        {/* 1. Top Command Header Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white/95 px-6 py-4 shadow-subtle backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs ring-1 ring-white/20">
              <span className="font-mono text-xs font-black tracking-wider">SDMA</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  SIH26191
                </span>
                <span className="rounded-sm bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-slate-700 ring-1 ring-slate-200">
                  Gov DSS
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
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 lg:p-14 shadow-card">
          {/* Subtle Atmospheric Glows (CarbonTwin style) */}
          <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-blue-600/5 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 size-96 rounded-full bg-blue-600/4 blur-3xl" />

          <div className="relative mx-auto max-w-4xl text-center space-y-6">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/70 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-900 shadow-2xs">
              <span className="size-1.5 rounded-full bg-blue-600" />
              Smart India Hackathon 2026 · Disaster Management
            </div>

            {/* Main Dominant Heading */}
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl sm:leading-[1.15]">
              Production Decision-Support System for{' '}
              <span className="text-blue-600">Multi-Hazard Relocation.</span>
            </h1>

            {/* Subtitle Description */}
            <p className="mx-auto max-w-3xl text-sm sm:text-base leading-relaxed text-slate-600">
              An authoritative, GIS-enabled multi-criteria decision platform for State Disaster Management Authorities. Evaluates deterministic settlement vulnerability, calculates 10-dimension site carrying capacity, runs climate stress simulations, and generates statutory resettlement orders.
            </p>

            {/* 5 Capability Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-2xs">
                <span className="size-2 rounded-full bg-blue-600" />
                GIS Vector Mapping
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-2xs">
                <span className="size-2 rounded-full bg-red-600" />
                Deterministic Risk Triage
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-2xs">
                <span className="size-2 rounded-full bg-emerald-600" />
                10-D Carrying Capacity
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-2xs">
                <span className="size-2 rounded-full bg-amber-600" />
                Climate Scenario Model
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-2xs">
                <span className="size-2 rounded-full bg-indigo-600" />
                DMA 2005 Resettlement
              </span>
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
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

            {/* Quick Platform Stats */}
            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 pt-6 border-t border-slate-100 sm:grid-cols-4 text-center">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 shadow-2xs">
                <span className="tabnum font-bold text-slate-900 block text-base sm:text-lg">7 Settlements</span>
                <span className="text-[11px] text-slate-500 font-medium">Field Surveyed</span>
              </div>
              <div className="rounded-2xl border border-red-200/70 bg-red-50/40 p-3 shadow-2xs">
                <span className="tabnum font-bold text-red-700 block text-base sm:text-lg">3 Red Zones</span>
                <span className="text-[11px] text-red-600 font-medium">Statutory Runout</span>
              </div>
              <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-3 shadow-2xs">
                <span className="tabnum font-bold text-emerald-700 block text-base sm:text-lg">7 Relocation Sites</span>
                <span className="text-[11px] text-emerald-700 font-medium">Capacity Audited</span>
              </div>
              <div className="rounded-2xl border border-blue-200/70 bg-blue-50/40 p-3 shadow-2xs">
                <span className="tabnum font-bold text-blue-700 block text-base sm:text-lg">WGS84 EPSG:4326</span>
                <span className="text-[11px] text-blue-600 font-medium" title="Coordinate reference system used for geographic mapping">
                  Coordinate Basis
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Decision Workflow / Journey Section (CarbonTwin Style) */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              OPERATIONAL DECISION WORKFLOW
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              End-to-End Relocation Decision Pipeline
            </h2>
            <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-600">
              From multi-hazard spatial runout identification to DMA 2005 statutory orders in 6 deterministic stages.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workflowSteps.map((ws) => (
              <div
                key={ws.step}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-subtle transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-card"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-blue-700 ring-1 ring-blue-600/20">
                      STAGE {ws.step}
                    </span>
                    <span className="font-mono text-3xl font-black text-slate-200 transition-colors group-hover:text-blue-200">
                      {ws.step}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {ws.label}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {ws.title}
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">
                    {ws.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Deep Navy Feature Section (CarbonTwin Inspired) */}
        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-[#081525] p-8 sm:p-12 text-white shadow-elevated">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Side Headline */}
            <div className="space-y-4 lg:col-span-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-300">
                <span className="size-1.5 rounded-full bg-blue-400" />
                Unified Command Architecture
              </span>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-white leading-tight">
                One platform. <br />
                One operational picture. <br />
                <span className="text-blue-400">Better relocation decisions.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Replaces fragmented paper surveys and ad-hoc evacuation spreadsheets with an authoritative, mathematical decision framework built strictly for State Disaster Management Authorities under the Disaster Management Act 2005.
              </p>
              <div className="pt-2">
                <Link className={buttonStyles({ size: 'md', variant: 'primary' })} href="/dashboard">
                  Enter Command Center →
                </Link>
              </div>
            </div>

            {/* Right Side 5 Subsystem Navy Cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
              <div className="rounded-2xl border border-[#1a2d48] bg-[#0d1e35] p-4.5 space-y-1.5 transition-colors hover:border-blue-500/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-blue-400">01</span>
                  <span className="text-[10px] text-slate-400 font-mono">EPSG:4326</span>
                </div>
                <h3 className="text-xs font-bold text-white">GIS Risk Intelligence</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Interactive multi-hazard vector overlay with statutory red zone envelopes and asset inspection.
                </p>
              </div>

              <div className="rounded-2xl border border-[#1a2d48] bg-[#0d1e35] p-4.5 space-y-1.5 transition-colors hover:border-blue-500/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-red-400">02</span>
                  <span className="text-[10px] text-slate-400 font-mono">Σ wi = 1.00</span>
                </div>
                <h3 className="text-xs font-bold text-white">Vulnerability Prioritization</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Deterministic 35/25/20/10/10 scoring ranking habitations by operational relocation urgency.
                </p>
              </div>

              <div className="rounded-2xl border border-[#1a2d48] bg-[#0d1e35] p-4.5 space-y-1.5 transition-colors hover:border-blue-500/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-emerald-400">03</span>
                  <span className="text-[10px] text-slate-400 font-mono">15% BUFFER</span>
                </div>
                <h3 className="text-xs font-bold text-white">Candidate Site Capacity</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  10-dimensional geotechnical & infrastructure bottleneck analysis ensuring secondary disaster prevention.
                </p>
              </div>

              <div className="rounded-2xl border border-[#1a2d48] bg-[#0d1e35] p-4.5 space-y-1.5 transition-colors hover:border-blue-500/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-amber-400">04</span>
                  <span className="text-[10px] text-slate-400 font-mono">IMD / IPCC</span>
                </div>
                <h3 className="text-xs font-bold text-white">Climate Stress Simulation</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Real-time precipitation surge and pore pressure scaling projecting escalated settlement demand.
                </p>
              </div>

              <div className="rounded-2xl border border-[#1a2d48] bg-[#0d1e35] p-4.5 space-y-1.5 transition-colors hover:border-blue-500/40 sm:col-span-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-indigo-400">05</span>
                  <span className="text-[10px] text-slate-400 font-mono">DMA 2005 COMPLIANT</span>
                </div>
                <h3 className="text-xs font-bold text-white">Statutory Reporting & Export</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Decision-ready executive summaries, vulnerability dossiers, and A4 resettlement justification orders.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Operational Capabilities Grid */}
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
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-subtle transition-all duration-150 hover:-translate-y-1 hover:border-slate-300 hover:shadow-card"
                  href={cap.link}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`flex size-9 items-center justify-center rounded-xl ${cap.bg} ${cap.color}`}>
                        <Icon className="size-4.5" />
                      </div>
                      <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400">
                        {cap.badge}
                      </span>
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

        {/* 6. Technical Architecture & Deterministic Foundations */}
        <section className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-3 p-6 border border-slate-200/90 shadow-card bg-white rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-red-600" />
              <h3 className="text-sm font-bold text-slate-900">Deterministic Multi-Criteria Risk</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Strict 35/25/20/10/10 multi-criteria weighting across hazard intensity, demographic vulnerability, disaster history, exposure, and infrastructure disruption with statutory red zone priority overrides.
            </p>
            <div className="pt-2 border-t border-slate-100">
              <span className="font-mono text-[10px] text-slate-400">Model Weight Invariant: Σ wi = 1.00</span>
            </div>
          </Card>

          <Card className="space-y-3 p-6 border border-slate-200/90 shadow-card bg-white rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">10-Dimension Carrying Capacity</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Geotechnical and infrastructure bottleneck analysis with a mandatory 15% safety buffer (0.85 safety factor) to prevent secondary disaster creation at resettlement sectors.
            </p>
            <div className="pt-2 border-t border-slate-100">
              <span className="font-mono text-[10px] text-slate-400">Headroom Formula: C_eff = min(C_dim) · 0.85</span>
            </div>
          </Card>

          <Card className="space-y-3 p-6 border border-slate-200/90 shadow-card bg-white rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Statutory Authority Governance</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Role-based command profiles, GIS spatial vector inspections (EPSG:4326), climate stress scenario simulations, and machine-readable statutory report exports under DMA 2005.
            </p>
            <div className="pt-2 border-t border-slate-100">
              <span className="font-mono text-[10px] text-slate-400">Authoritative Provenance: Verified Seed Fixtures</span>
            </div>
          </Card>
        </section>

        {/* 7. Footer Strip */}
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 pt-6 pb-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">SIH26191</span>
            <span>·</span>
            <span>State Disaster Management Authority</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link className="hover:text-blue-600 transition-colors" href="/dashboard">
              Dashboard
            </Link>
            <Link className="hover:text-blue-600 transition-colors" href="/map">
              GIS Map
            </Link>
            <Link className="hover:text-blue-600 transition-colors" href="/habitations">
              Risk Queue
            </Link>
            <Link className="hover:text-blue-600 transition-colors" href="/relocation">
              Relocation
            </Link>
            <Link className="hover:text-blue-600 transition-colors" href="/scenarios">
              Scenarios
            </Link>
            <Link className="hover:text-blue-600 transition-colors" href="/reports">
              Reports
            </Link>
            <Link className="hover:text-blue-600 transition-colors" href="/login">
              Login
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

