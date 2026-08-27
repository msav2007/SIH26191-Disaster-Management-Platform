import { render, screen } from '@testing-library/react';

import {
  getHabitationsGeoJSON,
  getInfrastructureGeoJSON,
  getRedZonesGeoJSON,
  getRelocationSitesGeoJSON,
} from '@/server/gis/geojson-service';
import {
  calculateDistanceKm,
  evaluateCandidateSites,
  isPointInRedZone,
} from '@/server/gis/spatial-queries';
import {
  habitationsFixture,
  redZonesFixture,
} from '@/server/db/fixtures/disaster-data';
import {
  GisFeatureInspector,
} from '@/features/gis/components/gis-feature-inspector';

describe('GIS GeoJSON Service', () => {
  it('converts Red Zones into RFC 7946 GeoJSON FeatureCollection', () => {
    const geojson = getRedZonesGeoJSON();
    expect(geojson.type).toBe('FeatureCollection');
    expect(geojson.features.length).toBeGreaterThan(0);

    const first = geojson.features[0];
    expect(first?.type).toBe('Feature');
    expect(first?.geometry).toHaveProperty('type', 'Polygon');
    expect(first?.properties).toHaveProperty('severity');
    expect(first?.properties).toHaveProperty('affectedPopulation');
  });

  it('filters Red Zones by hazard type', () => {
    const landslideOnly = getRedZonesGeoJSON('landslide');
    expect(landslideOnly.features.length).toBeGreaterThan(0);
    expect(
      landslideOnly.features.every(
        (f) =>
          f.properties['primaryHazard'] === 'landslide' ||
          (Array.isArray(f.properties['secondaryHazards']) &&
            f.properties['secondaryHazards'].includes('landslide')),
      ),
    ).toBe(true);
  });

  it('converts Habitations and Relocation Sites to Point FeatureCollections', () => {
    const habitations = getHabitationsGeoJSON();
    expect(habitations.features[0]?.geometry).toHaveProperty('type', 'Point');

    const sites = getRelocationSitesGeoJSON();
    expect(sites.features[0]?.geometry).toHaveProperty('type', 'Point');
    expect(sites.features[0]?.properties).toHaveProperty('carryingCapacity');
    expect(sites.features[0]?.properties).toHaveProperty('availableCapacity');

    const inf = getInfrastructureGeoJSON();
    expect(inf.features[0]?.geometry).toHaveProperty('type', 'Point');
  });
});

describe('Spatial Calculations & Queries', () => {
  it('calculates Haversine distance accurately', () => {
    // Distance between Chooralmala and Meppadi (~6.2 km)
    const pointA = { latitude: 11.5423, longitude: 76.1345 };
    const pointB = { latitude: 11.5842, longitude: 76.1684 };

    const distance = calculateDistanceKm(pointA, pointB);
    expect(distance).toBeGreaterThan(5);
    expect(distance).toBeLessThan(8);
  });

  it('evaluates containment in Red Zone correctly', () => {
    const chooralmala = habitationsFixture.find((h) => h.id === 'HAB-WY-01')!;
    const wayanadZone = redZonesFixture.find((z) => z.id === 'RZ-KL-WY-01')!;

    const isInZone = isPointInRedZone(chooralmala.coordinates, wayanadZone);
    expect(isInZone).toBe(true);
  });

  it('evaluates candidate relocation sites and ranks them', () => {
    const chooralmala = habitationsFixture.find((h) => h.id === 'HAB-WY-01')!;
    const candidateMatches = evaluateCandidateSites(chooralmala);

    expect(candidateMatches.length).toBeGreaterThan(0);
    expect(candidateMatches[0]?.suitabilityScore).toBeGreaterThan(0);
    expect(candidateMatches[0]?.distanceKm).toBeGreaterThan(0);
  });
});

describe('GIS Feature Inspector', () => {
  it('renders Red Zone inspection details with population and hazards', () => {
    const zone = redZonesFixture[0]!;
    render(
      <GisFeatureInspector
        feature={{ type: 'red_zone', data: zone }}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText(zone.name)).toBeInTheDocument();
    expect(screen.getByText(/Affected Population/i)).toBeInTheDocument();
    expect(screen.getByText(zone.affectedPopulation.toLocaleString('en-IN'))).toBeInTheDocument();
  });

  it('renders Habitation inspection details with priority and factors', () => {
    const habitation = habitationsFixture[0]!;
    render(
      <GisFeatureInspector
        feature={{ type: 'habitation', data: habitation }}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText(habitation.name)).toBeInTheDocument();
    expect(screen.getByText(/Multi-Criteria Vulnerability Factors/i)).toBeInTheDocument();
    expect(screen.getByText(/Open Full Habitation Dossier/i)).toBeInTheDocument();
  });

  it('renders empty state when no feature is selected', () => {
    render(<GisFeatureInspector feature={null} onClose={() => {}} />);
    expect(screen.getByText(/No feature selected/i)).toBeInTheDocument();
  });
});
