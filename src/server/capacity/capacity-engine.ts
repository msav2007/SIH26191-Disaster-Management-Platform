import type { RelocationSite, ServiceRating } from '@/types/domain';
import {
  getActiveCapacityConfig,
  type CapacityConfig,
  type CapacityStatus,
} from './capacity-config';

export type CapacityDimensionKey =
  | 'land'
  | 'water'
  | 'sanitation'
  | 'shelter'
  | 'healthcare'
  | 'road'
  | 'schools'
  | 'power'
  | 'livelihood';

export interface DimensionAssessment {
  dimension: CapacityDimensionKey;
  label: string;
  supportedPopulation: number;
  isLimiting: boolean;
  notes: string;
  isDataMissing: boolean;
}

export interface SiteCapacityAssessment {
  siteId: string;
  siteName: string;
  nominalCapacity: number;
  effectiveCapacity: number;
  currentOccupancy: number;
  availableHeadroom: number;
  utilizationPercent: number;
  occupancyBuffer: number;
  limitingFactor: CapacityDimensionKey;
  limitingFactorLabel: string;
  limitingFactorValue: number;
  capacityStatus: CapacityStatus;
  confidence: number;
  missingDataFields: string[];
  dimensions: Record<CapacityDimensionKey, DimensionAssessment>;
  isAtCapacity: boolean;
  evidence: {
    summary: string;
    limitingFactorExplanation: string;
    dataConfidenceText: string;
  };
}

/**
 * Multi-dimensional carrying-capacity engine implementing the limiting-factor principle.
 * Explicitly determines how many people a site can safely absorb without masking bottlenecks.
 */
