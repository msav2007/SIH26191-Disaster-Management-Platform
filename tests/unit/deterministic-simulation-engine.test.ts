import { describe, expect, it } from 'vitest';
import { runScenarioSimulation } from '@/server/scenarios/scenario-service';
import {
  assertSimulationConsistency,
  SimulationConsistencyError,
} from '@/server/scenarios/simulation-consistency';
import { BASELINE_SCENARIO_MODIFIERS, scenarioPresets } from '@/server/scenarios/scenario-config';
import { CalculationValidationError } from '@/server/validation/data-validation';
import type { ScenarioImpactSummary, ScenarioModifiers } from '@/server/scenarios/scenario-types';

describe('Deterministic Simulation Engine & Run Simulation Reliability', () => {
  describe('1. Baseline Simulation', () => {
    it('produces exact 0 delta and zero escalations for baseline state', async () => {
      const baseline = await runScenarioSimulation('baseline_state');

      expect(baseline.status).toBe('COMPLETED');
      expect(baseline.totalHabitationsEscalated).toBe(0);
      expect(baseline.newlyCriticalHabitations).toBe(0);
      expect(baseline.newlyImmediateRelocations).toBe(0);
      expect(baseline.additionalPopulationAtRisk).toBe(0);
      expect(baseline.additionalRelocationDemand).toBe(0);

      for (const s of baseline.allHabitations) {
        expect(s.delta).toBe(0);
        expect(s.deltaPercentage).toBe(0);
        expect(s.scenarioScore).toBe(s.baselineScore);
        expect(s.scenarioPriority).toBe(s.baselinePriority);
        expect(s.scenarioTimeline).toBe(s.baselineTimeline);
        expect(s.priorityChanged).toBe(false);
        expect(s.timelineChanged).toBe(false);
      }

      // Assert internal consistency utility passes
      expect(() => assertSimulationConsistency(baseline)).not.toThrow();
    });
  });

  describe('2. Minimum and Maximum Slider Boundaries', () => {
    it('handles minimum slider values accurately (all 1.0 / 0)', async () => {
      const minModifiers: ScenarioModifiers = {
        rainfallMultiplier: 1.0,
        cloudburstSurge: 0,
        slopeSaturationFactor: 1.0,
        floodIntensityMultiplier: 1.0,
        infrastructureStrainMultiplier: 1.0,
      };

      const result = await runScenarioSimulation('baseline_state', minModifiers);
      expect(result.totalHabitationsEscalated).toBe(0);
      expect(result.additionalPopulationAtRisk).toBe(0);
      expect(() => assertSimulationConsistency(result)).not.toThrow();
    });

    it('handles maximum slider values accurately (2.0x / +50 pts)', async () => {
      const maxModifiers: ScenarioModifiers = {
        rainfallMultiplier: 2.0,
        cloudburstSurge: 50,
        slopeSaturationFactor: 2.0,
        floodIntensityMultiplier: 2.0,
        infrastructureStrainMultiplier: 2.0,
      };

      const result = await runScenarioSimulation('baseline_state', maxModifiers);

      expect(result.totalHabitationsEvaluated).toBeGreaterThan(0);
      expect(result.totalHabitationsEscalated).toBeGreaterThan(0);

      for (const s of result.allHabitations) {
        expect(s.scenarioScore).toBeLessThanOrEqual(100);
        expect(s.scenarioScore).toBeGreaterThanOrEqual(s.baselineScore);
        expect(s.delta).toBeGreaterThanOrEqual(0);
        expect(s.delta).toBe(Number((s.scenarioScore - s.baselineScore).toFixed(1)));
      }

      expect(() => assertSimulationConsistency(result)).not.toThrow();
    });
  });

  describe('3. Default Preset Configurations', () => {
    it('evaluates all configured presets cleanly with passing consistency checks', async () => {
      for (const preset of scenarioPresets) {
        const result = await runScenarioSimulation(preset.id);
        expect(result.scenario.id).toBe(preset.id);
        expect(result.status).toBe('COMPLETED');
        expect(result.allHabitations.length).toBe(result.totalHabitationsEvaluated);
        expect(() => assertSimulationConsistency(result)).not.toThrow();
      }
    });
  });

  describe('4. Determinism & Repeated Runs', () => {
    it('produces bit-for-bit identical numbers on repeated runs with identical parameters', async () => {
      const modifiers: ScenarioModifiers = {
        rainfallMultiplier: 1.35,
        cloudburstSurge: 25,
        slopeSaturationFactor: 1.4,
        floodIntensityMultiplier: 1.2,
        infrastructureStrainMultiplier: 1.15,
      };

      const run1 = await runScenarioSimulation('monsoon_rainfall_20', modifiers);
      const run2 = await runScenarioSimulation('monsoon_rainfall_20', modifiers);

      // Strip variable ISO timestamps for comparison
      const sanitize = (r: ScenarioImpactSummary) => ({
        ...r,
        timestamp: '',
        metadata: { ...r.metadata, timestamp: '' },
      });

      expect(sanitize(run1)).toEqual(sanitize(run2));
    });

    it('guarantees Sequence Invariance: Scenario A -> Scenario B -> Scenario A', async () => {
      const presetA = 'monsoon_rainfall_20';
      const presetB = 'compound_landslide_blockage';

      const runA1 = await runScenarioSimulation(presetA);
      const runB = await runScenarioSimulation(presetB);
      const runA2 = await runScenarioSimulation(presetA);

      expect(runB.totalHabitationsEvaluated).toBeGreaterThan(0);
      expect(runA1.totalHabitationsEscalated).toBe(runA2.totalHabitationsEscalated);
      expect(runA1.additionalPopulationAtRisk).toBe(runA2.additionalPopulationAtRisk);
      expect(runA1.scenarioCriticalHabitations).toBe(runA2.scenarioCriticalHabitations);

      for (let i = 0; i < runA1.allHabitations.length; i++) {
        const s1 = runA1.allHabitations[i]!;
        const s2 = runA2.allHabitations[i]!;
        expect(s1.scenarioScore).toBe(s2.scenarioScore);
        expect(s1.delta).toBe(s2.delta);
        expect(s1.scenarioPriority).toBe(s2.scenarioPriority);
        expect(s1.scenarioTimeline).toBe(s2.scenarioTimeline);
      }
    });
  });

  describe('5. Reset Baseline Guarantee', () => {
    it('restores all numbers to baseline after high-stress simulation', async () => {
      // 1. Run high stress
      const severeRun = await runScenarioSimulation('compound_landslide_blockage');
      expect(severeRun.totalHabitationsEscalated).toBeGreaterThan(0);

      // 2. Reset baseline
      const resetRun = await runScenarioSimulation('baseline_state', BASELINE_SCENARIO_MODIFIERS);
      expect(resetRun.totalHabitationsEscalated).toBe(0);
      expect(resetRun.newlyCriticalHabitations).toBe(0);
      expect(resetRun.additionalPopulationAtRisk).toBe(0);
      expect(resetRun.additionalRelocationDemand).toBe(0);

      for (const s of resetRun.allHabitations) {
        expect(s.delta).toBe(0);
        expect(s.priorityChanged).toBe(false);
        expect(s.timelineChanged).toBe(false);
      }
    });
  });

  describe('6. Population Aggregations & Priority Transitions', () => {
    it('guarantees population conservation and priority transition logic', async () => {
      const result = await runScenarioSimulation('cloudburst_flash_flood_100mm');

      // Total assessed population is constant
      const totalPop = result.allHabitations.reduce((sum, s) => sum + s.habitation.population, 0);
      expect(result.totalAssessedPopulation).toBe(totalPop);

      // High risk population >= baseline
      expect(result.totalPopulationAtRiskScenario).toBeGreaterThanOrEqual(
        result.totalPopulationAtRiskBaseline,
      );

      // Transition invariants
      for (const s of result.allHabitations) {
        expect(s.priorityTransition.isNewlyCritical).toBe(
          s.baselinePriority !== 'CRITICAL' && s.scenarioPriority === 'CRITICAL',
        );
        expect(s.timelineTransition.isNewlyImmediate).toBe(
          s.baselineTimeline !== 'immediate' && s.scenarioTimeline === 'immediate',
        );
      }

      // Relocation demand equals newly immediate population
      const newlyImmediatePop = result.allHabitations
        .filter((s) => s.timelineTransition.isNewlyImmediate)
        .reduce((sum, s) => sum + s.habitation.population, 0);
      expect(result.additionalRelocationDemand).toBe(newlyImmediatePop);
    });
  });

  describe('7. Validation & Failure Handling', () => {
    it('throws CalculationValidationError on invalid modifier inputs', async () => {
      const invalidModifiers = {
        rainfallMultiplier: 0.5, // Below 1.0 min
        cloudburstSurge: -10, // Below 0 min
        slopeSaturationFactor: 3.5, // Above 2.0 max
        floodIntensityMultiplier: 1.0,
        infrastructureStrainMultiplier: 1.0,
      };

      await expect(
        runScenarioSimulation('monsoon_rainfall_20', invalidModifiers),
      ).rejects.toThrow(CalculationValidationError);
    });

    it('assertSimulationConsistency detects forged or corrupted deltas', async () => {
      const validResult = await runScenarioSimulation('monsoon_rainfall_20');

      // Corrupt a delta
      const corruptedResult: ScenarioImpactSummary = {
        ...validResult,
        allHabitations: validResult.allHabitations.map((s, idx) =>
          idx === 0 ? { ...s, delta: s.delta + 10.0 } : s,
        ),
      };

      expect(() => assertSimulationConsistency(corruptedResult)).toThrow(
        SimulationConsistencyError,
      );
    });

    it('assertSimulationConsistency detects mismatched population aggregations', async () => {
      const validResult = await runScenarioSimulation('monsoon_rainfall_20');

      // Forged headline population
      const corruptedResult: ScenarioImpactSummary = {
        ...validResult,
        totalAssessedPopulation: validResult.totalAssessedPopulation + 5000,
      };

      expect(() => assertSimulationConsistency(corruptedResult)).toThrow(
        SimulationConsistencyError,
      );
    });
  });

  describe('8. Narrative Veracity & Formatting Invariants', () => {
    it('guarantees clean narrative explanations without invalid +- syntax across all habitations', async () => {
      const presets = ['monsoon_rainfall_20', 'compound_landslide_blockage', 'baseline_state'];

      for (const presetId of presets) {
        const result = await runScenarioSimulation(presetId);
        for (const hab of result.allHabitations) {
          expect(hab.deterministicExplanation).not.toContain('+-');
          expect(hab.deterministicExplanation).not.toContain('-+');

          if (hab.delta === 0) {
            expect(hab.deterministicExplanation).toContain('remains unchanged');
          } else {
            expect(hab.deterministicExplanation).toMatch(/increased|reduced/);
          }
        }
      }
    });
  });
});
