import {
  districtSummariesFixture,
  habitationsFixture,
  redZonesFixture,
} from '@/server/db/fixtures/disaster-data';
import { getRegionalCapacityRollup } from '@/server/capacity/capacity-service';
import { calculateHabitationRisk } from '@/server/risk/risk-engine';

export async function getPlatformSummary() {
  const habitationAssessments = habitationsFixture.map((h) => ({
    habitation: h,
    risk: calculateHabitationRisk(h),
  }));

  const totalHabitations = habitationAssessments.length;
  const criticalHabitations = habitationAssessments.filter((a) => a.risk.priority === 'CRITICAL').length;
  const immediateHabitations = habitationAssessments.filter((a) => a.risk.timeline === 'immediate').length;
  const populationAtRisk = habitationAssessments.reduce((sum, a) => sum + a.habitation.population, 0);

  const totalRedZones = redZonesFixture.length;
  const criticalRedZones = redZonesFixture.filter((z) => z.severity === 'critical').length;
  const totalRedZoneAreaSqKm = redZonesFixture.reduce((sum, z) => sum + z.areaSqKm, 0);

  const capacityRollup = await getRegionalCapacityRollup();

  return {
    habitations: {
      total: totalHabitations,
      critical: criticalHabitations,
      immediate: immediateHabitations,
      populationAtRisk,
    },
    redZones: {
      total: totalRedZones,
      critical: criticalRedZones,
      areaSqKm: Math.round(totalRedZoneAreaSqKm * 10) / 10,
    },
    relocationSites: {
      total: capacityRollup.totalSites,
      suitable: capacityRollup.sitesAvailable + capacityRollup.sitesNearCapacity,
      carryingCapacity: capacityRollup.totalNominalCapacity,
      effectiveCapacity: capacityRollup.totalEffectiveCapacity,
      currentOccupancy: capacityRollup.totalCurrentOccupancy,
      availableCapacity: capacityRollup.totalAvailableHeadroom,
      utilizationPct:
        capacityRollup.totalEffectiveCapacity > 0
          ? Math.round((capacityRollup.totalCurrentOccupancy / capacityRollup.totalEffectiveCapacity) * 100)
          : 100,
    },
    districts: districtSummariesFixture,
  };
}
