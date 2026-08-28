import type { Habitation, MapPoint, RedZone, RelocationSite } from '@/types/domain';
import { redZonesFixture, relocationSitesFixture } from '@/server/db/fixtures/disaster-data';
import { findRelocationCandidates } from '@/server/relocation/matching-engine';

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
 * Delegates directly to authoritative Relocation Matching Engine to eliminate duplicate heuristics.
 */
export function evaluateCandidateSites(
  habitation: Habitation,
  allSites: RelocationSite[] = relocationSitesFixture,
): CandidateSiteMatch[] {
  const plan = findRelocationCandidates(habitation, allSites);
  const candidateList = [
    ...(plan.recommendedSite ? [plan.recommendedSite] : []),
    ...plan.alternativeSites,
  ];

  return candidateList.map((m) => ({
    site: m.site,
    distanceKm: m.distanceKm,
    availableCapacity: m.capacity.availableHeadroom,
    coveragePct: m.coveragePct,
    suitabilityScore: m.suitability.suitabilityScore,
  }));
}
