import { defaultCapacityModel } from '@/config/capacity/default-model';
import type { LandClass, ServiceRating } from '@/types/domain';

export type CapacityStatus = 'AVAILABLE' | 'LIMITED' | 'NEAR_CAPACITY' | 'FULL' | 'UNSUITABLE';

export type SuitabilityBand = 'EXCELLENT' | 'GOOD' | 'CONDITIONAL' | 'POOR' | 'UNSUITABLE';

export interface SuitabilityWeights {
  safety: number;
  capacity: number;
  distance: number;
  road: number;
  water: number;
  healthcare: number;
  shelter: number;
  power: number;
  livelihood: number;
  schools: number;
}

export interface CapacityConfig {
  version: string;
  occupancyBuffer: number;
  standards: {
    minAreaPerPersonSqM: number;
    dailyWaterSupplyLitersPerPerson: number;
    shelterMultiplier: number;
  };
  suitabilityWeights: SuitabilityWeights;
  distanceThresholds: {
    nearKm: number;
    moderateKm: number;
    farKm: number;
    extremeKm: number;
    interDistrictMaxKm: number;
  };
  serviceRatings: Record<ServiceRating, number>;
  landClassReadiness: Record<LandClass, number>;
  suitabilityBands: {
    excellent: number;
    good: number;
    conditional: number;
    poor: number;
  };
}

export function getActiveCapacityConfig(): CapacityConfig {
  return {
    version: defaultCapacityModel.version,
    occupancyBuffer: defaultCapacityModel.occupancyBuffer,
    standards: { ...defaultCapacityModel.standards },
    suitabilityWeights: { ...defaultCapacityModel.suitabilityWeights },
    distanceThresholds: { ...defaultCapacityModel.distanceThresholds },
    serviceRatings: { ...defaultCapacityModel.serviceRatings },
    landClassReadiness: { ...defaultCapacityModel.landClassReadiness },
    suitabilityBands: { ...defaultCapacityModel.suitabilityBands },
  };
}
