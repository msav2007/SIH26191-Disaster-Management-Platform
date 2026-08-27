import { getHabitations } from '@/server/repositories/habitations';
import { getRelocationSites } from '@/server/repositories/relocation-sites';
import { getRegionalCapacityRollup } from '@/server/capacity/capacity-service';
import { findScenarioPresetById, getScenarioPresetById, scenarioPresets } from './scenario-config';
import { simulateHabitationScenario } from './scenario-engine';
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
 * Runs a complete scenario simulation across all habitations with aggregate impact analysis.
 */
export async function runScenarioSimulation(
  presetId: string = 'monsoon_rainfall_20',
  customModifiers?: Partial<ScenarioModifiers>,
  districtFilter?: string,
): Promise<ScenarioImpactSummary> {
  const preset = getScenarioPresetById(presetId);
  const modifiersApplied: ScenarioModifiers = {
    ...preset.modifiers,
    ...(customModifiers ?? {}),
  };

  const [habitations, allSites, capacityRollup] = await Promise.all([
    getHabitations({ district: districtFilter }),
    getRelocationSites({ district: districtFilter }),
    getRegionalCapacityRollup({ district: districtFilter }),
  ]);

  const results: HabitationScenarioResult[] = habitations.map((h) =>
    simulateHabitationScenario(h, modifiersApplied, allSites),
  );

  // Filter habitations that experienced changes
  const changedHabitations = results.filter(
    (r) => r.riskDelta !== 0 || r.priorityTransition.hasEscalated || r.siteRecommendationChanged,
  );

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

  const totalPopulationAtRiskBaseline = results.reduce((sum, r) => sum + r.habitation.population, 0);
  const totalPopulationAtRiskScenario = results
    .filter((r) => r.scenarioRisk.priority === 'CRITICAL' || r.scenarioRisk.priority === 'HIGH')
    .reduce((sum, r) => sum + r.habitation.population, 0);

  const additionalPopulationAtRisk = results
    .filter((r) => r.priorityTransition.hasEscalated)
    .reduce((sum, r) => sum + r.habitation.population, 0);

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

  // District Rollup
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

    existing.habitationsEvaluated++;
    existing.populationAtRiskBaseline += r.habitation.population;
    if (r.baselineRisk.priority === 'CRITICAL') existing.baselineCriticalCount++;
    if (r.scenarioRisk.priority === 'CRITICAL') existing.scenarioCriticalCount++;
    if (r.priorityTransition.isNewlyCritical) existing.newlyCriticalCount++;
    if (r.priorityTransition.hasEscalated) {
      existing.habitationsEscalated++;
      existing.additionalPopulationAtRisk += r.habitation.population;
    }
    if (r.scenarioRisk.priority === 'CRITICAL' || r.scenarioRisk.priority === 'HIGH') {
      existing.populationAtRiskScenario += r.habitation.population;
    }

    districtMap.set(d, existing);
  }

  const districtImpacts = Array.from(districtMap.values()).sort(
    (a, b) => b.newlyCriticalCount - a.newlyCriticalCount,
  );

  return {
    scenario: preset,
    modifiersApplied,
    timestamp: new Date().toISOString(),
    totalHabitationsEvaluated: habitations.length,
    totalHabitationsEscalated: changedHabitations.length,
    baselineCriticalHabitations,
    scenarioCriticalHabitations,
    newlyCriticalHabitations,
    baselineImmediateRelocations,
    scenarioImmediateRelocations,
    newlyImmediateRelocations,
    totalPopulationAtRiskBaseline,
    totalPopulationAtRiskScenario,
    additionalPopulationAtRisk,
    additionalRelocationDemand,
    totalAvailableRelocationHeadroom,
    capacityDeficit,
    districtImpacts,
    changedHabitations,
    provenance: 'DEMO DATA',
  };
}
