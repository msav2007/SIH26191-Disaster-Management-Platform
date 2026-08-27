import { relocationSitesFixture } from '@/server/db/fixtures/disaster-data';
import { calculateSiteCapacity } from '@/server/capacity/capacity-engine';
import {
  getRegionalCapacityRollup,
  getSiteCapacityById,
  listSiteCapacityAssessments,
} from '@/server/capacity/capacity-service';
import type { RelocationSite } from '@/types/domain';

describe('Carrying Capacity Engine (Phase 6B)', () => {
  const meppadiSite = relocationSitesFixture.find((s) => s.id === 'SITE-WY-01')!;

  it('calculates 10-dimension carrying capacity and identifies limiting factor', () => {
    const assessment = calculateSiteCapacity(meppadiSite);

    expect(assessment.siteId).toBe('SITE-WY-01');
    expect(assessment.nominalCapacity).toBe(2200);
    expect(assessment.effectiveCapacity).toBeGreaterThan(0);
    expect(assessment.effectiveCapacity).toBeLessThanOrEqual(assessment.nominalCapacity);
    expect(assessment.availableHeadroom).toBeGreaterThan(0);
    expect(assessment.utilizationPercent).toBeGreaterThan(0);

    // Check all dimensions are present
    expect(assessment.dimensions.land.supportedPopulation).toBeGreaterThan(1000);
    expect(assessment.dimensions.water.supportedPopulation).toBeGreaterThan(0);
    expect(assessment.dimensions.sanitation.supportedPopulation).toBeGreaterThan(0);
    expect(assessment.dimensions.shelter.supportedPopulation).toBeGreaterThan(0);
    expect(assessment.dimensions.healthcare.supportedPopulation).toBeGreaterThan(0);
    expect(assessment.dimensions.road.supportedPopulation).toBeGreaterThan(0);
    expect(assessment.dimensions.schools.supportedPopulation).toBeGreaterThan(0);
    expect(assessment.dimensions.power.supportedPopulation).toBeGreaterThan(0);
    expect(assessment.dimensions.livelihood.supportedPopulation).toBeGreaterThan(0);

    // Limiting factor check
    const limitingKey = assessment.limitingFactor;
    expect(assessment.dimensions[limitingKey].isLimiting).toBe(true);
    expect(assessment.limitingFactorValue).toBe(assessment.dimensions[limitingKey].supportedPopulation);
  });

  it('correctly bottlenecks capacity when water supply is inadequate', () => {
    const waterBottleneckSite: RelocationSite = {
      ...meppadiSite,
      services: {
        ...meppadiSite.services,
        water: 'inadequate',
      },
    };

    const assessment = calculateSiteCapacity(waterBottleneckSite);
    expect(assessment.dimensions.water.supportedPopulation).toBeLessThan(meppadiSite.carryingCapacity);
  });

  it('correctly bottlenecks capacity when shelter capacity is low', () => {
    const shelterLimitedSite: RelocationSite = {
      ...meppadiSite,
      shelterCapacity: 200,
    };

    const assessment = calculateSiteCapacity(shelterLimitedSite);
    expect(assessment.dimensions.shelter.supportedPopulation).toBeLessThan(meppadiSite.carryingCapacity);
  });

  it('handles saturated sites where current occupancy equals or exceeds capacity', () => {
    const saturatedSite: RelocationSite = {
      ...meppadiSite,
      currentOccupancy: 3000,
    };

    const assessment = calculateSiteCapacity(saturatedSite);
    expect(assessment.availableHeadroom).toBe(0);
    expect(assessment.isAtCapacity).toBe(true);
    expect(assessment.capacityStatus).toBe('FULL');
  });

  it('honestly reports missing data fields and lowers confidence when services are unassessed', () => {
    const missingDataSite: RelocationSite = {
      ...meppadiSite,
      services: {
        ...meppadiSite.services,
        water: 'unassessed',
        healthcare: 'unassessed',
      },
    };

    const assessment = calculateSiteCapacity(missingDataSite);
    expect(assessment.missingDataFields).toContain('water');
    expect(assessment.missingDataFields).toContain('healthcare');
    expect(assessment.confidence).toBeLessThan(0.9);
    expect(assessment.evidence.dataConfidenceText).toContain('DATA SOURCE REQUIRED');
  });
});

describe('Capacity Service Layer (Phase 6B)', () => {
  it('retrieves single site capacity by ID', async () => {
    const assessment = await getSiteCapacityById('SITE-WY-01');
    expect(assessment).not.toBeNull();
    expect(assessment?.siteId).toBe('SITE-WY-01');
    expect(assessment?.availableHeadroom).toBeGreaterThan(0);
  });

  it('returns null for non-existent site ID', async () => {
    const assessment = await getSiteCapacityById('NON-EXISTENT-ID');
    expect(assessment).toBeNull();
  });

  it('lists all site capacity assessments with optional district filter', async () => {
    const all = await listSiteCapacityAssessments();
    expect(all.length).toBe(relocationSitesFixture.length);

    const wayanadOnly = await listSiteCapacityAssessments({ district: 'Wayanad' });
    expect(wayanadOnly.length).toBeGreaterThan(0);
    expect(wayanadOnly.every((s) => s.siteName.toLowerCase().includes('meppadi') || s.siteId.includes('WY'))).toBe(true);
  });

  it('calculates regional capacity rollup metrics accurately', async () => {
    const rollup = await getRegionalCapacityRollup();
    expect(rollup.totalSites).toBe(relocationSitesFixture.length);
    expect(rollup.totalNominalCapacity).toBeGreaterThan(0);
    expect(rollup.totalEffectiveCapacity).toBeGreaterThan(0);
    expect(rollup.totalAvailableHeadroom).toBeGreaterThan(0);
    expect(rollup.sitesAvailable).toBeGreaterThan(0);
  });
});
