import type { Habitation, RelocationSite } from '@/types/domain';
import { findRelocationCandidates } from '@/server/relocation/matching-engine';
import { calculateHabitationRisk } from '@/server/risk/risk-engine';
import { validateScenarioModifiers } from '@/server/validation/data-validation';
import type {
  FactorComparison,
  FactorDriverKey,
  HabitationScenarioResult,
  ScenarioModifiers,
} from './scenario-types';

/**
 * Deterministically simulates the impact of environmental and hazard modifiers on a single habitation.
 * Preserves strict immutability of the baseline habitation record.
 * Mathematical invariants guaranteed:
 *   delta === scenarioScore - baselineScore
 *   deltaPercentage === (delta / baselineScore) * 100
 */
export function simulateHabitationScenario(
  habitation: Habitation,
  modifiers: ScenarioModifiers,
  allCandidateSites: RelocationSite[] = [],
): HabitationScenarioResult {
  // 1. Validate Input Modifiers
  validateScenarioModifiers(modifiers);

  // 2. Calculate Authoritative Baseline (Immutable)
  const baselineRisk = calculateHabitationRisk(habitation);
  const baselinePlan = allCandidateSites.length > 0
    ? findRelocationCandidates(habitation, allCandidateSites)
    : null;

  // 3. Compute Transparent Hazard Modifiers
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

  // 4. Create Immutable Scenario Habitation
  const scenarioHabitation: Habitation = {
    ...habitation,
    factors: {
      ...habitation.factors,
      hazardIntensity: scenarioHazardRaw,
      exposure: scenarioExposureRaw,
      infrastructureRisk: scenarioInfraRiskRaw,
    },
  };

  // 5. Authoritative Scenario Risk Evaluation via Existing Risk Engine
  const scenarioRisk = calculateHabitationRisk(scenarioHabitation);

  const scenarioPlan = allCandidateSites.length > 0
    ? findRelocationCandidates(scenarioHabitation, allCandidateSites)
    : null;

  // 6. Compare Factor Breakdown
  const factorKeys: FactorDriverKey[] = ['hazard', 'vulnerability', 'history', 'exposure', 'infrastructure'];
  const factorComparisons = {} as Record<FactorDriverKey, FactorComparison>;

  let maxContributionDelta = -Infinity;
  let primaryDriverFactor: FactorDriverKey = 'hazard';

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

  // 7. Evaluate Transitions & Deltas
  const baselineScore = baselineRisk.compositeScore;
  const scenarioScore = scenarioRisk.compositeScore;
  const delta = Number((scenarioScore - baselineScore).toFixed(1));
  const deltaPercentage = baselineScore > 0
    ? Number(((delta / baselineScore) * 100).toFixed(1))
    : 0;

  const priorityOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
  const priorityChanged = baselineRisk.priority !== scenarioRisk.priority;
  const hasEscalated = priorityOrder[scenarioRisk.priority] > priorityOrder[baselineRisk.priority];
  const isNewlyCritical = baselineRisk.priority !== 'CRITICAL' && scenarioRisk.priority === 'CRITICAL';

  const timelineOrder = { monitoring: 0, medium_term: 1, short_term: 2, immediate: 3 };
  const timelineChanged = baselineRisk.timeline !== scenarioRisk.timeline;
  const hasAccelerated = timelineOrder[scenarioRisk.timeline] > timelineOrder[baselineRisk.timeline];
  const isNewlyImmediate = baselineRisk.timeline !== 'immediate' && scenarioRisk.timeline === 'immediate';

  const baselineSite = baselinePlan?.recommendedSite ?? null;
  const scenarioSite = scenarioPlan?.recommendedSite ?? null;
  const siteRecommendationChanged = baselineSite?.site.id !== scenarioSite?.site.id;

  // 8. Generate Deterministic Step Trace Explanation
  const driverComparison = factorComparisons[primaryDriverFactor];
  let deterministicExplanation = '';
  if (delta === 0) {
    deterministicExplanation = `Under this scenario simulation, risk score remains unchanged at ${baselineScore.toFixed(1)}.`;
  } else {
    const rawSign = driverComparison.rawDelta >= 0 ? '+' : '';
    const contrSign = driverComparison.contributionDelta >= 0 ? '+' : '';
    const verb = driverComparison.rawDelta >= 0 ? 'increased' : 'reduced';
    const transitionEffect = isNewlyImmediate
      ? 'advancing required relocation urgency to IMMEDIATE (0–6 months).'
      : isNewlyCritical
        ? 'escalating settlement priority to CRITICAL.'
        : 'maintaining the existing triage priority band.';

    deterministicExplanation = `Scenario modifiers ${verb} ${primaryDriverFactor} intensity from ${driverComparison.baselineRaw} to ${driverComparison.scenarioRaw} (${rawSign}${driverComparison.rawDelta} pts). With a model weight of ${Math.round(driverComparison.weight * 100)}%, its contribution shifted by ${contrSign}${driverComparison.contributionDelta.toFixed(1)} pts. Composite risk moved from ${baselineScore.toFixed(1)} (${baselineRisk.priority}) to ${scenarioScore.toFixed(1)} (${scenarioRisk.priority}), ${transitionEffect}`;
  }

  return {
    habitation,
    baselineRisk,
    scenarioRisk,
    baselineScore,
    scenarioScore,
    delta,
    deltaPercentage,
    baselinePriority: baselineRisk.priority,
    scenarioPriority: scenarioRisk.priority,
    priorityChanged,
    baselineTimeline: baselineRisk.timeline,
    scenarioTimeline: scenarioRisk.timeline,
    timelineChanged,
    primaryDriver: primaryDriverFactor,
    driverContribution: maxContributionDelta > -Infinity ? maxContributionDelta : 0,

    // Backward-compatibility aliases
    riskDelta: delta,
    pctChange: deltaPercentage,
    primaryDriverFactor,

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
    baselineRecommendedSite: baselineSite,
    scenarioRecommendedSite: scenarioSite,
    siteRecommendationChanged,
    deterministicExplanation,
  };
}
