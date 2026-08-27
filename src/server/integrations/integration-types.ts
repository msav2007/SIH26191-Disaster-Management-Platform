import type { DataProvenance, HazardType, MapPoint } from '@/types/domain';

export type IntegrationSource =
  | 'IMD_RADAR'
  | 'CWC_RIVER_GAUGE'
  | 'STATE_GIS_PORTAL'
  | 'ISRO_BHUVAN_RASTER'
  | 'IOT_FIELD_SENSOR'
  | 'SEEDED_FIXTURE';

export interface ExternalHazardRecord {
  recordId: string;
  source: IntegrationSource;
  timestamp: string;
  hazardType: HazardType;
  coordinates: MapPoint;
  intensityScore: number; // 0 to 100
  confidenceScore: number; // 0.0 to 1.0
  telemetryMetadata?: Record<string, string | number | boolean> | undefined;
  provenance: DataProvenance;
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  sanitizedRecord?: ExternalHazardRecord | undefined;
}

export interface HazardDataProvider {
  providerName: string;
  sourceType: IntegrationSource;
  status: 'connected' | 'demo_mode' | 'unconfigured';
  provenance: DataProvenance;
  fetchHazardFeed(district?: string): Promise<ExternalHazardRecord[]>;
  validateRecord(record: unknown): ValidationResult;
}

export interface RainfallProvider {
  providerName: string;
  fetchRainfallTelemetry(coordinates: MapPoint): Promise<{
    hourlyPrecipitationMm: number;
    cumulative24hMm: number;
    anomalyPercent: number;
    provenance: DataProvenance;
  }>;
}

export interface RiverGaugeProvider {
  providerName: string;
  fetchDischargeStatus(basinName: string): Promise<{
    basin: string;
    dischargeCusecs: number;
    dangerLevelM: number;
    currentLevelM: number;
    floodStage: 'normal' | 'warning' | 'danger' | 'extreme';
    provenance: DataProvenance;
  }>;
}
