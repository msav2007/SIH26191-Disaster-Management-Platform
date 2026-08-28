import { describe, expect, it } from 'vitest';
import { calculateSiteCapacity } from '@/server/capacity/capacity-engine';
import { getRegionalCapacityRollup } from '@/server/capacity/capacity-service';
import { evaluateCandidateSites } from '@/server/gis/spatial-queries';
import { getHabitations } from '@/server/repositories/habitations';
import { getRelocationSites } from '@/server/repositories/relocation-sites';
import { getPlatformSummary } from '@/server/repositories/decision-summary';
import { runScenarioSimulation } from '@/server/scenarios/scenario-service';

describe('Single Source of Truth Verification', () => {
  it('guarantees identical headroom across GIS, Capacity Engine, and Platform Summary', async () => {
    const [allSites, capacityRollup, summary] = await Promise.all([
      getRelocationSites(),
      getRegionalCapacityRollup(),
      getPlatformSummary(),
    ]);

    // 1. Check aggregate headroom matches exactly
    const sumHeadroomFromSites = allSites
      .map((s) => calculateSiteCapacity(s).availableHeadroom)
      .reduce((sum, h) => sum + h, 0);

    expect(capacityRollup.totalAvailableHeadroom).toBe(sumHeadroomFromSites);
    expect(summary.relocationSites.availableCapacity).toBe(sumHeadroomFromSites);

    // 2. Check individual candidate matches in spatial-queries use authoritative headroom
    const habitations = await getHabitations();
    const firstHabitation = habitations[0]!;
    const candidateMatches = evaluateCandidateSites(firstHabitation, allSites);

    for (const match of candidateMatches) {
      const directCapacity = calculateSiteCapacity(match.site);
      expect(match.availableCapacity).toBe(directCapacity.availableHeadroom);
    }
  });

  it('guarantees Reset Baseline produces exact 0 deltas and 0 escalations', async () => {
    const baselineSimulation = await runScenarioSimulation('baseline_state');

    expect(baselineSimulation.totalHabitationsEscalated).toBe(0);
    expect(baselineSimulation.newlyCriticalHabitations).toBe(0);
    expect(baselineSimulation.newlyImmediateRelocations).toBe(0);
    expect(baselineSimulation.additionalPopulationAtRisk).toBe(0);
    expect(baselineSimulation.additionalRelocationDemand).toBe(0);

    for (const r of baselineSimulation.allHabitations) {
      expect(r.delta).toBe(0);
      expect(r.deltaPercentage).toBe(0);
      expect(r.priorityChanged).toBe(false);
      expect(r.timelineChanged).toBe(false);
      expect(r.scenarioScore).toBe(r.baselineScore);
      expect(r.scenarioPriority).toBe(r.baselinePriority);
      expect(r.scenarioTimeline).toBe(r.baselineTimeline);
    }
  });

  it('guarantees population aggregations match exact sum of habitations', async () => {
    const habitations = await getHabitations();
    const totalExpectedPop = habitations.reduce((sum, h) => sum + h.population, 0);

    const simulation = await runScenarioSimulation('monsoon_rainfall_20');
    expect(simulation.totalAssessedPopulation).toBe(totalExpectedPop);

    // District population sums match total
    const sumDistrictEvaluated = simulation.districtImpacts.reduce(
      (sum, d) => sum + d.habitationsEvaluated,
      0,
    );
    expect(sumDistrictEvaluated).toBe(habitations.length);

    const sumDistrictEscalated = simulation.districtImpacts.reduce(
      (sum, d) => sum + d.habitationsEscalated,
      0,
    );
    expect(sumDistrictEscalated).toBe(simulation.totalHabitationsEscalated);
  });
});
