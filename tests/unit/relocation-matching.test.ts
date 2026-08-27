import { habitationsFixture, relocationSitesFixture } from '@/server/db/fixtures/disaster-data';
import { calculateSiteCapacity } from '@/server/capacity/capacity-engine';
import {
  calculateDistanceScore,
  evaluateSiteSuitability,
} from '@/server/relocation/suitability-engine';
import {
  findRelocationCandidates,
  matchHabitationToSites,
} from '@/server/relocation/matching-engine';
import {
  getRelocationKpiSummary,
  getRelocationPlanForHabitation,
  listAllRelocationPlans,
} from '@/server/relocation/relocation-service';
import type { RelocationSite } from '@/types/domain';

describe('Site Suitability Engine (Phase 6C)', () => {
  const chooralmala = habitationsFixture.find((h) => h.id === 'HAB-WY-01')!;
  const meppadiSite = relocationSitesFixture.find((s) => s.id === 'SITE-WY-01')!;

  it('calculates distance decay score correctly across thresholds', () => {
    expect(calculateDistanceScore(5)).toBe(100); // <= 10 km
    expect(calculateDistanceScore(15)).toBe(85); // <= 20 km
    expect(calculateDistanceScore(25)).toBe(65); // <= 35 km
    expect(calculateDistanceScore(45)).toBe(40); // <= 50 km
    expect(calculateDistanceScore(75)).toBe(20); // <= 100 km
    expect(calculateDistanceScore(150)).toBe(0); // > 100 km
  });

  it('evaluates 10-factor suitability with explicit weighted contributions', () => {
    const capacity = calculateSiteCapacity(meppadiSite);
    const suitability = evaluateSiteSuitability(meppadiSite, chooralmala, 5.9, capacity);

    expect(suitability.suitabilityScore).toBeGreaterThan(60);
    expect(suitability.suitabilityBand).toMatch(/EXCELLENT|GOOD/);
    expect(suitability.isDisqualified).toBe(false);

    // Verify all 10 factor contributions exist
    expect(suitability.factors.safety.raw).toBe(100);
    expect(suitability.factors.capacity.raw).toBeGreaterThan(0);
    expect(suitability.factors.distance.raw).toBe(100);
    expect(suitability.factors.road.raw).toBeGreaterThan(0);
    expect(suitability.factors.water.raw).toBeGreaterThan(0);
    expect(suitability.factors.healthcare.raw).toBeGreaterThan(0);
    expect(suitability.factors.shelter.raw).toBeGreaterThan(0);
    expect(suitability.factors.power.raw).toBeGreaterThan(0);
    expect(suitability.factors.livelihood.raw).toBeGreaterThan(0);
    expect(suitability.factors.schools.raw).toBeGreaterThan(0);

    expect(suitability.strengths.length).toBeGreaterThan(0);
  });

  it('strictly disqualifies candidate sites located in critical hazard zones', () => {
    const unsafeSite: RelocationSite = {
      ...meppadiSite,
      hazardExposure: 'critical',
    };

    const capacity = calculateSiteCapacity(unsafeSite);
    const suitability = evaluateSiteSuitability(unsafeSite, chooralmala, 5.9, capacity);

    expect(suitability.isDisqualified).toBe(true);
    expect(suitability.suitabilityScore).toBe(0);
    expect(suitability.suitabilityBand).toBe('UNSUITABLE');
    expect(suitability.disqualificationReason).toContain('Disqualified');
  });
});

describe('Habitation-to-Site Matching Engine (Phase 6D & 6E)', () => {
  const chooralmala = habitationsFixture.find((h) => h.id === 'HAB-WY-01')!;
  const sunilJoshimath = habitationsFixture.find((h) => h.id === 'HAB-CH-01')!;

  it('matches Chooralmala to Meppadi High Ridge as Rank #1 Recommended', () => {
    const plan = findRelocationCandidates(chooralmala, relocationSitesFixture);

    expect(plan.habitation.id).toBe('HAB-WY-01');
    expect(plan.recommendedSite).not.toBeNull();
    expect(plan.recommendedSite?.site.id).toBe('SITE-WY-01');
    expect(plan.recommendedSite?.isRecommended).toBe(true);
    expect(plan.recommendedSite?.rank).toBe(1);
    expect(plan.recommendedSite?.distanceKm).toBe(5.9);
    expect(plan.recommendedSite?.coveragePct).toBeGreaterThan(70);
  });

  it('matches Joshimath Sunil Ward to Pipalkoti Uplands with transparent explanations', () => {
    const plan = findRelocationCandidates(sunilJoshimath, relocationSitesFixture);

    expect(plan.recommendedSite).not.toBeNull();
    expect(plan.recommendedSite?.site.id).toBe('SITE-CH-01');
    expect(plan.recommendedSite?.capacity.availableHeadroom).toBeGreaterThan(1000);
    expect(plan.decisionExplanation.keyStrengths.length).toBeGreaterThan(0);
  });

  it('generates structured, deterministic decision explanation for SDMA records', () => {
    const plan = findRelocationCandidates(chooralmala, relocationSitesFixture);
    const exp = plan.decisionExplanation;

    expect(exp.headline).toContain('Recommended Relocation Sector');
    expect(exp.headline).toContain('Meppadi');
    expect(exp.rationaleText).toContain('headroom');
    expect(exp.statutoryMandate).toContain('Disaster Management Act');
  });

  it('orders alternative candidate sites by composite score descending', () => {
    const plan = findRelocationCandidates(chooralmala, relocationSitesFixture);
    expect(plan.alternativeSites.length).toBeGreaterThan(0);

    for (let i = 0; i < plan.alternativeSites.length - 1; i++) {
      expect(
        plan.alternativeSites[i]!.suitability.suitabilityScore,
      ).toBeGreaterThanOrEqual(plan.alternativeSites[i + 1]!.suitability.suitabilityScore);
    }
  });

  it('maintains backward compatibility with matchHabitationToSites alias', () => {
    const plan = matchHabitationToSites(chooralmala, relocationSitesFixture);
    expect(plan.habitation.id).toBe('HAB-WY-01');
    expect(plan.recommendedSite?.site.id).toBe('SITE-WY-01');
  });
});

describe('Relocation Service Layer (Phase 6)', () => {
  it('retrieves single relocation plan by habitation ID', async () => {
    const plan = await getRelocationPlanForHabitation('HAB-WY-01');
    expect(plan).not.toBeNull();
    expect(plan?.habitation.id).toBe('HAB-WY-01');
    expect(plan?.recommendedSite?.site.name).toContain('Meppadi');
  });

  it('returns null for non-existent habitation ID', async () => {
    const plan = await getRelocationPlanForHabitation('NON-EXISTENT-HABITATION');
    expect(plan).toBeNull();
  });

  it('lists all relocation plans across habitations', async () => {
    const plans = await listAllRelocationPlans();
    expect(plans.length).toBe(habitationsFixture.length);
    expect(plans.every((p) => p.recommendedSite !== null)).toBe(true);
  });

  it('aggregates relocation KPI metrics accurately', async () => {
    const kpis = await getRelocationKpiSummary();
    expect(kpis.totalCandidateSites).toBeGreaterThan(0);
    expect(kpis.totalNominalCapacity).toBeGreaterThan(0);
    expect(kpis.totalAvailableHeadroom).toBeGreaterThan(0);
    expect(kpis.totalHabitationsRequiringRelocation).toBeGreaterThan(0);
  });
});
