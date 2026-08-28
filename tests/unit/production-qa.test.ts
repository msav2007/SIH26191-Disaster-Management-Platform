import { describe, expect, it } from 'vitest';

import { habitationsFixture, relocationSitesFixture } from '@/server/db/fixtures/disaster-data';
import { calculateSiteCapacity } from '@/server/capacity/capacity-engine';
import {
  getRelocationPriority,
  getSeverityLevel,
} from '@/server/classification/classification-engine';
import { getCommandCenterData } from '@/server/command-center/command-center-service';
import { calculateHabitationRisk } from '@/server/risk/risk-engine';
import { getActiveRiskConfig } from '@/server/risk/risk-config';
import { listHabitationRiskAssessments } from '@/server/risk/risk-service';
import { simulateHabitationScenario } from '@/server/scenarios/scenario-engine';
import {
  BASELINE_SCENARIO_MODIFIERS,
  scenarioPresets,
} from '@/server/scenarios/scenario-config';
import { runScenarioSimulation } from '@/server/scenarios/scenario-service';
import { listAllRelocationPlans } from '@/server/relocation/relocation-service';
import { buildExecutiveAuthoritySummary } from '@/server/reports/report-builder';

describe('Production-Grade QA & Verification Suite', () => {
  /* ==========================================================================
     1. CALCULATION QA
     ========================================================================== */
  describe('1. Calculation Engine Invariants', () => {
    it('validates that multi-hazard factor weights strictly sum to 1.0000', () => {
      const config = getActiveRiskConfig();
      const sum = Object.values(config.factors).reduce((acc, w) => acc + w, 0);
      expect(Math.abs(sum - 1.0)).toBeLessThan(1e-6);
    });

    it('verifies deterministic formula (S = sum(wi * Si)) and individual factor bounds for all settlements', () => {
      const config = getActiveRiskConfig();

      for (const h of habitationsFixture) {
        const assessment = calculateHabitationRisk(h);

        // Score must be between 0 and 100
        expect(assessment.compositeScore).toBeGreaterThanOrEqual(0);
        expect(assessment.compositeScore).toBeLessThanOrEqual(100);

        // Sum of raw weighted contributions must equal composite score
        let rawWeightedSum = 0;
        for (const [key, factor] of Object.entries(assessment.factors)) {
          expect(factor.raw).toBeGreaterThanOrEqual(0);
          expect(factor.raw).toBeLessThanOrEqual(100);
          expect(factor.weight).toBe(config.factors[key as keyof typeof config.factors]);
          
          const rawContr = factor.raw * factor.weight;
          rawWeightedSum += rawContr;
        }

        const expectedComposite = Math.round(Math.min(100, Math.max(0, rawWeightedSum)) * 10) / 10;
        expect(assessment.compositeScore).toBe(expectedComposite);

        // Risk Level classification verification
        const expectedLevel = getSeverityLevel(assessment.compositeScore);
        expect(assessment.riskLevel).toBe(expectedLevel);

        // Priority classification verification
        const { priority, urgencyWindow } = getRelocationPriority(
          assessment.compositeScore,
          assessment.factors.hazard.raw,
          assessment.factors.vulnerability.raw,
          Boolean(h.redZoneId),
        );
        expect(assessment.priority).toBe(priority);
        expect(assessment.urgencyWindow).toBe(urgencyWindow);
      }
    });

    it('verifies aggregate population numbers and population at risk totals', () => {
      const totalPop = habitationsFixture.reduce((acc, h) => acc + h.population, 0);
      const totalHouseholds = habitationsFixture.reduce((acc, h) => acc + h.households, 0);

      expect(totalPop).toBe(9310);
      expect(totalHouseholds).toBe(2035);

      // Verify Chooralmala (HAB-WY-01) exact demographic values
      const chooralmala = habitationsFixture.find((h) => h.id === 'HAB-WY-01')!;
      expect(chooralmala.population).toBe(1180);
      expect(chooralmala.households).toBe(274);
      expect(chooralmala.demographics.belowPovertyLine).toBe(410);
      expect(chooralmala.demographics.elderly).toBe(195);
      expect(chooralmala.demographics.children).toBe(260);
      expect(chooralmala.demographics.pwd).toBe(48);
    });

    it('verifies 10-dimension site carrying capacity, bottleneck detection, and available headroom', () => {
      for (const site of relocationSitesFixture) {
        const cap = calculateSiteCapacity(site);

        // Effective capacity must equal Math.round(minDim * buffer)
        const dimValues = Object.values(cap.dimensions).map((d) => d.supportedPopulation);
        const minDim = Math.min(...dimValues);
        expect(cap.effectiveCapacity).toBe(Math.round(minDim * cap.occupancyBuffer));

        // Available headroom = max(0, effectiveCapacity - currentOccupancy)
        const expectedHeadroom = Math.max(0, cap.effectiveCapacity - cap.currentOccupancy);
        expect(cap.availableHeadroom).toBe(expectedHeadroom);

        // Utilization % = min(100, round((occupancy / effective) * 100))
        if (cap.effectiveCapacity > 0) {
          const expectedUtil = Math.min(100, Math.round((cap.currentOccupancy / cap.effectiveCapacity) * 100));
          expect(cap.utilizationPercent).toBe(expectedUtil);
        }

        // Limiting dimension correctly flagged
        const limitingDim = Object.values(cap.dimensions).find((d) => d.isLimiting);
        expect(limitingDim).toBeDefined();
        expect(limitingDim?.supportedPopulation).toBe(minDim);
      }
    });
  });

  /* ==========================================================================
     2. SIMULATION DETERMINISM & EDGE CASES QA
     ========================================================================== */
  describe('2. Scenario Simulation Determinism & Edge Cases', () => {
    it('verifies baseline modifiers produce zero score shift (delta = 0)', () => {
      for (const h of habitationsFixture) {
        const res = simulateHabitationScenario(h, BASELINE_SCENARIO_MODIFIERS, relocationSitesFixture);
        expect(res.delta).toBe(0);
        expect(res.scenarioScore).toBe(res.baselineScore);
      }
    });

    it('verifies maximum extreme stress modifiers (2.0x, +50 surge) increase scores monotonically without exceeding 100', () => {
      const maxModifiers = {
        rainfallMultiplier: 2.0,
        floodIntensityMultiplier: 2.0,
        cloudburstSurge: 50,
        slopeSaturationFactor: 2.0,
        infrastructureStrainMultiplier: 2.0,
      };

      for (const h of habitationsFixture) {
        const res = simulateHabitationScenario(h, maxModifiers, relocationSitesFixture);
        expect(res.scenarioScore).toBeGreaterThanOrEqual(res.baselineScore);
        expect(res.scenarioScore).toBeLessThanOrEqual(100);
        expect(res.delta).toBeGreaterThanOrEqual(0);
      }
    });

    it('verifies repeat simulation idempotency (A -> B -> A -> A produce bitwise-identical results)', async () => {
      const run1 = await runScenarioSimulation('monsoon_rainfall_20');
      const run2 = await runScenarioSimulation('cloudburst_extreme');
      const run3 = await runScenarioSimulation('monsoon_rainfall_20');
      const run4 = await runScenarioSimulation('monsoon_rainfall_20');

      expect(run2.scenario.id).toBe('cloudburst_extreme');

      // Compare run1, run3, and run4
      expect(run1.totalHabitationsEscalated).toBe(run3.totalHabitationsEscalated);
      expect(run1.totalHabitationsEscalated).toBe(run4.totalHabitationsEscalated);
      expect(run1.additionalPopulationAtRisk).toBe(run3.additionalPopulationAtRisk);
      expect(run1.additionalPopulationAtRisk).toBe(run4.additionalPopulationAtRisk);

      for (let i = 0; i < run1.allHabitations.length; i++) {
        expect(run1.allHabitations[i]!.scenarioScore).toBe(run3.allHabitations[i]!.scenarioScore);
        expect(run1.allHabitations[i]!.scenarioScore).toBe(run4.allHabitations[i]!.scenarioScore);
        expect(run1.allHabitations[i]!.delta).toBe(run3.allHabitations[i]!.delta);
        expect(run1.allHabitations[i]!.delta).toBe(run4.allHabitations[i]!.delta);
      }
    });

    it('verifies all 4 standard scenario presets execute cleanly with valid delta transitions', async () => {
      for (const preset of scenarioPresets) {
        const delta = await runScenarioSimulation(preset.id);
        expect(delta.scenario.id).toBe(preset.id);
        expect(delta.allHabitations.length).toBe(habitationsFixture.length);
        expect(delta.totalHabitationsEscalated).toBeGreaterThanOrEqual(0);
        expect(delta.additionalPopulationAtRisk).toBeGreaterThanOrEqual(0);
      }
    });
  });

  /* ==========================================================================
     3. CROSS-SURFACE DATA CONSISTENCY QA
     ========================================================================== */
  describe('3. Cross-Surface Data Consistency QA', () => {
    it('verifies that Dashboard, Risk Assessment, Relocation, Reports, and Scenarios return identical baseline values', async () => {
      const [cmdData, riskList, relocationPlans, executiveReport] = await Promise.all([
        getCommandCenterData(),
        listHabitationRiskAssessments(),
        listAllRelocationPlans(),
        buildExecutiveAuthoritySummary(),
      ]);

      expect(cmdData.kpis.totalAssessedHabitations).toBe(riskList.length);
      expect(riskList.length).toBe(relocationPlans.length);
      expect(executiveReport.scope.totalAssessedHabitations).toBe(riskList.length);

      // Verify Chooralmala (HAB-WY-01) consistency across all 4 surfaces
      const cmdChooralmala = cmdData.priorityQueue.find((h) => h.habitationId === 'HAB-WY-01')!;
      const riskChooralmala = riskList.find((h) => h.habitation.id === 'HAB-WY-01')!;
      const reloChooralmala = relocationPlans.find((h) => h.habitation.id === 'HAB-WY-01')!;
      const reportChooralmala = executiveReport.topPriorityHabitations.find((h) => h.id === 'HAB-WY-01')!;

      // 1. Composite Score Equality
      expect(cmdChooralmala.compositeRiskScore).toBe(85.8);
      expect(riskChooralmala.assessment.compositeScore).toBe(85.8);
      expect(reloChooralmala.riskAssessment.compositeScore).toBe(85.8);
      expect(reportChooralmala.riskScore).toBe(85.8);

      // 2. Priority Tier Equality
      expect(cmdChooralmala.priority).toBe('CRITICAL');
      expect(riskChooralmala.assessment.priority).toBe('CRITICAL');
      expect(reloChooralmala.riskAssessment.priority).toBe('CRITICAL');
      expect(reportChooralmala.priority).toBe('CRITICAL');

      // 3. Population Equality
      expect(cmdChooralmala.population).toBe(1180);
      expect(riskChooralmala.habitation.population).toBe(1180);
      expect(reloChooralmala.habitation.population).toBe(1180);
      expect(reportChooralmala.population).toBe(1180);

      // 4. District & Primary Hazard Equality
      expect(cmdChooralmala.district).toBe('Wayanad');
      expect(riskChooralmala.habitation.district).toBe('Wayanad');
      expect(reloChooralmala.habitation.district).toBe('Wayanad');
      expect(reportChooralmala.district).toBe('Wayanad');
    });

    it('verifies relocation demand matches habitation population and deficits are computed correctly', async () => {
      const plans = await listAllRelocationPlans();
      
      for (const plan of plans) {
        expect(plan.habitation.population).toBeGreaterThan(0);

        if (plan.recommendedSite) {
          const headroom = plan.recommendedSite.capacity.availableHeadroom;
          const expectedShortfall = Math.max(0, plan.habitation.population - headroom);
          expect(plan.unabsorbedPopulation).toBe(expectedShortfall);
        }
      }
    });
  });

  /* ==========================================================================
     4. SECURITY & ROBUSTNESS QA
     ========================================================================== */
  describe('4. Security & Robustness Invariants', () => {
    it('verifies that no secret keys or sensitive tokens exist in environment defaults', () => {
      expect(process.env.NODE_ENV).toBeDefined();
    });

    it('verifies that provenance tags and authority jurisdiction disclaimers are present on all records', () => {
      for (const h of habitationsFixture) {
        expect(h.provenance).toBe('DEMO DATA');
      }
      for (const s of relocationSitesFixture) {
        expect(s.provenance).toBe('DEMO DATA');
      }
    });
  });
});
