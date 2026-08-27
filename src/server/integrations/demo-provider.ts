import { habitationsFixture } from '@/server/db/fixtures/disaster-data';
import type { MapPoint } from '@/types/domain';
import type {
  ExternalHazardRecord,
  HazardDataProvider,
  RainfallProvider,
  RiverGaugeProvider,
  ValidationResult,
} from './integration-types';
import { validateExternalHazardRecord } from './validation';

export class DemoHazardDataProvider implements HazardDataProvider {
  providerName = 'SIH26191 Seeded Telemetry Feed (Demo)';
  sourceType = 'SEEDED_FIXTURE' as const;
  status = 'demo_mode' as const;
  provenance = 'DEMO DATA' as const;

  async fetchHazardFeed(district?: string): Promise<ExternalHazardRecord[]> {
    const list = district
      ? habitationsFixture.filter((h) => h.district.toLowerCase() === district.toLowerCase())
      : habitationsFixture;

    return list.map((h) => ({
      recordId: `REC-${h.id}`,
      source: 'SEEDED_FIXTURE',
      timestamp: new Date().toISOString(),
      hazardType: h.primaryHazard,
      coordinates: h.coordinates,
      intensityScore: h.factors.hazardIntensity,
      confidenceScore: 0.95,
      telemetryMetadata: {
        district: h.district,
        state: h.state,
        elevationM: h.elevationM,
        slopeDeg: h.slopeDeg,
      },
      provenance: 'DEMO DATA',
    }));
  }

  validateRecord(record: unknown): ValidationResult {
    return validateExternalHazardRecord(record);
  }
}

export class DemoRainfallProvider implements RainfallProvider {
  providerName = 'IMD Doppler Radar Synthetic Feed (Demo)';

  async fetchRainfallTelemetry(coordinates: MapPoint) {
    // Deterministic simulation based on latitude
    const latFactor = Math.sin(coordinates.latitude);
    const hourlyPrecipitationMm = Math.round(Math.abs(latFactor * 45) + 10);
    const cumulative24hMm = Math.round(hourlyPrecipitationMm * 14.5);
    const anomalyPercent = Math.round((cumulative24hMm / 150) * 100 - 100);

    return {
      hourlyPrecipitationMm,
      cumulative24hMm,
      anomalyPercent,
      provenance: 'DEMO DATA' as const,
    };
  }
}

export class DemoRiverGaugeProvider implements RiverGaugeProvider {
  providerName = 'CWC Telemetry Gauge Network (Demo)';

  async fetchDischargeStatus(basinName: string) {
    const isHighDischarge = basinName.toLowerCase().includes('brahmaputra') || basinName.toLowerCase().includes('mandakini');

    return {
      basin: basinName,
      dischargeCusecs: isHighDischarge ? 185000 : 42000,
      dangerLevelM: 104.5,
      currentLevelM: isHighDischarge ? 106.2 : 98.4,
      floodStage: (isHighDischarge ? 'danger' : 'normal') as 'danger' | 'normal',
      provenance: 'DEMO DATA' as const,
    };
  }
}
