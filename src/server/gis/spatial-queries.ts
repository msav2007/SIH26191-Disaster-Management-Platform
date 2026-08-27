import type { Habitation, MapPoint, RedZone, RelocationSite } from '@/types/domain';
import { redZonesFixture, relocationSitesFixture } from '@/server/db/fixtures/disaster-data';

/**
 * Calculates great-circle distance between two WGS84 points in kilometers using the Haversine formula.
 */
export function calculateDistanceKm(pointA: MapPoint, pointB: MapPoint): number {
  const earthRadiusKm = 6371;

  const dLat = ((pointB.latitude - pointA.latitude) * Math.PI) / 180;
  const dLng = ((pointB.longitude - pointA.longitude) * Math.PI) / 180;

  const lat1 = (pointA.latitude * Math.PI) / 180;
  const lat2 = (pointB.latitude * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(earthRadiusKm * c * 10) / 10;
}

/**
 * Checks whether a point is within the radius boundary of a Red Zone.
 */
export function isPointInRedZone(point: MapPoint, zone: RedZone): boolean {
  const distance = calculateDistanceKm(point, zone.coordinates);
  return distance <= zone.radiusKm;
}

/**
 * Finds all Red Zones containing or closest to a habitation.
 */
export function getContainingRedZones(habitation: Habitation): RedZone[] {
  return redZonesFixture.filter((zone) => isPointInRedZone(habitation.coordinates, zone));
}

export interface CandidateSiteMatch {
  site: RelocationSite;
  distanceKm: number;
  availableCapacity: number;
  coveragePct: number;
  suitabilityScore: number;
}

/**
 * Evaluates and ranks candidate relocation sites for a vulnerable habitation.
 */
export function evaluateCandidateSites(habitation: Habitation): CandidateSiteMatch[] {
  const candidateIds = new Set(habitation.candidateSiteIds);

  const sites = relocationSitesFixture.filter(
    (s) => candidateIds.has(s.id) || s.district === habitation.district,
  );

  return sites
    .map((site) => {
      const distanceKm = calculateDistanceKm(habitation.coordinates, site.coordinates);
      const availableCapacity = Math.max(0, site.carryingCapacity - site.currentOccupancy);
      const coveragePct = Math.min(100, Math.round((availableCapacity / habitation.population) * 100));

      const serviceValues: Record<string, number> = {
        adequate: 100,
        partial: 60,
        inadequate: 20,
        unassessed: 0,
      };

      const svcList = Object.values(site.services);
      const avgService = svcList.reduce((sum, r) => sum + (serviceValues[r] ?? 0), 0) / (svcList.length || 1);
      const hazardPenalty = { critical: 45, high: 25, moderate: 10, low: 0 }[site.hazardExposure] ?? 0;

      const suitabilityScore = Math.max(
        0,
        Math.min(100, Math.round(avgService * 0.6 + (coveragePct / 100) * 40 - hazardPenalty)),
      );

      return {
        site,
        distanceKm,
        availableCapacity,
        coveragePct,
        suitabilityScore,
      };
    })
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}
