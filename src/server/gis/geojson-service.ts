import {
  criticalInfrastructureFixture,
  habitationsFixture,
  redZonesFixture,
  relocationSitesFixture,
} from '@/server/db/fixtures/disaster-data';
import type { HazardType } from '@/types/domain';

export interface GeoJsonFeature<G = unknown, P = Record<string, unknown>> {
  type: 'Feature';
  id: string;
  geometry: G;
  properties: P;
}

export interface GeoJsonFeatureCollection<G = unknown, P = Record<string, unknown>> {
  type: 'FeatureCollection';
  features: Array<GeoJsonFeature<G, P>>;
}

/**
 * Creates approximate polygonal coordinates for a circle on WGS84 given center and radius in km.
 */
function createCirclePolygon(centerLat: number, centerLng: number, radiusKm: number, points = 24): number[][][] {
  const coords: number[][] = [];
  const earthRadiusKm = 6371;

  for (let i = 0; i <= points; i++) {
    const angle = (i * 360) / points;
    const rad = (angle * Math.PI) / 180;

    const latRad = (centerLat * Math.PI) / 180;
    const lngRad = (centerLng * Math.PI) / 180;
    const distRatio = radiusKm / earthRadiusKm;

    const pointLatRad = Math.asin(
      Math.sin(latRad) * Math.cos(distRatio) +
        Math.cos(latRad) * Math.sin(distRatio) * Math.cos(rad),
    );

    const pointLngRad =
      lngRad +
      Math.atan2(
        Math.sin(rad) * Math.sin(distRatio) * Math.cos(latRad),
        Math.cos(distRatio) - Math.sin(latRad) * Math.sin(pointLatRad),
      );

    coords.push([(pointLngRad * 180) / Math.PI, (pointLatRad * 180) / Math.PI]);
  }

  return [coords];
}

export function getRedZonesGeoJSON(hazardFilter?: HazardType | 'all'): GeoJsonFeatureCollection {
  let zones = redZonesFixture;
  if (hazardFilter && hazardFilter !== 'all') {
    zones = zones.filter(
      (z) => z.primaryHazard === hazardFilter || z.secondaryHazards.includes(hazardFilter as never),
    );
  }

  const features: GeoJsonFeature[] = zones.map((z) => ({
    type: 'Feature',
    id: z.id,
    geometry: {
      type: 'Polygon',
      coordinates: createCirclePolygon(z.coordinates.latitude, z.coordinates.longitude, z.radiusKm),
    },
    properties: {
      id: z.id,
      name: z.name,
      district: z.district,
      state: z.state,
      primaryHazard: z.primaryHazard,
      secondaryHazards: z.secondaryHazards,
      severity: z.severity,
      areaSqKm: z.areaSqKm,
      affectedPopulation: z.affectedPopulation,
      affectedHabitations: z.affectedHabitations,
      status: z.status,
      radiusKm: z.radiusKm,
      center: z.coordinates,
      provenance: z.provenance,
    },
  }));

  return {
    type: 'FeatureCollection',
    features,
  };
}

export function getHabitationsGeoJSON(): GeoJsonFeatureCollection {
  const features: GeoJsonFeature[] = habitationsFixture.map((h) => ({
    type: 'Feature',
    id: h.id,
    geometry: {
      type: 'Point',
      coordinates: [h.coordinates.longitude, h.coordinates.latitude],
    },
    properties: {
      id: h.id,
      name: h.name,
      block: h.block,
      district: h.district,
      state: h.state,
      population: h.population,
      households: h.households,
      primaryHazard: h.primaryHazard,
      redZoneId: h.redZoneId,
      vulnerability: h.vulnerability,
      priority: h.priority,
      timeline: h.timeline,
      status: h.status,
      elevationM: h.elevationM,
      slopeDeg: h.slopeDeg,
      distanceToRiverKm: h.distanceToRiverKm,
      factors: h.factors,
      demographics: h.demographics,
      infrastructure: h.infrastructure,
      candidateSiteIds: h.candidateSiteIds,
      provenance: h.provenance,
    },
  }));

  return {
    type: 'FeatureCollection',
    features,
  };
}

export function getRelocationSitesGeoJSON(): GeoJsonFeatureCollection {
  const features: GeoJsonFeature[] = relocationSitesFixture.map((s) => ({
    type: 'Feature',
    id: s.id,
    geometry: {
      type: 'Point',
      coordinates: [s.coordinates.longitude, s.coordinates.latitude],
    },
    properties: {
      id: s.id,
      name: s.name,
      block: s.block,
      district: s.district,
      state: s.state,
      landClass: s.landClass,
      areaHectares: s.areaHectares,
      carryingCapacity: s.carryingCapacity,
      currentOccupancy: s.currentOccupancy,
      availableCapacity: Math.max(0, s.carryingCapacity - s.currentOccupancy),
      projectedRequirement: s.projectedRequirement,
      services: s.services,
      shelterCapacity: s.shelterCapacity,
      distanceToNearestHabitationKm: s.distanceToNearestHabitationKm,
      hazardExposure: s.hazardExposure,
      suitability: s.suitability,
      status: s.status,
      provenance: s.provenance,
    },
  }));

  return {
    type: 'FeatureCollection',
    features,
  };
}

export function getInfrastructureGeoJSON(): GeoJsonFeatureCollection {
  const features: GeoJsonFeature[] = criticalInfrastructureFixture.map((c) => ({
    type: 'Feature',
    id: c.id,
    geometry: {
      type: 'Point',
      coordinates: [c.coordinates.longitude, c.coordinates.latitude],
    },
    properties: {
      id: c.id,
      name: c.name,
      kind: c.kind,
      district: c.district,
      state: c.state,
    },
  }));

  return {
    type: 'FeatureCollection',
    features,
  };
}
