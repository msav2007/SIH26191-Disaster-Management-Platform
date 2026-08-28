import type { ScenarioImpactSummary } from './scenario-types';

export class SimulationConsistencyError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = 'SimulationConsistencyError';
  }
}

const priorityRank: Record<string, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
};

const timelineRank: Record<string, number> = {
  monitoring: 0,
  medium_term: 1,
  short_term: 2,
  immediate: 3,
};

/**
 * Development & Verification Utility:
 * Programmatically asserts internal mathematical consistency across all dimensions of a simulation result.
 * Detects calculation discrepancies, rounding leaks, population mismatches, and aggregation errors.
 */
export function assertSimulationConsistency(result: ScenarioImpactSummary): void {
  const settlements = result.allHabitations && result.allHabitations.length > 0
    ? result.allHabitations
    : result.changedHabitations;

  if (!settlements || settlements.length === 0) {
    throw new SimulationConsistencyError('Simulation result contains zero settlement evaluations.');
  }

  // 1. Settlement-level Mathematical Invariants
  for (const s of settlements) {
    const expectedDelta = Number((s.scenarioScore - s.baselineScore).toFixed(1));
    const deltaDiff = Math.abs(s.delta - expectedDelta);
    if (deltaDiff > 1e-4) {
      throw new SimulationConsistencyError(
        `Delta invariant failed for settlement '${s.habitation.name}' (${s.habitation.id}): ` +
          `scenarioScore (${s.scenarioScore}) - baselineScore (${s.baselineScore}) = ${expectedDelta}, but recorded delta is ${s.delta}.`,
      );
    }

    if (s.riskDelta !== s.delta) {
      throw new SimulationConsistencyError(
        `Alias mismatch for '${s.habitation.id}': riskDelta (${s.riskDelta}) !== delta (${s.delta})`,
      );
    }

    const expectedPct = s.baselineScore > 0
      ? Number(((s.delta / s.baselineScore) * 100).toFixed(1))
      : 0;
    if (Math.abs(s.deltaPercentage - expectedPct) > 1e-4) {
      throw new SimulationConsistencyError(
        `Delta percentage invariant failed for '${s.habitation.id}': expected ${expectedPct}%, received ${s.deltaPercentage}%`,
      );
    }

    const hasEscalatedExpected = priorityRank[s.scenarioPriority]! > priorityRank[s.baselinePriority]!;
    if (s.priorityTransition.hasEscalated !== hasEscalatedExpected) {
      throw new SimulationConsistencyError(
        `Priority transition escalation flag incorrect for '${s.habitation.id}': ` +
          `from ${s.baselinePriority} to ${s.scenarioPriority}, expected hasEscalated=${hasEscalatedExpected}`,
      );
    }

    const isNewlyCriticalExpected = s.baselinePriority !== 'CRITICAL' && s.scenarioPriority === 'CRITICAL';
    if (s.priorityTransition.isNewlyCritical !== isNewlyCriticalExpected) {
      throw new SimulationConsistencyError(
        `Newly critical flag incorrect for '${s.habitation.id}': expected ${isNewlyCriticalExpected}`,
      );
    }

    const hasAcceleratedExpected = timelineRank[s.scenarioTimeline]! > timelineRank[s.baselineTimeline]!;
    if (s.timelineTransition.hasAccelerated !== hasAcceleratedExpected) {
      throw new SimulationConsistencyError(
        `Timeline acceleration flag incorrect for '${s.habitation.id}': expected ${hasAcceleratedExpected}`,
      );
    }

    const isNewlyImmediateExpected = s.baselineTimeline !== 'immediate' && s.scenarioTimeline === 'immediate';
    if (s.timelineTransition.isNewlyImmediate !== isNewlyImmediateExpected) {
      throw new SimulationConsistencyError(
        `Newly immediate flag incorrect for '${s.habitation.id}': expected ${isNewlyImmediateExpected}`,
      );
    }
  }

  // 2. Aggregate Totals Invariants
  if (result.totalHabitationsEvaluated !== settlements.length) {
    throw new SimulationConsistencyError(
      `Total evaluated mismatch: headline ${result.totalHabitationsEvaluated} !== settlements count ${settlements.length}`,
    );
  }

  const calculatedEscalated = settlements.filter((s) => s.priorityTransition.hasEscalated).length;
  if (result.totalHabitationsEscalated !== calculatedEscalated) {
    throw new SimulationConsistencyError(
      `Total escalated mismatch: headline ${result.totalHabitationsEscalated} !== counted ${calculatedEscalated}`,
    );
  }

  const calculatedBaselineCritical = settlements.filter((s) => s.baselinePriority === 'CRITICAL').length;
  if (result.baselineCriticalHabitations !== calculatedBaselineCritical) {
    throw new SimulationConsistencyError(
      `Baseline critical count mismatch: headline ${result.baselineCriticalHabitations} !== counted ${calculatedBaselineCritical}`,
    );
  }

  const calculatedScenarioCritical = settlements.filter((s) => s.scenarioPriority === 'CRITICAL').length;
  if (result.scenarioCriticalHabitations !== calculatedScenarioCritical) {
    throw new SimulationConsistencyError(
      `Scenario critical count mismatch: headline ${result.scenarioCriticalHabitations} !== counted ${calculatedScenarioCritical}`,
    );
  }

  const calculatedNewlyCritical = settlements.filter((s) => s.priorityTransition.isNewlyCritical).length;
  if (result.newlyCriticalHabitations !== calculatedNewlyCritical) {
    throw new SimulationConsistencyError(
      `Newly critical count mismatch: headline ${result.newlyCriticalHabitations} !== counted ${calculatedNewlyCritical}`,
    );
  }

  // 3. Population Aggregation Invariants
  const expectedTotalPopulation = settlements.reduce((sum, s) => sum + s.habitation.population, 0);
  if (result.totalAssessedPopulation !== expectedTotalPopulation) {
    throw new SimulationConsistencyError(
      `Total assessed population mismatch: headline ${result.totalAssessedPopulation} !== sum ${expectedTotalPopulation}`,
    );
  }

  const expectedBaselineHighRiskPop = settlements
    .filter((s) => s.baselinePriority === 'CRITICAL' || s.baselinePriority === 'HIGH')
    .reduce((sum, s) => sum + s.habitation.population, 0);
  if (result.totalPopulationAtRiskBaseline !== expectedBaselineHighRiskPop) {
    throw new SimulationConsistencyError(
      `Baseline high-risk population mismatch: headline ${result.totalPopulationAtRiskBaseline} !== sum ${expectedBaselineHighRiskPop}`,
    );
  }

  const expectedScenarioHighRiskPop = settlements
    .filter((s) => s.scenarioPriority === 'CRITICAL' || s.scenarioPriority === 'HIGH')
    .reduce((sum, s) => sum + s.habitation.population, 0);
  if (result.totalPopulationAtRiskScenario !== expectedScenarioHighRiskPop) {
    throw new SimulationConsistencyError(
      `Scenario high-risk population mismatch: headline ${result.totalPopulationAtRiskScenario} !== sum ${expectedScenarioHighRiskPop}`,
    );
  }

  const expectedAdditionalPopAtRisk = Math.max(0, expectedScenarioHighRiskPop - expectedBaselineHighRiskPop);
  if (result.additionalPopulationAtRisk !== expectedAdditionalPopAtRisk) {
    throw new SimulationConsistencyError(
      `Additional population at risk mismatch: headline ${result.additionalPopulationAtRisk} !== calculated ${expectedAdditionalPopAtRisk}`,
    );
  }

  // 4. District Breakdown Equivalence
  const districtEvaluatedSum = result.districtImpacts.reduce((sum, d) => sum + d.habitationsEvaluated, 0);
  if (districtEvaluatedSum !== settlements.length) {
    throw new SimulationConsistencyError(
      `District evaluated sum (${districtEvaluatedSum}) does not equal total settlements (${settlements.length}).`,
    );
  }

  const districtEscalatedSum = result.districtImpacts.reduce((sum, d) => sum + d.habitationsEscalated, 0);
  if (districtEscalatedSum !== result.totalHabitationsEscalated) {
    throw new SimulationConsistencyError(
      `District escalated sum (${districtEscalatedSum}) does not equal headline escalated (${result.totalHabitationsEscalated}).`,
    );
  }

  const districtBaselineCriticalSum = result.districtImpacts.reduce((sum, d) => sum + d.baselineCriticalCount, 0);
  if (districtBaselineCriticalSum !== result.baselineCriticalHabitations) {
    throw new SimulationConsistencyError(
      `District baseline critical sum (${districtBaselineCriticalSum}) does not equal headline (${result.baselineCriticalHabitations}).`,
    );
  }

  const districtScenarioCriticalSum = result.districtImpacts.reduce((sum, d) => sum + d.scenarioCriticalCount, 0);
  if (districtScenarioCriticalSum !== result.scenarioCriticalHabitations) {
    throw new SimulationConsistencyError(
      `District scenario critical sum (${districtScenarioCriticalSum}) does not equal headline (${result.scenarioCriticalHabitations}).`,
    );
  }

  // 5. Relocation Capacity Invariants
  const immediateDemandScenario = settlements
    .filter((s) => s.scenarioTimeline === 'immediate')
    .reduce((sum, s) => sum + s.habitation.population, 0);

  const expectedDeficit = Math.max(0, immediateDemandScenario - result.totalAvailableRelocationHeadroom);
  if (result.capacityDeficit !== expectedDeficit) {
    throw new SimulationConsistencyError(
      `Capacity deficit mismatch: headline ${result.capacityDeficit} !== calculated ${expectedDeficit} (Demand: ${immediateDemandScenario}, Headroom: ${result.totalAvailableRelocationHeadroom})`,
    );
  }
}
