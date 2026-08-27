import { NextResponse } from 'next/server';

import {
  getHabitationsGeoJSON,
  getInfrastructureGeoJSON,
  getRedZonesGeoJSON,
  getRelocationSitesGeoJSON,
} from '@/server/gis/geojson-service';
import type { HazardType } from '@/types/domain';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const layer = searchParams.get('layer') ?? 'all';
  const hazard = searchParams.get('hazard') as HazardType | 'all' | null;

  const redZones = getRedZonesGeoJSON(hazard ?? 'all');
  const habitations = getHabitationsGeoJSON();
  const relocationSites = getRelocationSitesGeoJSON();
  const infrastructure = getInfrastructureGeoJSON();

  if (layer === 'red_zones') {
    return NextResponse.json(redZones);
  }

  if (layer === 'habitations') {
    return NextResponse.json(habitations);
  }

  if (layer === 'relocation_sites') {
    return NextResponse.json(relocationSites);
  }

  if (layer === 'infrastructure') {
    return NextResponse.json(infrastructure);
  }

  return NextResponse.json({
    type: 'FeatureCollectionBundle',
    timestamp: new Date().toISOString(),
    layers: {
      redZones,
      habitations,
      relocationSites,
      infrastructure,
    },
  });
}
