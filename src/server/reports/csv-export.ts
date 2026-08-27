import { getHabitations } from '@/server/repositories/habitations';
import { getRelocationSites } from '@/server/repositories/relocation-sites';
import { findRelocationCandidates } from '@/server/relocation/matching-engine';
import { calculateHabitationRisk } from '@/server/risk/risk-engine';

/**
 * Escapes any value to RFC 4180 compliant CSV string format.
 */
export function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates formatted CSV for all vulnerable habitations, multi-hazard risk scores, and recommended sites.
 */
export async function generateHabitationsPrioritizationCsv(filter?: {
  district?: string | undefined;
  priority?: string | undefined;
  hazard?: string | undefined;
}): Promise<string> {
  const [habitations, allSites] = await Promise.all([
    getHabitations(filter),
    getRelocationSites(),
  ]);

  const headers = [
    'habitation_id',
    'habitation_name',
    'district',
    'block',
    'state',
    'population',
    'households',
    'primary_hazard',
    'composite_risk_score',
    'risk_level',
    'relocation_priority',
    'urgency_window',
    'hazard_score',
    'vulnerability_score',
    'history_score',
    'exposure_score',
    'infrastructure_score',
    'recommended_site_id',
    'recommended_site_name',
    'transit_distance_km',
    'suitability_score',
    'available_headroom',
    'limiting_factor',
    'provenance',
  ];

  const rows: string[] = [headers.join(',')];

  for (const h of habitations) {
    if (filter?.hazard && filter.hazard !== 'all' && h.primaryHazard !== filter.hazard) {
      continue;
    }

    const risk = calculateHabitationRisk(h);
    const plan = findRelocationCandidates(h, allSites);
    const topSite = plan.recommendedSite;

    const row = [
      escapeCsvField(h.id),
      escapeCsvField(h.name),
      escapeCsvField(h.district),
      escapeCsvField(h.block),
      escapeCsvField(h.state),
      escapeCsvField(h.population),
      escapeCsvField(h.households),
      escapeCsvField(h.primaryHazard),
      escapeCsvField(risk.compositeScore.toFixed(1)),
      escapeCsvField(risk.riskLevel),
      escapeCsvField(risk.priority),
      escapeCsvField(risk.urgencyWindow),
      escapeCsvField(risk.factors.hazard.raw),
      escapeCsvField(risk.factors.vulnerability.raw),
      escapeCsvField(risk.factors.history.raw),
      escapeCsvField(risk.factors.exposure.raw),
      escapeCsvField(risk.factors.infrastructure.raw),
      escapeCsvField(topSite?.site.id ?? 'NONE'),
      escapeCsvField(topSite?.site.name ?? 'No Feasible Site'),
      escapeCsvField(topSite?.distanceKm ?? ''),
      escapeCsvField(topSite?.suitability.suitabilityScore ?? ''),
      escapeCsvField(topSite?.capacity.availableHeadroom ?? ''),
      escapeCsvField(topSite?.capacity.limitingFactorLabel ?? ''),
      escapeCsvField(h.provenance),
    ];

    rows.push(row.join(','));
  }

  return rows.join('\r\n');
}

/**
 * Generates formatted CSV for candidate relocation site allocations and carrying capacity headroom.
 */
