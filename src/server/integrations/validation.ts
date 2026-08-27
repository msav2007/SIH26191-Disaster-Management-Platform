import type {
  ExternalHazardRecord,
  ValidationIssue,
  ValidationResult,
} from './integration-types';

const VALID_HAZARD_TYPES = new Set([
  'landslide',
  'flood',
  'cloudburst',
  'coastal_erosion',
  'multi_hazard',
  'earthquake_subsidence',
  'cyclone_storm_surge',
]);

const VALID_SOURCES = new Set([
  'IMD_RADAR',
  'CWC_RIVER_GAUGE',
  'STATE_GIS_PORTAL',
  'ISRO_BHUVAN_RASTER',
  'IOT_FIELD_SENSOR',
  'SEEDED_FIXTURE',
]);

// India Geographic Bounding Box (WGS84 EPSG:4326)
const INDIA_BOUNDS = {
  minLat: 6.0,
  maxLat: 38.0,
  minLng: 68.0,
  maxLng: 98.0,
};

/**
 * Rigorously validates incoming external hazard and telemetry records.
 * Rejects malformed records, out-of-bounds spatial coordinates, and invalid scales.
 */
export function validateExternalHazardRecord(raw: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!raw || typeof raw !== 'object') {
    return {
      isValid: false,
      issues: [{ field: 'record', message: 'Record must be a non-null object', severity: 'error' }],
    };
  }

  const r = raw as Record<string, unknown>;

  // 1. Record ID
  const recordId = r['recordId'];
  if (typeof recordId !== 'string' || !recordId.trim()) {
    issues.push({ field: 'recordId', message: 'Record ID is required and must be a non-empty string', severity: 'error' });
  }

  // 2. Source
  const source = r['source'];
  if (typeof source !== 'string' || !VALID_SOURCES.has(source)) {
    issues.push({
      field: 'source',
      message: `Invalid source '${String(source)}'. Must be one of: ${Array.from(VALID_SOURCES).join(', ')}`,
      severity: 'error',
    });
  }

  // 3. Timestamp
  const timestamp = r['timestamp'];
  if (typeof timestamp !== 'string' || isNaN(Date.parse(timestamp))) {
    issues.push({ field: 'timestamp', message: 'Timestamp must be a valid ISO 8601 date string', severity: 'error' });
  }

  // 4. Hazard Type
  const hazardType = r['hazardType'];
  if (typeof hazardType !== 'string' || !VALID_HAZARD_TYPES.has(hazardType)) {
    issues.push({
      field: 'hazardType',
      message: `Invalid hazard type '${String(hazardType)}'. Must be one of: ${Array.from(VALID_HAZARD_TYPES).join(', ')}`,
      severity: 'error',
    });
  }

  // 5. Coordinates (WGS84 / EPSG:4326)
  const coords = r['coordinates'] as { longitude?: unknown; latitude?: unknown } | undefined;
  if (!coords || typeof coords !== 'object') {
    issues.push({ field: 'coordinates', message: 'Coordinates object with longitude and latitude is required', severity: 'error' });
  } else {
    const lng = Number(coords.longitude);
    const lat = Number(coords.latitude);

    if (isNaN(lng) || isNaN(lat)) {
      issues.push({ field: 'coordinates', message: 'Coordinates must be valid numeric values', severity: 'error' });
    } else {
      if (lng < INDIA_BOUNDS.minLng || lng > INDIA_BOUNDS.maxLng || lat < INDIA_BOUNDS.minLat || lat > INDIA_BOUNDS.maxLat) {
        issues.push({
          field: 'coordinates',
          message: `Coordinates [${lng}, ${lat}] fall outside valid Indian territory bounds (Lon: 68–98°E, Lat: 6–38°N)`,
          severity: 'error',
        });
      }
    }
  }

  // 6. Intensity Score [0, 100]
  const intensity = Number(r['intensityScore']);
  if (isNaN(intensity) || intensity < 0 || intensity > 100) {
    issues.push({ field: 'intensityScore', message: 'Intensity score must be a number between 0 and 100', severity: 'error' });
  }

  // 7. Confidence Score [0.0, 1.0]
  const confidence = Number(r['confidenceScore']);
  if (isNaN(confidence) || confidence < 0 || confidence > 1.0) {
    issues.push({ field: 'confidenceScore', message: 'Confidence score must be a number between 0.0 and 1.0', severity: 'error' });
  }

  const isValid = issues.every((i) => i.severity !== 'error');

  let sanitizedRecord: ExternalHazardRecord | undefined;
  if (isValid) {
    sanitizedRecord = {
      recordId: String(recordId).trim(),
      source: source as ExternalHazardRecord['source'],
      timestamp: new Date(String(timestamp)).toISOString(),
      hazardType: hazardType as ExternalHazardRecord['hazardType'],
      coordinates: {
        longitude: Number((coords as { longitude: number }).longitude),
        latitude: Number((coords as { latitude: number }).latitude),
      },
      intensityScore: Math.round(intensity),
      confidenceScore: Number(confidence.toFixed(2)),
      telemetryMetadata: (r['telemetryMetadata'] as Record<string, string | number | boolean>) ?? undefined,
      provenance: (r['provenance'] as ExternalHazardRecord['provenance']) ?? 'DEMO DATA',
    };
  }

  return {
    isValid,
    issues,
    sanitizedRecord,
  };
}