export function calculateSiteCapacity(
  site: RelocationSite,
  customConfig?: CapacityConfig,
): SiteCapacityAssessment {
  const config = customConfig ?? getActiveCapacityConfig();
  const buffer = config.occupancyBuffer;
  const missingDataFields: string[] = [];

  // 1. Land Capacity (50 sq.m developable area standard per person)
  const landAreaSqM = site.areaHectares * 10000;
  const landCapacity = Math.round(
    landAreaSqM / (config.standards.minAreaPerPersonSqM || 50),
  );

  // 2. Water Supply Capacity
  const waterRating: ServiceRating = site.services.water;
  if (waterRating === 'unassessed') missingDataFields.push('water');
  const waterMultiplier =
    waterRating === 'adequate' ? 1.15 : waterRating === 'partial' ? 0.8 : 0.4;
  const waterCapacity = Math.round(site.carryingCapacity * waterMultiplier);

  // 3. Sanitation & Power Dimension
  const powerRating: ServiceRating = site.services.power;
  if (powerRating === 'unassessed') missingDataFields.push('power');
  const sanitationMultiplier =
    powerRating === 'adequate' && waterRating !== 'inadequate' ? 1.1 : 0.75;
  const sanitationCapacity = Math.round(site.carryingCapacity * sanitationMultiplier);

  // 4. Emergency Shelter Capacity
  const shelterBase =
    site.shelterCapacity > 0
      ? site.shelterCapacity * 1.8
      : site.carryingCapacity * 0.65;
  const shelterCapacity = Math.round(Math.max(site.carryingCapacity * 0.7, shelterBase));

  // 5. Healthcare Capacity
  const healthRating: ServiceRating = site.services.healthcare;
  if (healthRating === 'unassessed') missingDataFields.push('healthcare');
  const healthMultiplier =
    healthRating === 'adequate' ? 1.2 : healthRating === 'partial' ? 0.85 : 0.45;
  const healthCapacity = Math.round(site.carryingCapacity * healthMultiplier);

  // 6. Road / Access Capacity
  const roadRating: ServiceRating = site.services.roadAccess;
  if (roadRating === 'unassessed') missingDataFields.push('roadAccess');
  const roadMultiplier =
    roadRating === 'adequate' ? 1.25 : roadRating === 'partial' ? 0.8 : 0.35;
  const roadCapacity = Math.round(site.carryingCapacity * roadMultiplier);

  // 7. Schools / Education Capacity
  const schoolRating: ServiceRating = site.services.school;
  if (schoolRating === 'unassessed') missingDataFields.push('school');
  const schoolMultiplier =
    schoolRating === 'adequate' ? 1.1 : schoolRating === 'partial' ? 0.8 : 0.5;
  const schoolCapacity = Math.round(site.carryingCapacity * schoolMultiplier);

  // 8. Power Grid Capacity
  const powerMultiplier =
    powerRating === 'adequate' ? 1.2 : powerRating === 'partial' ? 0.8 : 0.4;
  const powerCapacity = Math.round(site.carryingCapacity * powerMultiplier);

  // 9. Livelihood / Economic Readiness Capacity
  const livelihoodRating: ServiceRating = site.services.livelihood;
  if (livelihoodRating === 'unassessed') missingDataFields.push('livelihood');
  const livelihoodMultiplier =
    livelihoodRating === 'adequate' ? 1.15 : livelihoodRating === 'partial' ? 0.75 : 0.4;
  const livelihoodCapacity = Math.round(site.carryingCapacity * livelihoodMultiplier);

  // Dimension Map
  const rawDimensions: Record<
    CapacityDimensionKey,
    { supported: number; label: string; notes: string; isMissing: boolean }
  > = {
    land: {
      supported: landCapacity,
      label: 'Developable Land Area',
      notes: `${site.areaHectares} ha (~50 sq.m/person standard)`,
      isMissing: false,
    },
    water: {
      supported: waterCapacity,
      label: 'Potable Water Network',
      notes: `Rated '${site.services.water}' against standard daily requirements`,
      isMissing: waterRating === 'unassessed',
    },
    sanitation: {
      supported: sanitationCapacity,
      label: 'Sanitation & Drainage',
      notes: `Grid network with solid waste buffer active`,
      isMissing: false,
    },
    shelter: {
      supported: shelterCapacity,
      label: 'Emergency Shelter Structures',
      notes: `${site.shelterCapacity} designated multi-purpose emergency shelter beds`,
      isMissing: site.shelterCapacity <= 0,
    },
    healthcare: {
      supported: healthCapacity,
      label: 'Primary Healthcare Access',
      notes: `Rated '${site.services.healthcare}' for emergency/trauma coverage`,
      isMissing: healthRating === 'unassessed',
    },
    road: {
      supported: roadCapacity,
      label: 'All-Weather Road Access',
      notes: `Rated '${site.services.roadAccess}' for heavy transit corridors`,
      isMissing: roadRating === 'unassessed',
    },
    schools: {
      supported: schoolCapacity,
      label: 'Educational Facilities',
      notes: `Rated '${site.services.school}' for school-age integration`,
      isMissing: schoolRating === 'unassessed',
    },
    power: {
      supported: powerCapacity,
      label: 'Power Grid Infrastructure',
      notes: `Rated '${site.services.power}' reliability rating`,
      isMissing: powerRating === 'unassessed',
    },
    livelihood: {
      supported: livelihoodCapacity,
      label: 'Livelihood & Economic Readiness',
      notes: `Rated '${site.services.livelihood}' economic catchment area`,
      isMissing: livelihoodRating === 'unassessed',
    },
  };

  // Find Limiting Factor (minimum supported population dimension)
  let minDimension: CapacityDimensionKey = 'land';
  let minVal = Infinity;

  (Object.keys(rawDimensions) as CapacityDimensionKey[]).forEach((dim) => {
    const supported = rawDimensions[dim].supported;
    if (supported < minVal) {
      minVal = supported;
      minDimension = dim;
    }
  });

  // Effective capacity constrained by the limiting factor multiplied by occupancy buffer
  const effectiveCapacity = Math.round(minVal * buffer);
  const currentOccupancy = site.currentOccupancy;
  const availableHeadroom = Math.max(0, effectiveCapacity - currentOccupancy);
  const utilizationPercent =
    effectiveCapacity > 0
      ? Math.min(100, Math.round((currentOccupancy / effectiveCapacity) * 100))
      : 100;

  const isAtCapacity = availableHeadroom <= 0;

  // Determine Capacity Status
  let capacityStatus: CapacityStatus = 'AVAILABLE';
  if (site.hazardExposure === 'critical' || availableHeadroom <= 0) {
    capacityStatus = site.hazardExposure === 'critical' ? 'UNSUITABLE' : 'FULL';
  } else if (utilizationPercent >= 90) {
    capacityStatus = 'NEAR_CAPACITY';
  } else if (utilizationPercent >= 70) {
    capacityStatus = 'LIMITED';
  } else {
    capacityStatus = 'AVAILABLE';
  }

  // Data Confidence
  const confidence = missingDataFields.length > 0 ? 0.6 : 0.95;

  const dimensions = {} as Record<CapacityDimensionKey, DimensionAssessment>;
  (Object.keys(rawDimensions) as CapacityDimensionKey[]).forEach((dim) => {
    dimensions[dim] = {
      dimension: dim,
      label: rawDimensions[dim].label,
      supportedPopulation: rawDimensions[dim].supported,
      isLimiting: dim === minDimension,
      notes: rawDimensions[dim].notes,
      isDataMissing: rawDimensions[dim].isMissing,
    };
  });

  const summary = `Site ${site.name} provides ${availableHeadroom.toLocaleString('en-IN')} available headroom (${effectiveCapacity.toLocaleString('en-IN')} effective capacity, ${currentOccupancy} currently occupied).`;
  const limitingFactorExplanation = `Carrying capacity is constrained by ${rawDimensions[minDimension].label} (${minVal.toLocaleString('en-IN')} supported population capacity ceiling).`;
  const dataConfidenceText =
    missingDataFields.length > 0
      ? `CONDITIONAL — DATA SOURCE REQUIRED for: ${missingDataFields.join(', ')}.`
      : 'Verified multi-dimensional field assessment data.';

  return {
    siteId: site.id,
    siteName: site.name,
    nominalCapacity: site.carryingCapacity,
    effectiveCapacity,
    currentOccupancy,
    availableHeadroom,
    utilizationPercent,
    occupancyBuffer: buffer,
    limitingFactor: minDimension,
    limitingFactorLabel: rawDimensions[minDimension].label,
    limitingFactorValue: minVal,
    capacityStatus,
    confidence,
    missingDataFields,
    dimensions,
    isAtCapacity,
    evidence: {
      summary,
      limitingFactorExplanation,
      dataConfidenceText,
    },
  };
}
