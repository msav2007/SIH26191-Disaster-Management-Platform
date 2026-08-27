import type { Habitation, RelocationSite } from '@/types/domain';
import { findRelocationCandidates } from '@/server/relocation/matching-engine';
import { calculateHabitationRisk } from '@/server/risk/risk-engine';
import type {
  HabitationScenarioResult,
  ScenarioModifiers,
} from './scenario-types';

/**
 * Deterministically simulates the impact of environmental and hazard modifiers on a single habitation.
 * Preserves strict immutability of the baseline habitation record.
 */
export function simulateHabitationScenario(
  habitation: Habitation,
  modifiers: ScenarioModifiers,
  allCandidateSites: RelocationSite[] = [],
): HabitationScenarioResult {
  // 1. Calculate Authoritative Baseline
  const baselineRisk = calculateHabitationRisk(habitation);
  const baselinePlan = allCandidateSites.length > 0
    ? findRelocationCandidates(habitation, allCandidateSites)
    : null;

  // 2. Compute Transparent Hazard Modifiers
  let scenarioHazardRaw = habitation.factors.hazardIntensity;

  if (habitation.primaryHazard === 'landslide') {
    scenarioHazardRaw = Math.round(
      habitation.factors.hazardIntensity * modifiers.rainfallMultiplier * modifiers.slopeSaturationFactor +
        modifiers.cloudburstSurge * 0.35,
    );
  } else if (habitation.primaryHazard === 'flood') {
    scenarioHazardRaw = Math.round(
      habitation.factors.hazardIntensity * modifiers.rainfallMultiplier * modifiers.floodIntensityMultiplier,
    );
  } else if (habitation.primaryHazard === 'cloudburst') {
    scenarioHazardRaw = Math.round(
      habitation.factors.hazardIntensity * modifiers.rainfallMultiplier + modifiers.cloudburstSurge * 1.2,
    );
  } else if (habitation.primaryHazard === 'coastal_erosion') {
    scenarioHazardRaw = Math.round(
      habitation.factors.hazardIntensity * modifiers.floodIntensityMultiplier * (modifiers.rainfallMultiplier > 1 ? 1.08 : 1),
    );
  } else {
    scenarioHazardRaw = Math.round(
      habitation.factors.hazardIntensity * ((modifiers.rainfallMultiplier + modifiers.slopeSaturationFactor) / 2),
    );
  }

  // Bound to valid [0, 100] range
  scenarioHazardRaw = Math.max(0, Math.min(100, scenarioHazardRaw));

  const scenarioExposureRaw = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        habitation.factors.exposure *
          ((modifiers.slopeSaturationFactor + modifiers.floodIntensityMultiplier) / 2),
      ),
    ),
  );

  const scenarioInfraRiskRaw = Math.max(
    0,
    Math.min(
      100,
      Math.round(habitation.factors.infrastructureRisk * modifiers.infrastructureStrainMultiplier),
    ),
  );

  // 3. Create Immutable Scenario Habitation
  const scenarioHabitation: Habitation = {
    ...habitation,
    factors: {
      ...habitation.factors,
      hazardIntensity: scenarioHazardRaw,
      exposure: scenarioExposureRaw,
      infrastructureRisk: scenarioInfraRiskRaw,
    },
  };

  // 4. Authoritative Scenario Risk Evaluation via Existing Risk Engine
  const scenarioRisk = calculateHabitationRisk(scenarioHabitation);

  const scenarioPlan = allCandidateSites.length > 0
    ? findRelocationCandidates(scenarioHabitation, allCandidateSites)
    : null;

  // 5. Compare Factor Breakdown
  const factorKeys = ['hazard', 'vulnerability', 'history', 'exposure', 'infrastructure'] as const;
  const factorComparisons = {} as HabitationScenarioResult['factorComparisons'];

  let maxContributionDelta = -Infinity;
  let primaryDriverFactor: HabitationScenarioResult['primaryDriverFactor'] = 'hazard';

  for (const k of factorKeys) {
    const b = baselineRisk.factors[k];
    const s = scenarioRisk.factors[k];
    const rawDelta = s.raw - b.raw;
    const contributionDelta = Number((s.weightedContribution - b.weightedContribution).toFixed(2));

    factorComparisons[k] = {
      baselineRaw: b.raw,
      scenarioRaw: s.raw,
      rawDelta,
      baselineContribution: b.weightedContribution,
      scenarioContribution: s.weightedContribution,
      contributionDelta,
      weight: b.weight,
    };

    if (contributionDelta > maxContributionDelta) {
      maxContributionDelta = contributionDelta;
      primaryDriverFactor = k;
    }
  }

  // 6. Evaluate Transitions
  const riskDelta = Number((scenarioRisk.compositeScore - baselineRisk.compositeScore).toFixed(1));
  const pctChange = baselineRisk.compositeScore > 0
    ? Number(((riskDelta / baselineRisk.compositeScore) * 100).toFixed(1))
    : 0;

  const priorityOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
  const hasEscalated = priorityOrder[scenarioRisk.priority] > priorityOrder[baselineRisk.priority];
  const isNewlyCritical = baselineRisk.priority !== 'CRITICAL' && scenarioRisk.priority === 'CRITICAL';

  const timelineOrder = { monitoring: 0, medium_term: 1, short_term: 2, immediate: 3 };
  const hasAccelerated = timelineOrder[scenarioRisk.timeline] > timelineOrder[baselineRisk.timeline];
  const isNewlyImmediate = baselineRisk.timeline !== 'immediate' && scenarioRisk.timeline === 'immediate';

  const baselineSite = baselinePlan?.recommendedSite ?? null;
  const scenarioSite = scenarioPlan?.recommendedSite ?? null;
  const siteRecommendationChanged = baselineSite?.site.id !== scenarioSite?.site.id;

  // 7. Generate Deterministic Step Trace Explanation
  const driverComparison = factorComparisons[primaryDriverFactor];
  const deterministicExplanation =
    riskDelta === 0
      ? `Under this scenario simulation, risk score remains unchanged at ${baselineRisk.compositeScore.toFixed(1)}.`
      : `Scenario modifiers increased ${primaryDriverFactor} intensity from ${driverComparison.baselineRaw} to ${driverComparison.scenarioRaw} (+${driverComparison.rawDelta} pts). With a model weight of ${Math.round(driverComparison.weight * 100)}%, its contribution shifted by +${driverComparison.contributionDelta.toFixed(1)} pts. Composite risk moved from ${baselineRisk.compositeScore.toFixed(1)} (${baselineRisk.priority}) to ${scenarioRisk.compositeScore.toFixed(1)} (${scenarioRisk.priority}), ${isNewlyImmediate ? 'advancing required relocation urgency to IMMEDIATE (0–6 months).' : isNewlyCritical ? 'escalating settlement priority to CRITICAL.' : 'maintaining the existing triage priority band.'}`;

  return {
    habitation,
    baselineRisk,
    scenarioRisk,
    riskDelta,
    pctChange,
    priorityTransition: {
      baseline: baselineRisk.priority,
      scenario: scenarioRisk.priority,
      hasEscalated,
      isNewlyCritical,
    },
    timelineTransition: {
      baseline: baselineRisk.timeline,
      scenario: scenarioRisk.timeline,
      hasAccelerated,
      isNewlyImmediate,
    },
    factorComparisons,
    primaryDriverFactor,
    baselineRecommendedSite: baselineSite,
    scenarioRecommendedSite: scenarioSite,
    siteRecommendationChanged,
    deterministicExplanation,
  };
}