export async function generateRelocationAllocationsCsv(filter?: {
  district?: string | undefined;
}): Promise<string> {
  const [habitations, allSites] = await Promise.all([
    getHabitations(filter),
    getRelocationSites(filter),
  ]);

  const headers = [
    'habitation_id',
    'habitation_name',
    'population',
    'priority',
    'candidate_site_id',
    'candidate_site_name',
    'district',
    'land_class',
    'nominal_capacity',
    'effective_capacity',
    'available_headroom',
    'utilization_pct',
    'limiting_factor',
    'distance_km',
    'suitability_score',
    'suitability_band',
    'is_recommended',
    'rank',
    'provenance',
  ];

  const rows: string[] = [headers.join(',')];

  for (const h of habitations) {
    const plan = findRelocationCandidates(h, allSites);
    const candidateList = [
      ...(plan.recommendedSite ? [plan.recommendedSite] : []),
      ...plan.alternativeSites,
    ];

    for (const c of candidateList) {
      const row = [
        escapeCsvField(h.id),
        escapeCsvField(h.name),
        escapeCsvField(h.population),
        escapeCsvField(h.priority),
        escapeCsvField(c.site.id),
        escapeCsvField(c.site.name),
        escapeCsvField(c.site.district),
        escapeCsvField(c.site.landClass),
        escapeCsvField(c.capacity.nominalCapacity),
        escapeCsvField(c.capacity.effectiveCapacity),
        escapeCsvField(c.capacity.availableHeadroom),
        escapeCsvField(c.capacity.utilizationPercent),
        escapeCsvField(c.capacity.limitingFactorLabel),
        escapeCsvField(c.distanceKm),
        escapeCsvField(c.suitability.suitabilityScore),
        escapeCsvField(c.suitability.suitabilityBand),
        escapeCsvField(c.isRecommended ? 'YES' : 'NO'),
        escapeCsvField(c.rank),
        escapeCsvField(c.site.provenance),
      ];

      rows.push(row.join(','));
    }
  }

  return rows.join('\r\n');
}

/**
 * Generates RFC 4180 CSV export for Scenario Simulation Impact.
 */
export async function generateScenarioImpactCsv(
  scenarioId: string = 'monsoon_rainfall_20',
  districtFilter?: string,
): Promise<string> {
  const { runScenarioSimulation } = await import('@/server/scenarios/scenario-service');
  const impact = await runScenarioSimulation(scenarioId, undefined, districtFilter);

  const headers = [
    'habitation_id',
    'habitation_name',
    'district',
    'state',
    'population',
    'primary_hazard',
    'baseline_risk_score',
    'scenario_risk_score',
    'risk_delta',
    'pct_change',
    'baseline_priority',
    'scenario_priority',
    'is_newly_critical',
    'baseline_timeline',
    'scenario_timeline',
    'is_newly_immediate',
    'primary_driver_factor',
    'allocated_site_id',
    'allocated_site_name',
    'scenario_name',
    'provenance',
  ];

  const rows: string[] = [headers.join(',')];

  for (const r of impact.changedHabitations) {
    const row = [
      escapeCsvField(r.habitation.id),
      escapeCsvField(r.habitation.name),
      escapeCsvField(r.habitation.district),
      escapeCsvField(r.habitation.state),
      escapeCsvField(r.habitation.population),
      escapeCsvField(r.habitation.primaryHazard),
      escapeCsvField(r.baselineRisk.compositeScore.toFixed(1)),
      escapeCsvField(r.scenarioRisk.compositeScore.toFixed(1)),
      escapeCsvField(r.riskDelta.toFixed(1)),
      escapeCsvField(`${r.pctChange.toFixed(1)}%`),
      escapeCsvField(r.baselineRisk.priority),
      escapeCsvField(r.scenarioRisk.priority),
      escapeCsvField(r.priorityTransition.isNewlyCritical ? 'YES' : 'NO'),
      escapeCsvField(r.baselineRisk.urgencyWindow),
      escapeCsvField(r.scenarioRisk.urgencyWindow),
      escapeCsvField(r.timelineTransition.isNewlyImmediate ? 'YES' : 'NO'),
      escapeCsvField(r.primaryDriverFactor),
      escapeCsvField(r.scenarioRecommendedSite?.site.id ?? 'NONE'),
      escapeCsvField(r.scenarioRecommendedSite?.site.name ?? 'None'),
      escapeCsvField(impact.scenario.name),
      escapeCsvField(r.habitation.provenance),
    ];

    rows.push(row.join(','));
  }

  return rows.join('\r\n');
}
