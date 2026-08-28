import { getHabitations } from '@/server/repositories/habitations';
import { getRelocationSites } from '@/server/repositories/relocation-sites';
import { getRegionalCapacityRollup } from '@/server/capacity/capacity-service';
import {
  findScenarioPresetById,
  getScenarioPresetById,
  scenarioPresets,
  BASELINE_SCENARIO_MODIFIERS,
} from './scenario-config';
import { simulateHabitationScenario } from './scenario-engine';
import {
  validateHabitations,
  validateRelocationSites,
  validateScenarioModifiers,
} from '@/server/validation/data-validation';
import { assertSimulationConsistency } from './simulation-consistency';
import type {
  DistrictScenarioImpact,
  HabitationScenarioResult,
  ScenarioImpactSummary,
  ScenarioModifiers,
  ScenarioPreset,
} from './scenario-types';

export function listScenarioPresets(): ScenarioPreset[] {
  return scenarioPresets;
}

export function findScenarioPreset(presetId: string): ScenarioPreset | null {
  return findScenarioPresetById(presetId);
}

export function getScenarioPreset(presetId: string): ScenarioPreset {
  return getScenarioPresetById(presetId);
}

/**
 * Runs a complete scenario simulation across all habitations with mathematically consistent aggregations.
 */
export async function runScenarioSimulation(
  presetId: string = 'monsoon_rainfall_20',
  customModifiers?: Partial<ScenarioModifiers>,
  districtFilter?: string,
): Promise<ScenarioImpactSummary> {
  const preset = getScenarioPresetById(presetId);
  const baseModifiers = presetId === 'baseline_state' ? BASELINE_SCENARIO_MODIFIERS : preset.modifiers;

  const modifiersApplied: ScenarioModifiers = {
    ...baseModifiers,
    ...(customModifiers ?? {}),
  };

  // Validate Modifiers
  validateScenarioModifiers(modifiersApplied);

  const [habitations, allSites, capacityRollup] = await Promise.all([
    getHabitations({ district: districtFilter }),
    getRelocationSites({ district: districtFilter }),
    getRegionalCapacityRollup({ district: districtFilter }),
  ]);

  // Validate Input Datasets
  validateHabitations(habitations);
  validateRelocationSites(allSites);

  const results: HabitationScenarioResult[] = habitations.map((h) =>
    simulateHabitationScenario(h, modifiersApplied, allSites),
  );

  // Filter habitations that experienced changes
  const changedHabitations = results.filter(
    (r) => r.delta !== 0 || r.priorityTransition.hasEscalated || r.siteRecommendationChanged,
  );

  const escalatedHabitations = results.filter((r) => r.priorityTransition.hasEscalated);
  const totalHabitationsEscalated = escalatedHabitations.length;

  const baselineCriticalHabitations = results.filter(
    (r) => r.baselineRisk.priority === 'CRITICAL',
  ).length;
  const scenarioCriticalHabitations = results.filter(
    (r) => r.scenarioRisk.priority === 'CRITICAL',
  ).length;
  const newlyCriticalHabitations = results.filter(
    (r) => r.priorityTransition.isNewlyCritical,
  ).length;

  const baselineImmediateRelocations = results.filter(
    (r) => r.baselineRisk.timeline === 'immediate',
  ).length;
  const scenarioImmediateRelocations = results.filter(
    (r) => r.scenarioRisk.timeline === 'immediate',
  ).length;
  const newlyImmediateRelocations = results.filter(
    (r) => r.timelineTransition.isNewlyImmediate,
  ).length;

  // Single-source population calculations:
  // High Risk Population = Critical + High tier populations
  const totalAssessedPopulation = results.reduce((sum, r) => sum + r.habitation.population, 0);

  const totalPopulationAtRiskBaseline = results
    .filter((r) => r.baselineRisk.priority === 'CRITICAL' || r.baselineRisk.priority === 'HIGH')
    .reduce((sum, r) => sum + r.habitation.population, 0);

  const totalPopulationAtRiskScenario = results
    .filter((r) => r.scenarioRisk.priority === 'CRITICAL' || r.scenarioRisk.priority === 'HIGH')
    .reduce((sum, r) => sum + r.habitation.population, 0);

  const additionalPopulationAtRisk = Math.max(
    0,
    totalPopulationAtRiskScenario - totalPopulationAtRiskBaseline,
  );

  const additionalRelocationDemand = results
    .filter((r) => r.timelineTransition.isNewlyImmediate)
    .reduce((sum, r) => sum + r.habitation.population, 0);

  const totalAvailableRelocationHeadroom = capacityRollup.totalAvailableHeadroom;
  const totalRelocationRequirementScenario = results
    .filter((r) => r.scenarioRisk.timeline === 'immediate')
    .reduce((sum, r) => sum + r.habitation.population, 0);

  const capacityDeficit = Math.max(
    0,
    totalRelocationRequirementScenario - totalAvailableRelocationHeadroom,
  );

  // District Rollup (Strict Sum Equivalence)
  const districtMap = new Map<string, DistrictScenarioImpact>();

  for (const r of results) {
    const d = r.habitation.district;
    const existing = districtMap.get(d) ?? {
      district: d,
      state: r.habitation.state,
      habitationsEvaluated: 0,
      habitationsEscalated: 0,
      baselineCriticalCount: 0,
      scenarioCriticalCount: 0,
      newlyCriticalCount: 0,
      populationAtRiskBaseline: 0,
      populationAtRiskScenario: 0,
      additionalPopulationAtRisk: 0,
    };

    const isBaselineHighRisk = r.baselineRisk.priority === 'CRITICAL' || r.baselineRisk.priority === 'HIGH';
    const isScenarioHighRisk = r.scenarioRisk.priority === 'CRITICAL' || r.scenarioRisk.priority === 'HIGH';

    existing.habitationsEvaluated++;
    if (r.baselineRisk.priority === 'CRITICAL') existing.baselineCriticalCount++;
    if (r.scenarioRisk.priority === 'CRITICAL') existing.scenarioCriticalCount++;
    if (r.priorityTransition.isNewlyCritical) existing.newlyCriticalCount++;
    if (r.priorityTransition.hasEscalated) existing.habitationsEscalated++;

    if (isBaselineHighRisk) existing.populationAtRiskBaseline += r.habitation.population;
    if (isScenarioHighRisk) existing.populationAtRiskScenario += r.habitation.population;
    if (isScenarioHighRisk && !isBaselineHighRisk) existing.additionalPopulationAtRisk += r.habitation.population;

    districtMap.set(d, existing);
  }

  const districtImpacts = Array.from(districtMap.values()).sort(
    (a, b) => b.newlyCriticalCount - a.newlyCriticalCount || b.habitationsEscalated - a.habitationsEscalated,
  );

  const timestamp = new Date().toISOString();

  const summary: ScenarioImpactSummary = {
    scenario: preset,
    modifiersApplied,
    timestamp,
    status: 'COMPLETED',
    totalHabitationsEvaluated: habitations.length,
    totalHabitationsEscalated,
    baselineCriticalHabitations,
    scenarioCriticalHabitations,
    newlyCriticalHabitations,
    baselineImmediateRelocations,
    scenarioImmediateRelocations,
    newlyImmediateRelocations,
    totalAssessedPopulation,
    totalPopulationAtRiskBaseline,
    totalPopulationAtRiskScenario,
    additionalPopulationAtRisk,
    additionalRelocationDemand,
    totalAvailableRelocationHeadroom,
    capacityDeficit,
    districtImpacts,
    allHabitations: results,
    changedHabitations,
    provenance: 'DEMO DATA',

    // Complete Structured Result Sub-Objects
    settlements: results,
    aggregates: {
      totalHabitationsEvaluated: habitations.length,
      totalHabitationsEscalated,
      totalAssessedPopulation,
      totalPopulationAtRiskBaseline,
      totalPopulationAtRiskScenario,
      additionalPopulationAtRisk,
      districtImpacts,
    },
    transitions: {
      baselineCriticalCount: baselineCriticalHabitations,
      scenarioCriticalCount: scenarioCriticalHabitations,
      newlyCriticalCount: newlyCriticalHabitations,
      baselineImmediateCount: baselineImmediateRelocations,
      scenarioImmediateCount: scenarioImmediateRelocations,
      newlyImmediateCount: newlyImmediateRelocations,
    },
    relocation: {
      additionalRelocationDemand,
      totalDemandScenario: totalRelocationRequirementScenario,
      capacityDeficit,
    },
    capacity: {
      totalAvailableRelocationHeadroom,
      totalEffectiveCapacity: capacityRollup.totalEffectiveCapacity,
      totalNominalCapacity: capacityRollup.totalNominalCapacity,
      totalCurrentOccupancy: capacityRollup.totalCurrentOccupancy,
    },
    metadata: {
      timestamp,
      status: 'COMPLETED',
      modelStamp: 'SIH26191-SIMULATION-ENGINE-V2.0',
      provenance: 'DEMO DATA',
      deterministicSeed: `${preset.id}-${JSON.stringify(modifiersApplied)}`,
    },
  };

  // Programmatic consistency validation
  assertSimulationConsistency(summary);

  return summary;
}
