import {
  districtSummariesFixture,
  habitationsFixture,
  redZonesFixture,
  relocationSitesFixture,
} from '@/server/db/fixtures/disaster-data';

export async function getPlatformSummary() {
  const totalHabitations = habitationsFixture.length;
  const criticalHabitations = habitationsFixture.filter((h) => h.priority === 'CRITICAL').length;
  const immediateHabitations = habitationsFixture.filter((h) => h.timeline === 'immediate').length;
  const populationAtRisk = habitationsFixture.reduce((sum, h) => sum + h.population, 0);

  const totalRedZones = redZonesFixture.length;
  const criticalRedZones = redZonesFixture.filter((z) => z.severity === 'critical').length;
  const totalRedZoneAreaSqKm = redZonesFixture.reduce((sum, z) => sum + z.areaSqKm, 0);

  const totalSites = relocationSitesFixture.length;
  const suitableSites = relocationSitesFixture.filter((s) => s.suitability === 'suitable').length;
  const totalCarryingCapacity = relocationSitesFixture.reduce((sum, s) => sum + s.carryingCapacity, 0);
  const currentOccupancy = relocationSitesFixture.reduce((sum, s) => sum + s.currentOccupancy, 0);
  const availableCapacity = Math.max(0, totalCarryingCapacity - currentOccupancy);

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
      total: totalSites,
      suitable: suitableSites,
      carryingCapacity: totalCarryingCapacity,
      currentOccupancy,
      availableCapacity,
      utilizationPct: Math.round((currentOccupancy / totalCarryingCapacity) * 100),
    },
    districts: districtSummariesFixture,
  };
}
