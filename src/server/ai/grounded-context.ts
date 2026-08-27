import { getHabitationById } from '@/server/repositories/habitations';
import { getRelocationSites } from '@/server/repositories/relocation-sites';
import { findRelocationCandidates } from '@/server/relocation/matching-engine';
import { calculateHabitationRisk } from '@/server/risk/risk-engine';
import type { HabitationScenarioResult } from '@/server/scenarios/scenario-types';
import type {
  GroundedDecisionContext,
  GroundedFactItem,
} from './ai-types';

/**
 * Builds deterministic fact context for Habitation Risk Justification.
 */
export async function buildGroundedContextForHabitation(
  habitationId: string,
): Promise<GroundedDecisionContext | null> {
  const habitation = await getHabitationById(habitationId);
  if (!habitation) return null;

  const risk = calculateHabitationRisk(habitation);

  const verifiedFacts: GroundedFactItem[] = [
    { domain: 'Hazard', metric: 'Intensity Score', value: risk.factors.hazard.raw, weight: '35%', isLimitingOrDominant: true },
    { domain: 'Vulnerability', metric: 'Socio-Demographic Score', value: risk.factors.vulnerability.raw, weight: '25%' },
    { domain: 'History', metric: 'Disaster Recurrence Score', value: risk.factors.history.raw, weight: '20%' },
    { domain: 'Exposure', metric: 'Terrain Exposure Score', value: risk.factors.exposure.raw, weight: '10%' },
    { domain: 'Infrastructure', metric: 'Deficit Risk Score', value: risk.factors.infrastructure.raw, weight: '10%' },
    { domain: 'Demographics', metric: 'Below Poverty Line (BPL)', value: habitation.demographics.belowPovertyLine },
    { domain: 'Demographics', metric: 'Elderly Cohort (60+)', value: habitation.demographics.elderly },
    { domain: 'Demographics', metric: 'Children (<10)', value: habitation.demographics.children },
    { domain: 'Demographics', metric: 'Persons with Disabilities (PWD)', value: habitation.demographics.pwd },
    { domain: 'Infrastructure', metric: 'All-Weather Road', value: habitation.infrastructure.allWeatherRoad ? 'Available' : 'Deficient / Isolated' },
    { domain: 'Infrastructure', metric: 'Health Sub-Centre', value: habitation.infrastructure.healthSubCentre ? 'Available' : 'Deficient / Isolated' },
    { domain: 'Infrastructure', metric: 'Piped Water', value: habitation.infrastructure.pipedWater ? 'Available' : 'Deficient / Isolated' },
  ];

  return {
    mode: 'risk_justification',
    targetId: habitation.id,
    targetName: habitation.name,
    district: habitation.district,
    state: habitation.state,
    primaryHazard: habitation.primaryHazard,
    population: habitation.population,
    households: habitation.households,
    riskScore: risk.compositeScore,
    riskLevel: risk.riskLevel,
    priority: risk.priority,
    timeline: risk.timeline,
    urgencyWindow: risk.urgencyWindow,
    verifiedFacts,
    provenance: habitation.provenance,
  };
}

/**
 * Builds deterministic fact context for Relocation Site Rationale.
 */
