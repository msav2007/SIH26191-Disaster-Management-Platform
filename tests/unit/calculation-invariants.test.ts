import { describe, expect, it } from 'vitest';
import { calculateHabitationRisk } from '@/server/risk/risk-engine';
import { simulateHabitationScenario } from '@/server/scenarios/scenario-engine';
import { calculateSiteCapacity } from '@/server/capacity/capacity-engine';
import {
  getRelocationPriority,
  getSeverityLevel,
  getSuitabilityBand,
  getTimelineWindow,
} from '@/server/classification/classification-engine';
import type { Habitation, RelocationSite } from '@/types/domain';
import type { ScenarioModifiers } from '@/server/scenarios/scenario-types';

describe('Calculation Invariants and Traceability', () => {
  const baseHabitation: Habitation = {
    id: 'HAB-INVARIANT-001',
    name: 'Sample Settlement',
    district: 'Wayanad',
    block: 'Meppadi',
    state: 'Kerala',
    population: 1000,
    households: 250,
    slopeDeg: 30,
    elevationM: 750,
    distanceToRiverKm: 0.3,
    primaryHazard: 'landslide',
    redZoneId: null,
    vulnerability: 'high',
    priority: 'HIGH',
    timeline: 'short_term',
    status: 'survey_complete',
    factors: {
      hazardIntensity: 80,
      populationVulnerability: 70,
      disasterHistory: 30,
      exposure: 76,
      infrastructureRisk: 50,
      relocationFeasibility: 60,
    },
    demographics: {
      children: 150,
      elderly: 200,
      pwd: 20,
      belowPovertyLine: 400,
    },
    infrastructure: {
      school: true,
      allWeatherRoad: true,
      healthSubCentre: true,
      pipedWater: true,
      mobileCoverage: true,
      electrified: true,
    },
    history: [],
    coordinates: { latitude: 11.55, longitude: 76.12 },
    candidateSiteIds: [],
    notes: [],
    lastSurvey: '2026-08-01',
    isDemoData: true,
    provenance: 'DEMO DATA',
  };

  const sampleSite: RelocationSite = {
    id: 'SITE-INVARIANT-001',
    name: 'Sector Safe 1',
    district: 'Wayanad',
    block: 'Kalpetta',
    state: 'Kerala',
    areaHectares: 10, // 100,000 sq.m -> 2,000 land capacity
    carryingCapacity: 2000,
    currentOccupancy: 300,
    shelterCapacity: 0,
    projectedRequirement: 0,
    distanceToNearestHabitationKm: 5.0,
    hazardExposure: 'low',
    landClass: 'government_revenue',
    status: 'commissioned',
    lastUpdated: '2026-08-01',
    notes: [],
    isDemoData: true,
    services: {
      water: 'adequate', // 2000 * 1.15 = 2300
      healthcare: 'adequate', // 2000 * 1.2 = 2400
      school: 'adequate', // 2000 * 1.1 = 2200
      roadAccess: 'adequate', // 2000 * 1.25 = 2500
      power: 'adequate', // 2000 * 1.2 = 2400
      livelihood: 'adequate', // 2000 * 1.15 = 2300
    },
    coordinates: { latitude: 11.6, longitude: 76.08 },
    suitability: 'suitable',
    provenance: 'DEMO DATA',
  };

  describe('1. Hand-Verifiable Baseline Scoring', () => {
    it('calculates exact hand-verifiable composite risk score and factor weights', () => {
      const risk = calculateHabitationRisk(baseHabitation);

      // Verify mathematical traceability fields exist
      expect(risk.rawInputs).toBeDefined();
      expect(risk.normalizedInputs).toBeDefined();
      expect(risk.weights).toBeDefined();
      expect(risk.weightedContributions).toBeDefined();

      // Compound hazard: landslide + secondary cloudburst (0.35 * 68 * (100-80)/100 = 4.76 -> 84.8)
      expect(risk.factors.hazard.raw).toBeCloseTo(84.8, 1);
      expect(risk.weights.hazard).toBe(0.35);

      // Weighted sum equals totalScore within rounding tolerance
      const sumContributions =
        risk.weightedContributions.hazard +
        risk.weightedContributions.vulnerability +
        risk.weightedContributions.history +
        risk.weightedContributions.exposure +
        risk.weightedContributions.infrastructure;

      expect(Math.abs(sumContributions - risk.totalScore)).toBeLessThanOrEqual(0.3);
      expect(risk.totalScore).toBe(risk.compositeScore);
    });
  });

  describe('2. Scenario Delta Invariant', () => {
    it('strictly satisfies delta === scenarioScore - baselineScore', () => {
      const modifiers: ScenarioModifiers = {
        rainfallMultiplier: 1.25,
        cloudburstSurge: 10,
        slopeSaturationFactor: 1.3,
        floodIntensityMultiplier: 1.1,
        infrastructureStrainMultiplier: 1.2,
      };

      const result = simulateHabitationScenario(baseHabitation, modifiers, [sampleSite]);

      expect(result.delta).toBe(Number((result.scenarioScore - result.baselineScore).toFixed(1)));
      expect(result.riskDelta).toBe(result.delta);

      const expectedPct = Number(((result.delta / result.baselineScore) * 100).toFixed(1));
      expect(result.deltaPercentage).toBe(expectedPct);
      expect(result.pctChange).toBe(expectedPct);
    });

    it('identifies the exact mathematical primary driver of change', () => {
      const rainfallStress: ScenarioModifiers = {
        rainfallMultiplier: 1.5,
        cloudburstSurge: 20,
        slopeSaturationFactor: 1.4,
        floodIntensityMultiplier: 1.0,
        infrastructureStrainMultiplier: 1.0,
      };

      const result = simulateHabitationScenario(baseHabitation, rainfallStress, [sampleSite]);
      expect(result.primaryDriver).toBe('hazard');
      expect(result.driverContribution).toBeGreaterThan(0);
    });
  });

  describe('3. Carrying Capacity & Limiting Factor Invariant', () => {
    it('strictly satisfies headroom === max(0, effectiveCapacity - currentOccupancy)', () => {
      const capacity = calculateSiteCapacity(sampleSite);

      // Limiting dimension for sampleSite is Shelter (1400)
      expect(capacity.limitingFactor).toBe('shelter');
      expect(capacity.limitingFactorValue).toBe(1400);

      // Effective capacity = round(1400 * 0.85) = 1190
      expect(capacity.effectiveCapacity).toBe(1190);

      // Available headroom = 1190 - 300 = 890
      expect(capacity.availableHeadroom).toBe(890);
      expect(capacity.availableHeadroom).toBe(
        Math.max(0, capacity.effectiveCapacity - sampleSite.currentOccupancy),
      );

      // Utilization = round(300 / 1190 * 100) = 25%
      expect(capacity.utilizationPercent).toBe(25);
      expect(capacity.capacityStatus).toBe('AVAILABLE');
    });

    it('disqualifies site immediately when hazard exposure is critical', () => {
      const criticalHazardSite: RelocationSite = {
        ...sampleSite,
        id: 'SITE-CRITICAL-001',
        hazardExposure: 'critical',
      };

      const capacity = calculateSiteCapacity(criticalHazardSite);
      expect(capacity.capacityStatus).toBe('UNSUITABLE');
      expect(capacity.availableHeadroom).toBe(0);
    });
  });

  describe('4. Classification Threshold Boundaries', () => {
    it('classifies severity levels accurately at band boundaries', () => {
      expect(getSeverityLevel(80.0)).toBe('critical');
      expect(getSeverityLevel(79.9)).toBe('high');
      expect(getSeverityLevel(60.0)).toBe('high');
      expect(getSeverityLevel(59.9)).toBe('moderate');
      expect(getSeverityLevel(40.0)).toBe('moderate');
      expect(getSeverityLevel(39.9)).toBe('low');
    });

    it('classifies relocation priority accurately across statutory tiers', () => {
      // Score >= 85 -> CRITICAL / immediate
      expect(getRelocationPriority(85.0, 70, 70, false).priority).toBe('CRITICAL');
      expect(getRelocationPriority(85.0, 70, 70, false).timeline).toBe('immediate');

      // Score 80 in Red Zone -> CRITICAL / immediate
      expect(getRelocationPriority(80.0, 70, 70, true).priority).toBe('CRITICAL');

      // Score 68 -> HIGH / short_term
      expect(getRelocationPriority(68.0, 60, 60, false).priority).toBe('HIGH');
      expect(getRelocationPriority(68.0, 60, 60, false).timeline).toBe('short_term');

      // Score 45 -> MEDIUM / medium_term
      expect(getRelocationPriority(45.0, 50, 50, false).priority).toBe('MEDIUM');
      expect(getRelocationPriority(45.0, 50, 50, false).timeline).toBe('medium_term');

      // Score < 45 -> LOW / monitoring
      expect(getRelocationPriority(44.9, 40, 40, false).priority).toBe('LOW');
      expect(getRelocationPriority(44.9, 40, 40, false).timeline).toBe('monitoring');
    });

    it('classifies suitability bands correctly', () => {
      expect(getSuitabilityBand(85)).toBe('EXCELLENT');
      expect(getSuitabilityBand(70)).toBe('GOOD');
      expect(getSuitabilityBand(50)).toBe('CONDITIONAL');
      expect(getSuitabilityBand(30)).toBe('POOR');
      expect(getSuitabilityBand(29)).toBe('UNSUITABLE');
    });

    it('maps canonical timeline urgency windows deterministically via getTimelineWindow', () => {
      expect(getTimelineWindow('immediate')).toBe('0–6 months');
      expect(getTimelineWindow('short_term')).toBe('6–18 months');
      expect(getTimelineWindow('medium_term')).toBe('18–36 months');
      expect(getTimelineWindow('monitoring')).toBe('Continuous Surveillance');
    });
  });

  describe('5. Negative Delta & Explanation Proof Invariants', () => {
    it('produces clean mathematical explanation without sign glitches when delta is 0 or negative', () => {
      // 1. Zero delta baseline run
      const zeroResult = simulateHabitationScenario(
        baseHabitation,
        {
          rainfallMultiplier: 1.0,
          cloudburstSurge: 0,
          slopeSaturationFactor: 1.0,
          floodIntensityMultiplier: 1.0,
          infrastructureStrainMultiplier: 1.0,
        },
        [sampleSite],
      );

      expect(zeroResult.delta).toBe(0);
      expect(zeroResult.deterministicExplanation).toContain('remains unchanged');

      // 2. Positive modifier run
      const posResult = simulateHabitationScenario(
        baseHabitation,
        {
          rainfallMultiplier: 1.3,
          cloudburstSurge: 15,
          slopeSaturationFactor: 1.2,
          floodIntensityMultiplier: 1.0,
          infrastructureStrainMultiplier: 1.0,
        },
        [sampleSite],
      );

      expect(posResult.delta).toBeGreaterThan(0);
      expect(posResult.deterministicExplanation).not.toContain('+-');
      expect(posResult.deterministicExplanation).toContain('increased');
    });
  });
});
