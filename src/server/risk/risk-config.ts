import { defaultRiskModel } from '@/config/risk/default-model';

export interface FactorWeights {
  hazard: number;
  vulnerability: number;
  history: number;
  exposure: number;
  infrastructure: number;
}

export interface RiskBands {
  critical: number;
  high: number;
  moderate: number;
  low: number;
}

export interface PriorityUrgencyConfig {
  immediate: {
    minCompositeScore: number;
    minCriticalHazardScore: number;
    minVulnerabilityScore: number;
    requiresRedZone: boolean;
    window: string;
  };
  shortTerm: {
    minCompositeScore: number;
    minDisasterHistoryScore: number;
    window: string;
  };
  mediumTerm: {
    minCompositeScore: number;
    window: string;
  };
  monitor: {
    window: string;
  };
}

export interface RiskEngineConfig {
  version: string;
  factors: FactorWeights;
  multiHazard: {
    secondaryDampeningCoefficient: number;
  };
  bands: RiskBands;
  priorityThresholds: PriorityUrgencyConfig;
}

export function getActiveRiskConfig(): RiskEngineConfig {
  return {
    version: defaultRiskModel.version,
    factors: { ...defaultRiskModel.factors },
    multiHazard: { ...defaultRiskModel.multiHazard },
    bands: { ...defaultRiskModel.bands },
    priorityThresholds: { ...defaultRiskModel.priorityThresholds },
  };
}