export async function buildGroundedContextForRelocation(
  habitationId: string,
): Promise<GroundedDecisionContext | null> {
  const [habitation, allSites] = await Promise.all([
    getHabitationById(habitationId),
    getRelocationSites(),
  ]);

  if (!habitation) return null;

  const risk = calculateHabitationRisk(habitation);
  const plan = findRelocationCandidates(habitation, allSites);
  const top = plan.recommendedSite;

  const verifiedFacts: GroundedFactItem[] = [
    { domain: 'Risk', metric: 'Composite Risk Score', value: risk.compositeScore, isLimitingOrDominant: true },
    { domain: 'Relocation', metric: 'Recommended Sector', value: top?.site.name ?? 'None' },
    { domain: 'Relocation', metric: 'Transit Distance', value: `${top?.distanceKm ?? 0} km` },
    { domain: 'Relocation', metric: 'Suitability Score', value: `${top?.suitability.suitabilityScore ?? 0}/100` },
    { domain: 'Relocation', metric: 'Available Headroom', value: `${top?.capacity.availableHeadroom ?? 0} persons` },
    { domain: 'Relocation', metric: 'Limiting Bottleneck', value: top?.capacity.limitingFactorLabel ?? 'None', isLimitingOrDominant: true },
    { domain: 'Relocation', metric: 'Hazard Exposure', value: top?.site.hazardExposure ?? 'Low' },
  ];

  return {
    mode: 'relocation_rationale',
    targetId: habitation.id,
    targetName: habitation.name,
    district: habitation.district,
    state: habitation.state,
    primaryHazard: habitation.primaryHazard,
    population: habitation.population,
    households: habitation.households,
    riskScore: risk.compositeScore,
    riskLevel: risk.riskLevel,
    priority: risk.priority,
    timeline: risk.timeline,
    urgencyWindow: risk.urgencyWindow,
    verifiedFacts,
    relocationContext: top
      ? {
          recommendedSiteId: top.site.id,
          recommendedSiteName: top.site.name,
          distanceKm: top.distanceKm,
          suitabilityScore: top.suitability.suitabilityScore,
          availableHeadroom: top.capacity.availableHeadroom,
          effectiveCapacity: top.capacity.effectiveCapacity,
          limitingFactor: top.capacity.limitingFactorLabel,
        }
      : undefined,
    provenance: habitation.provenance,
  };
}

/**
 * Builds deterministic fact context for a Scenario Simulation Briefing.
 */
export function buildGroundedContextForScenario(
  scenarioResult: HabitationScenarioResult,
  scenarioName: string,
): GroundedDecisionContext {
  const { habitation, baselineRisk, scenarioRisk, riskDelta, primaryDriverFactor } = scenarioResult;

  const verifiedFacts: GroundedFactItem[] = [
    { domain: 'Baseline', metric: 'Baseline Risk Score', value: baselineRisk.compositeScore },
    { domain: 'Scenario', metric: 'Scenario Risk Score', value: scenarioRisk.compositeScore },
    { domain: 'Delta', metric: 'Score Shift', value: `+${riskDelta.toFixed(1)} pts` },
    { domain: 'Driver', metric: 'Primary Driver', value: primaryDriverFactor, isLimitingOrDominant: true },
    { domain: 'Driver', metric: 'Baseline Driver Raw', value: scenarioResult.factorComparisons[primaryDriverFactor].baselineRaw },
    { domain: 'Driver', metric: 'Scenario Driver Raw', value: scenarioResult.factorComparisons[primaryDriverFactor].scenarioRaw },
    { domain: 'Driver', metric: 'Driver Contribution Shift', value: `+${scenarioResult.factorComparisons[primaryDriverFactor].contributionDelta.toFixed(1)} pts` },
  ];

  return {
    mode: 'scenario_briefing',
    targetId: habitation.id,
    targetName: habitation.name,
    district: habitation.district,
    state: habitation.state,
    primaryHazard: habitation.primaryHazard,
    population: habitation.population,
    households: habitation.households,
    riskScore: scenarioRisk.compositeScore,
    riskLevel: scenarioRisk.riskLevel,
    priority: scenarioRisk.priority,
    timeline: scenarioRisk.timeline,
    urgencyWindow: scenarioRisk.urgencyWindow,
    verifiedFacts,
    scenarioContext: {
      scenarioName,
      baselineRisk: baselineRisk.compositeScore,
      scenarioRisk: scenarioRisk.compositeScore,
      deltaRisk: riskDelta,
      baselinePriority: baselineRisk.priority,
      scenarioPriority: scenarioRisk.priority,
      primaryDriver: primaryDriverFactor,
    },
    provenance: habitation.provenance,
  };
}
