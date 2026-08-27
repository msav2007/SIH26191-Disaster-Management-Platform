import { habitationsFixture } from '@/server/db/fixtures/disaster-data';
import {
  calculateDemographicVulnerabilityScore,
  calculateDisasterHistoryScore,
  calculateExposureScore,
  calculateHabitationRisk,
  calculateInfrastructureRiskScore,
  calculateMultiHazardRisk,
  calculateRelocationPriority,
  classifyRiskLevel,
} from '@/server/risk/risk-engine';
import {
  getHabitationRiskAssessment,
  getRegionalRiskRollup,
  listHabitationRiskAssessments,
} from '@/server/risk/risk-service';
import type { Habitation } from '@/types/domain';

describe('Multi-Hazard Risk Engine (Phase 5A)', () => {
  const chooralmala = habitationsFixture.find((h) => h.id === 'HAB-WY-01')!;

  it('calculates single-hazard risk with base multiplier 1.0', () => {
    const single = calculateMultiHazardRisk('landslide', [], 80);
    expect(single.compoundScore).toBe(80);
    expect(single.multiplier).toBe(1.0);
  });

  it('calculates multi-hazard compound risk without exceeding 100 or double counting', () => {
    const multi = calculateMultiHazardRisk('landslide', ['cloudburst', 'flood'], 85);
    expect(multi.compoundScore).toBeGreaterThan(85);
    expect(multi.compoundScore).toBeLessThanOrEqual(100);
    expect(multi.multiplier).toBeGreaterThan(1.0);

    // Maximum boundary test
    const maxMulti = calculateMultiHazardRisk('landslide', ['cloudburst', 'flood'], 99);
    expect(maxMulti.compoundScore).toBeLessThanOrEqual(100);
  });

  it('evaluates demographic vulnerability accurately from population metrics', () => {
    const score = calculateDemographicVulnerabilityScore(chooralmala);
    expect(score).toBeGreaterThan(50);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('evaluates disaster history impact with casualty weights and recency', () => {
    const histScore = calculateDisasterHistoryScore(chooralmala);
    expect(histScore).toBeGreaterThan(80); // Wayanad has catastrophic 2024 casualties
  });

  it('evaluates infrastructure fragility from access gaps', () => {
    const infraScore = calculateInfrastructureRiskScore(chooralmala);
    expect(infraScore).toBeGreaterThan(60); // Chooralmala lacks all-weather road and subcentre
  });

  it('evaluates terrain exposure from slope and river proximity', () => {
    const expoScore = calculateExposureScore(chooralmala);
    expect(expoScore).toBeGreaterThan(70); // 34.2° slope and 0.12km river distance
  });

  it('computes complete deterministic risk assessment with exact factor weights', () => {
    const result = calculateHabitationRisk(chooralmala);

    expect(result.compositeScore).toBeGreaterThan(80);
    expect(result.riskLevel).toBe('critical');
    expect(result.priority).toBe('CRITICAL');
    expect(result.timeline).toBe('immediate');
    expect(result.urgencyWindow).toBe('0–6 months');
    expect(result.confidenceScore).toBeGreaterThan(0.8);

    // Factor weight check (sum of weights = 1.0)
    const factorWeightsSum =
      result.factors.hazard.weight +
      result.factors.vulnerability.weight +
      result.factors.history.weight +
      result.factors.exposure.weight +
      result.factors.infrastructure.weight;

    expect(Math.round(factorWeightsSum * 100) / 100).toBe(1.0);

    // Weighted contributions sum up to raw composite score
    const contrSum =
      result.factors.hazard.weightedContribution +
      result.factors.vulnerability.weightedContribution +
      result.factors.history.weightedContribution +
      result.factors.exposure.weightedContribution +
      result.factors.infrastructure.weightedContribution;

    expect(Math.abs(contrSum - result.compositeScore)).toBeLessThanOrEqual(1.0);
  });

  it('generates transparent, explainable evidence narratives for SDMA records', () => {
    const result = calculateHabitationRisk(chooralmala);
    const exp = result.explanation;

    expect(exp.headline).toContain('CRITICAL');
    expect(exp.headline).toContain('Chooralmala');
    expect(exp.primaryDriverText).toContain('landslide');
    expect(exp.vulnerabilityText).toContain(String(chooralmala.demographics.belowPovertyLine));
    expect(exp.infrastructureText).toContain('NO all-weather road access');
    expect(exp.urgencyJustification).toContain('0–6 months');
  });

  it('ensures output is strictly deterministic and reproducible across multiple runs', () => {
    const run1 = calculateHabitationRisk(chooralmala);
    const run2 = calculateHabitationRisk(chooralmala);

    expect(run1.compositeScore).toBe(run2.compositeScore);
    expect(run1.riskLevel).toBe(run2.riskLevel);
    expect(run1.priority).toBe(run2.priority);
    expect(run1.factors.hazard.raw).toBe(run2.factors.hazard.raw);
    expect(run1.factors.vulnerability.raw).toBe(run2.factors.vulnerability.raw);
  });

  it('handles edge case: zero population gracefully', () => {
    const zeroPopHabitation: Habitation = {
      ...chooralmala,
      population: 0,
      households: 0,
      demographics: {
        children: 0,
        elderly: 0,
        pwd: 0,
        belowPovertyLine: 0,
      },
    };

    const vuln = calculateDemographicVulnerabilityScore(zeroPopHabitation);
    expect(vuln).toBe(0);

    const result = calculateHabitationRisk(zeroPopHabitation);
    expect(result.compositeScore).toBeGreaterThan(0); // Driven by hazard/exposure
  });

  it('handles edge case: fully resilient infrastructure and zero history', () => {
    const safeHabitation: Habitation = {
      ...chooralmala,
      redZoneId: null,
      history: [],
      factors: {
        hazardIntensity: 20,
        populationVulnerability: 20,
        disasterHistory: 10,
        exposure: 15,
        infrastructureRisk: 10,
        relocationFeasibility: 95,
      },
      infrastructure: {
        school: true,
        healthSubCentre: true,
        allWeatherRoad: true,
        pipedWater: true,
        electrified: true,
        mobileCoverage: true,
      },
      slopeDeg: 4.0,
      distanceToRiverKm: 4.5,
    };

    const result = calculateHabitationRisk(safeHabitation);
    expect(result.riskLevel).toBe('low');
    expect(result.priority).toBe('LOW');
    expect(result.timeline).toBe('monitoring');
  });

  it('classifies risk levels correctly according to configured thresholds', () => {
    expect(classifyRiskLevel(85)).toBe('critical');
    expect(classifyRiskLevel(70)).toBe('high');
    expect(classifyRiskLevel(50)).toBe('moderate');
    expect(classifyRiskLevel(30)).toBe('low');
  });

  it('classifies relocation priorities according to urgency windows', () => {
    const p1 = calculateRelocationPriority(chooralmala, 88, 95, 85);
    expect(p1.priority).toBe('CRITICAL');
    expect(p1.urgencyWindow).toBe('0–6 months');

    const p2 = calculateRelocationPriority({ ...chooralmala, redZoneId: null }, 70, 70, 65);
    expect(p2.priority).toBe('HIGH');
    expect(p2.urgencyWindow).toBe('6–18 months');

    const p3 = calculateRelocationPriority({ ...chooralmala, redZoneId: null }, 52, 50, 45);
    expect(p3.priority).toBe('MEDIUM');
    expect(p3.urgencyWindow).toBe('18–36 months');

    const p4 = calculateRelocationPriority({ ...chooralmala, redZoneId: null }, 35, 30, 25);
    expect(p4.priority).toBe('LOW');
    expect(p4.urgencyWindow).toBe('Continuous Surveillance');
  });
});

describe('Risk Service Layer (Phase 5A)', () => {
  it('retrieves single habitation risk assessment by ID', async () => {
    const res = await getHabitationRiskAssessment('HAB-WY-01');
    expect(res).not.toBeNull();
    expect(res?.habitation.id).toBe('HAB-WY-01');
    expect(res?.assessment.priority).toBe('CRITICAL');
  });

  it('lists and sorts habitations by composite risk score', async () => {
    const list = await listHabitationRiskAssessments();
    expect(list.length).toBeGreaterThan(0);

    for (let i = 0; i < list.length - 1; i++) {
      expect(list[i]!.assessment.compositeScore).toBeGreaterThanOrEqual(
        list[i + 1]!.assessment.compositeScore,
      );
    }
  });

  it('filters habitations by district', async () => {
    const wayanadList = await listHabitationRiskAssessments({ district: 'Wayanad' });
    expect(wayanadList.length).toBeGreaterThan(0);
    expect(wayanadList.every((h) => h.habitation.district === 'Wayanad')).toBe(true);
  });

  it('generates regional risk rollups with priority breakdowns', async () => {
    const rollup = await getRegionalRiskRollup('Wayanad');
    expect(rollup.totalHabitations).toBeGreaterThan(0);
    expect(rollup.priorityBreakdown.immediate).toBeGreaterThan(0);
    expect(rollup.avgCompositeScore).toBeGreaterThan(80);
    expect(rollup.totalPopulationAtRisk).toBeGreaterThan(1500);
  });
});
