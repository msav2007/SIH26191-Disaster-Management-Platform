import Link from 'next/link';

import type {
  CriticalInfrastructure,
  Habitation,
  RedZone,
  RelocationSite,
} from '@/types/domain';
import { CloseIcon } from '@/components/ui/icons';
import { KeyValue } from '@/components/ui/key-value';
import { MetricBar } from '@/components/ui/metric-bar';
import { ProvenanceTag } from '@/components/ui/provenance-tag';
import { StatusPill } from '@/components/ui/status-pill';
import { calculateHabitationRisk } from '@/server/risk/risk-engine';
import { calculateSiteCapacity } from '@/server/capacity/capacity-engine';
import { getPriorityTone } from '@/server/classification/classification-engine';

export type SelectedFeature =
  | { type: 'red_zone'; data: RedZone }
  | { type: 'habitation'; data: Habitation }
  | { type: 'relocation_site'; data: RelocationSite }
  | { type: 'infrastructure'; data: CriticalInfrastructure };

export interface GisFeatureInspectorProps {
  feature: SelectedFeature | null;
  onClose: () => void;
  onSelectFeature?: (feature: SelectedFeature) => void;
}

export function GisFeatureInspector({
  feature,
  onClose,
}: GisFeatureInspectorProps) {
  if (!feature) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-xs text-slate-500">
        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-2xs">
          🗺️
        </div>
        <p className="font-bold text-sm text-slate-900">No Feature Selected</p>
        <p className="mt-1 max-w-[240px] text-xs text-slate-500 leading-relaxed">
          Click on any Statutory Red Zone, Habitation, Relocation Site, or Infrastructure node on the map to inspect evidence.
        </p>
      </div>
    );
  }

  if (feature.type === 'red_zone') {
    const z = feature.data;
    const tone = z.severity === 'critical' ? 'critical' : z.severity === 'high' ? 'high' : 'moderate';

    return (
      <div className="flex h-full flex-col overflow-y-auto p-4 space-y-4">
        <header className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-800">
                STATUTORY RED ZONE
              </span>
              <StatusPill tone={tone}>{z.severity.toUpperCase()}</StatusPill>
              <ProvenanceTag value={z.provenance} />
            </div>
            <h3 className="text-base font-bold text-slate-900">{z.name}</h3>
            <p className="text-[11px] text-slate-500 font-mono">
              {z.id} · {z.district}, {z.state}
            </p>
          </div>
          <button
            aria-label="Close inspector"
            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        {/* 1. WHAT IS THIS? */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-xs space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">1. WHAT IS THIS?</p>
          <p className="font-semibold text-slate-900">
            Statutory high-risk hazard boundary designated under Disaster Management Act 2005.
          </p>
          <p className="text-[11px] text-slate-600">
            Primary hazard: <strong className="capitalize text-red-700">{z.primaryHazard.replace('_', ' ')}</strong> across a {z.radiusKm} km radius envelope ({z.areaSqKm} sq km).
          </p>
        </div>

        {/* 2. WHY DOES IT MATTER? */}
        <div className="rounded-xl border border-red-200 bg-red-50/40 p-3 text-xs space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-800">2. WHY DOES IT MATTER?</p>
          <p className="font-semibold text-red-950">
            {z.affectedPopulation.toLocaleString('en-IN')} residents face acute landslide/flood runout hazard.
          </p>
          <p className="text-[11px] text-slate-700">
            {z.affectedHabitations} surveyed habitations fall within the direct impact envelope, requiring statutory construction moratoriums and phased resettlement.
          </p>
        </div>

        {/* 3. KEY DATA */}
        <div className="space-y-2 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">3. KEY DATA</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-red-200 bg-red-50/40 p-2.5">
              <p className="text-[10px] font-bold uppercase text-red-800">Affected Population</p>
              <p className="tabnum mt-1 text-base font-black text-red-700">
                {z.affectedPopulation.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
              <p className="text-[10px] font-bold uppercase text-slate-500">Zone Envelope</p>
              <p className="tabnum mt-1 text-base font-bold text-slate-900">{z.areaSqKm} sq km</p>
            </div>
          </div>

          <dl className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 space-y-1">
            <KeyValue label="Notification Status" value={z.status} />
            <KeyValue label="Coordinates" mono value={`${z.coordinates.latitude.toFixed(4)}°N, ${z.coordinates.longitude.toFixed(4)}°E`} />
            <KeyValue label="Scientific Source" value={z.source} />
          </dl>
        </div>

        {/* 4. WHAT ACTION CAN I TAKE? */}
        <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">4. WHAT ACTION CAN I TAKE?</p>
          <Link
            className="inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition-colors"
            href="/habitations"
          >
            Inspect Vulnerable Habitations Queue →
          </Link>
          <Link
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            href="/relocation"
          >
            Find Relocation Sites for Affected Residents →
          </Link>
        </div>
      </div>
    );
  }

  if (feature.type === 'habitation') {
    const h = feature.data;
    const risk = calculateHabitationRisk(h);
    const tone = getPriorityTone(risk.priority);

    return (
      <div className="flex h-full flex-col overflow-y-auto p-4 space-y-4">
        <header className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-800">
                VULNERABLE HABITATION
              </span>
              <StatusPill tone={tone}>{risk.priority} Priority</StatusPill>
              <ProvenanceTag value={h.provenance} />
            </div>
            <h3 className="text-base font-bold text-slate-900">{h.name}</h3>
            <p className="text-[11px] text-slate-500 font-mono">
              {h.id} · {h.block} Block, {h.district}, {h.state}
            </p>
          </div>
          <button
            aria-label="Close inspector"
            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        {/* 1. WHAT IS THIS? */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-xs space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">1. WHAT IS THIS?</p>
          <p className="font-semibold text-slate-900">
            Assessed human settlement in multi-hazard catchment zone.
          </p>
          <p className="text-[11px] text-slate-600">
            Population of <strong>{h.population.toLocaleString('en-IN')} persons ({h.households} HH)</strong> on a {h.slopeDeg}° terrain gradient ({h.elevationM}m MSL).
          </p>
        </div>

        {/* 2. WHY DOES IT MATTER? */}
        <div className="rounded-xl border border-red-200 bg-red-50/40 p-3 text-xs space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-800">2. WHY DOES IT MATTER?</p>
          <p className="font-semibold text-red-950">
            Composite Risk Score: <span className="tabnum font-black text-red-700">{risk.compositeScore.toFixed(1)}/100</span> ({risk.priority} Priority).
          </p>
          <p className="text-[11px] text-slate-700">
            {risk.explanation.primaryDriverText}
          </p>
        </div>

        {/* 3. KEY DATA */}
        <div className="space-y-2 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            3. KEY DATA · Multi-Criteria Vulnerability Factors
          </p>
          <div className="space-y-1.5">
            <MetricBar label="Hazard Intensity" showValue tone={h.factors.hazardIntensity >= 90 ? 'critical' : 'high'} value={h.factors.hazardIntensity} />
            <MetricBar label="Population Vulnerability" showValue tone="high" value={h.factors.populationVulnerability} />
            <MetricBar label="Disaster History Recurrence" showValue tone="high" value={h.factors.disasterHistory} />
            <MetricBar label="Infrastructure Isolation" showValue tone="moderate" value={h.factors.infrastructureRisk} />
          </div>

          <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-[11px]">
            <div>Elderly: <span className="tabnum font-bold text-slate-900">{h.demographics.elderly}</span></div>
            <div>Children: <span className="tabnum font-bold text-slate-900">{h.demographics.children}</span></div>
            <div>BPL: <span className="tabnum font-bold text-slate-900">{h.demographics.belowPovertyLine}</span></div>
            <div>Road: <span className="font-bold text-slate-900">{h.infrastructure.allWeatherRoad ? 'Paved' : 'Unpaved'}</span></div>
          </div>
        </div>

        {/* 4. WHAT ACTION CAN I TAKE? */}
        <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">4. WHAT ACTION CAN I TAKE?</p>
          <Link
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            href={`/relocation?habitationId=${h.id}`}
          >
            Find Relocation Sites for {h.name} →
          </Link>
          <Link
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            href={`/habitations?selected=${h.id}`}
          >
            Open Full Habitation Dossier →
          </Link>
        </div>
      </div>
    );
  }

  if (feature.type === 'relocation_site') {
    const s = feature.data;
    const capacityAssessment = calculateSiteCapacity(s);
    const available = capacityAssessment.availableHeadroom;
    const utilPct = capacityAssessment.utilizationPercent;
    const suitabilityTone = s.suitability === 'suitable' ? 'safe' : s.suitability === 'conditionally_suitable' ? 'moderate' : 'critical';

    return (
      <div className="flex h-full flex-col overflow-y-auto p-4 space-y-4">
        <header className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-800">
                RELOCATION SECTOR
              </span>
              <StatusPill tone={suitabilityTone}>{s.suitability.replace('_', ' ').toUpperCase()}</StatusPill>
              <ProvenanceTag value={s.provenance} />
            </div>
            <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
            <p className="text-[11px] text-slate-500 font-mono">
              {s.id} · {s.block} Block, {s.district}, {s.state}
            </p>
          </div>
          <button
            aria-label="Close inspector"
            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        {/* 1. WHAT IS THIS? */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-xs space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">1. WHAT IS THIS?</p>
          <p className="font-semibold text-slate-900">
            Government revenue land parcel vetted for post-disaster resettlement.
          </p>
          <p className="text-[11px] text-slate-600">
            Area: <strong>{s.areaHectares} hectares</strong> ({s.landClass.replace('_', ' ')}).
          </p>
        </div>

        {/* 2. WHY DOES IT MATTER? */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 text-xs space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">2. WHY DOES IT MATTER?</p>
          <p className="font-semibold text-emerald-950">
            Safe absorption capacity: <span className="tabnum font-black text-emerald-700">{available.toLocaleString('en-IN')} persons</span> available.
          </p>
          <p className="text-[11px] text-slate-700">
            Bottleneck factor: <strong>{capacityAssessment.limitingFactorLabel}</strong>. Calculated with a 15% safety factor to avoid secondary disaster creation.
          </p>
        </div>

        {/* 3. KEY DATA */}
        <div className="space-y-2 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">3. KEY DATA</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
              <p className="text-[10px] font-bold uppercase text-slate-500">Effective Capacity</p>
              <p className="tabnum mt-1 text-base font-bold text-slate-900">{capacityAssessment.effectiveCapacity.toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-2.5">
              <p className="text-[10px] font-bold uppercase text-emerald-800">Available Headroom</p>
              <p className="tabnum mt-1 text-base font-black text-emerald-700">{available.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <MetricBar label={`Utilization (${utilPct}%)`} max={100} tone={utilPct > 80 ? 'critical' : 'safe'} value={utilPct} />
        </div>

        {/* 4. WHAT ACTION CAN I TAKE? */}
        <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">4. WHAT ACTION CAN I TAKE?</p>
          <Link
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            href={`/relocation?siteId=${s.id}`}
          >
            Open Complete Site Assessment &amp; Matches →
          </Link>
        </div>
      </div>
    );
  }

  // Infrastructure
  const inf = feature.data;
  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 space-y-4">
      <header className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-800">
              CRITICAL INFRASTRUCTURE
            </span>
            <StatusPill tone="info">{inf.kind.toUpperCase()}</StatusPill>
          </div>
          <h3 className="text-base font-bold text-slate-900">{inf.name}</h3>
          <p className="text-[11px] text-slate-500 font-mono">
            {inf.id} · {inf.district}, {inf.state}
          </p>
        </div>
        <button
          aria-label="Close inspector"
          className="text-slate-400 hover:text-slate-700 transition-colors p-1"
          onClick={onClose}
          type="button"
        >
          <CloseIcon className="size-4" />
        </button>
      </header>

      {/* 1. WHAT IS THIS? */}
      <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-xs space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">1. WHAT IS THIS?</p>
        <p className="font-semibold text-slate-900 capitalize">
          {inf.kind.replace('_', ' ')} emergency response facility.
        </p>
        <p className="text-[11px] text-slate-600">
          Jurisdiction: <strong>{inf.district}, {inf.state}</strong>.
        </p>
      </div>

      {/* 2. WHY DOES IT MATTER? */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3 text-xs space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-800">2. WHY DOES IT MATTER?</p>
        <p className="font-semibold text-blue-950">
          Essential frontline node for casualty evacuation, logistics airlift, and shelter operations.
        </p>
        <p className="text-[11px] text-slate-700">
          Directly supports surrounding habitations during monsoon/landslide emergencies.
        </p>
      </div>

      {/* 3. KEY DATA */}
      <div className="space-y-2 text-xs">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">3. KEY DATA</p>
        <dl className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 space-y-1">
          <KeyValue label="Asset Classification" value={inf.kind.replace('_', ' ').toUpperCase()} />
          <KeyValue label="District" value={inf.district} />
          <KeyValue label="Coordinates" mono value={`${inf.coordinates.latitude.toFixed(4)}°N, ${inf.coordinates.longitude.toFixed(4)}°E`} />
        </dl>
      </div>

      {/* 4. WHAT ACTION CAN I TAKE? */}
      <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">4. WHAT ACTION CAN I TAKE?</p>
        <Link
          className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          href="/dashboard"
        >
          Return to Command Dashboard →
        </Link>
      </div>
    </div>
  );
}
