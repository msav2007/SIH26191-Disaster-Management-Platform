import { habitationsFixture, relocationSitesFixture } from '@/server/db/fixtures/disaster-data';
import {
  defaultScenarioModifiers,
  getScenarioPresetById,
} from '@/server/scenarios/scenario-config';
import { simulateHabitationScenario } from '@/server/scenarios/scenario-engine';
import {
  listScenarioPresets,
  runScenarioSimulation,
} from '@/server/scenarios/scenario-service';

describe('Scenario Engine & Impact Analysis (Phase 8)', () => {
  const chooralmala = habitationsFixture.find((h) => h.id === 'HAB-WY-01')!;
  const sunilWard = habitationsFixture.find((h) => h.id === 'HAB-CH-01')!;

  it('preserves strict immutability of the baseline habitation record', () => {
    const originalHazardRaw = chooralmala.factors.hazardIntensity;
    const originalExposureRaw = chooralmala.factors.exposure;

    const result = simulateHabitationScenario(chooralmala, {
      ...defaultScenarioModifiers,
      rainfallMultiplier: 1.5,
      slopeSaturationFactor: 1.4,
    });

    expect(chooralmala.factors.hazardIntensity).toBe(originalHazardRaw);
    expect(chooralmala.factors.exposure).toBe(originalExposureRaw);
    expect(result.scenarioRisk.factors.hazard.raw).toBeGreaterThanOrEqual(originalHazardRaw);
  });

  it('produces 100% deterministic outputs for repeated simulations', () => {
    const preset = getScenarioPresetById('monsoon_rainfall_20');

    const sim1 = simulateHabitationScenario(chooralmala, preset.modifiers);
    const sim2 = simulateHabitationScenario(chooralmala, preset.modifiers);

    expect(sim1.scenarioRisk.compositeScore).toBe(sim2.scenarioRisk.compositeScore);
    expect(sim1.riskDelta).toBe(sim2.riskDelta);
    expect(sim1.primaryDriverFactor).toBe(sim2.primaryDriverFactor);
    expect(sim1.deterministicExplanation).toBe(sim2.deterministicExplanation);
  });

  it('evaluates +20% monsoon rainfall escalation with expected hazard shifts', () => {
    const preset = getScenarioPresetById('monsoon_rainfall_20');
    const result = simulateHabitationScenario(chooralmala, preset.modifiers, relocationSitesFixture);

    expect(result.riskDelta).toBeGreaterThanOrEqual(0);
    expect(result.scenarioRisk.factors.hazard.raw).toBeGreaterThan(result.baselineRisk.factors.hazard.raw);
    expect(result.factorComparisons.hazard.contributionDelta).toBeGreaterThan(0);
    expect(result.primaryDriverFactor).toBe('hazard');
  });

  it('evaluates extreme cloudburst surge on Himalayan settlements', () => {
    const cloudburstPreset = getScenarioPresetById('cloudburst_extreme');
    const result = simulateHabitationScenario(sunilWard, cloudburstPreset.modifiers, relocationSitesFixture);

    expect(result.scenarioRisk.compositeScore).toBeGreaterThanOrEqual(result.baselineRisk.compositeScore);
    expect(result.factorComparisons.hazard.scenarioRaw).toBeGreaterThanOrEqual(result.factorComparisons.hazard.baselineRaw);
  });

  it('aggregates multi-district scenario impact summary accurately', async () => {
    const impact = await runScenarioSimulation('monsoon_rainfall_20');

    expect(impact.scenario.id).toBe('monsoon_rainfall_20');
    expect(impact.totalHabitationsEvaluated).toBeGreaterThanOrEqual(7);
    expect(impact.totalHabitationsEscalated).toBeGreaterThan(0);
    expect(impact.districtImpacts.length).toBeGreaterThan(0);
    expect(impact.changedHabitations.length).toBeGreaterThan(0);
    expect(impact.provenance).toBe('DEMO DATA');
  });

  it('calculates relocation capacity impact and net headroom', async () => {
    const impact = await runScenarioSimulation('combined_multi_hazard');

    expect(impact.totalAvailableRelocationHeadroom).toBeGreaterThan(0);
    expect(impact.additionalRelocationDemand).toBeGreaterThanOrEqual(0);
  });

  it('lists all 5 standard scenario presets', () => {
    const presets = listScenarioPresets();
    expect(presets).toHaveLength(5);
    expect(presets.map((p) => p.id)).toContain('monsoon_rainfall_20');
    expect(presets.map((p) => p.id)).toContain('cloudburst_extreme');
    expect(presets.map((p) => p.id)).toContain('flood_embankment_breach');
    expect(presets.map((p) => p.id)).toContain('landslide_micro_shearing');
    expect(presets.map((p) => p.id)).toContain('combined_multi_hazard');
  });
});
