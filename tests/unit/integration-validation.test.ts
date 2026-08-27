import { validateExternalHazardRecord } from '@/server/integrations/validation';
import {
  DemoHazardDataProvider,
  DemoRainfallProvider,
  DemoRiverGaugeProvider,
} from '@/server/integrations/demo-provider';

describe('Data Ingestion Validation & Integration Layer (Phase 9)', () => {
  it('validates a correct external hazard record within Indian geographic bounds', () => {
    const validRecord = {
      recordId: 'EXT-REC-001',
      source: 'IMD_RADAR',
      timestamp: '2026-08-27T10:00:00.000Z',
      hazardType: 'landslide',
      coordinates: { longitude: 76.15, latitude: 11.52 },
      intensityScore: 85,
      confidenceScore: 0.92,
      provenance: 'DEMO DATA',
    };

    const result = validateExternalHazardRecord(validRecord);
    expect(result.isValid).toBe(true);
    expect(result.sanitizedRecord?.intensityScore).toBe(85);
    expect(result.sanitizedRecord?.coordinates.longitude).toBe(76.15);
  });

  it('rejects records with coordinates outside Indian territory', () => {
    const invalidRecord = {
      recordId: 'EXT-REC-002',
      source: 'IMD_RADAR',
      timestamp: '2026-08-27T10:00:00.000Z',
      hazardType: 'landslide',
      coordinates: { longitude: -0.12, latitude: 51.50 }, // London coordinates
      intensityScore: 70,
      confidenceScore: 0.9,
    };

    const result = validateExternalHazardRecord(invalidRecord);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.field === 'coordinates')).toBe(true);
  });

  it('rejects records with invalid intensity scale or missing timestamp', () => {
    const invalidRecord = {
      recordId: 'EXT-REC-003',
      source: 'UNKNOWN_SOURCE',
      timestamp: 'not-a-date',
      hazardType: 'invalid_hazard',
      coordinates: { longitude: 76.15, latitude: 11.52 },
      intensityScore: 150, // Out of [0, 100] bounds
      confidenceScore: 1.5, // Out of [0, 1] bounds
    };

    const result = validateExternalHazardRecord(invalidRecord);
    expect(result.isValid).toBe(false);
    expect(result.issues.length).toBeGreaterThanOrEqual(4);
  });

  it('verifies Demo Providers carry explicit DEMO DATA provenance', async () => {
    const hazardProvider = new DemoHazardDataProvider();
    const rainfallProvider = new DemoRainfallProvider();
    const riverProvider = new DemoRiverGaugeProvider();

    const feed = await hazardProvider.fetchHazardFeed();
    expect(feed.length).toBe(7);
    expect(feed[0]!.provenance).toBe('DEMO DATA');

    const rain = await rainfallProvider.fetchRainfallTelemetry({ longitude: 76.15, latitude: 11.52 });
    expect(rain.provenance).toBe('DEMO DATA');
    expect(rain.hourlyPrecipitationMm).toBeGreaterThan(0);

    const river = await riverProvider.fetchDischargeStatus('Brahmaputra');
    expect(river.provenance).toBe('DEMO DATA');
    expect(river.floodStage).toBe('danger');
  });
});
