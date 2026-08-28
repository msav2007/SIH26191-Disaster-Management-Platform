import type {
  DataProvenance,
  Habitation,
  HazardType,
  PriorityLevel,
  RelocationTimeline,
} from '@/types/domain';
import type { CandidateSiteMatchResult } from '@/server/relocation/matching-engine';
import type { HabitationRiskResult } from '@/server/risk/risk-engine';

export interface ScenarioModifiers {
  rainfallMultiplier: number; // 1.0 = baseline, 1.2 = +20%
  cloudburstSurge: number; // 0 = none, 10-30 = moderate to severe surge
  floodIntensityMultiplier: number; // 1.0 = baseline, 1.25 = +25%
  slopeSaturationFactor: number; // 1.0 = baseline, 1.3 = severe shear stress
  infrastructureStrainMultiplier: number; // 1.0 = baseline, 1.2 = road/power outages
}

export interface ScenarioParameterMeta {
  id: keyof ScenarioModifiers;
  label: string;
  min: number;
  max: number;
  default: number;
  step: number;
  unit: string;
  description: string;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  primaryHazard: HazardType;
  modifiers: ScenarioModifiers;
  scientificContext: string;
  provenance: DataProvenance;
}

export interface FactorComparison {
  baselineRaw: number;
  scenarioRaw: number;
  rawDelta: number;
  baselineContribution: number;
  scenarioContribution: number;
  contributionDelta: number;
  weight: number;
}

export type FactorDriverKey = 'hazard' | 'vulnerability' | 'history' | 'exposure' | 'infrastructure';

export interface HabitationScenarioResult {
  habitation: Habitation;
  baselineRisk: HabitationRiskResult;
  scenarioRisk: HabitationRiskResult;

  // Single-source mathematical traceability fields
  baselineScore: number;
  scenarioScore: number;
  delta: number; // Verified: scenarioScore - baselineScore
  deltaPercentage: number;
  baselinePriority: PriorityLevel;
  scenarioPriority: PriorityLevel;
  priorityChanged: boolean;
  baselineTimeline: RelocationTimeline;
  scenarioTimeline: RelocationTimeline;
  timelineChanged: boolean;
  primaryDriver: FactorDriverKey;
  driverContribution: number;

  // Compatibility aliases
  riskDelta: number;
  pctChange: number;
  primaryDriverFactor: FactorDriverKey;

  priorityTransition: {
    baseline: PriorityLevel;
    scenario: PriorityLevel;
    hasEscalated: boolean;
    isNewlyCritical: boolean;
  };
  timelineTransition: {
    baseline: RelocationTimeline;
    scenario: RelocationTimeline;
    hasAccelerated: boolean;
    isNewlyImmediate: boolean;
  };
  factorComparisons: Record<FactorDriverKey, FactorComparison>;
  baselineRecommendedSite: CandidateSiteMatchResult | null;
  scenarioRecommendedSite: CandidateSiteMatchResult | null;
  siteRecommendationChanged: boolean;
  deterministicExplanation: string;
}

export interface DistrictScenarioImpact {
  district: string;
  state: string;
  habitationsEvaluated: number;
  habitationsEscalated: number;
  baselineCriticalCount: number;
  scenarioCriticalCount: number;
  newlyCriticalCount: number;
  populationAtRiskBaseline: number;
  populationAtRiskScenario: number;
  additionalPopulationAtRisk: number;
}

export type SimulationStatus = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface SimulationResultAggregates {
  totalHabitationsEvaluated: number;
  totalHabitationsEscalated: number;
  totalAssessedPopulation: number;
  totalPopulationAtRiskBaseline: number;
  totalPopulationAtRiskScenario: number;
  additionalPopulationAtRisk: number;
  districtImpacts: DistrictScenarioImpact[];
}

export interface SimulationResultTransitions {
  baselineCriticalCount: number;
  scenarioCriticalCount: number;
  newlyCriticalCount: number;
  baselineImmediateCount: number;
  scenarioImmediateCount: number;
  newlyImmediateCount: number;
}

export interface SimulationResultRelocation {
  additionalRelocationDemand: number;
  totalDemandScenario: number;
  capacityDeficit: number;
}

export interface SimulationResultCapacity {
  totalAvailableRelocationHeadroom: number;
  totalEffectiveCapacity: number;
  totalNominalCapacity: number;
  totalCurrentOccupancy: number;
}

export interface SimulationResultMetadata {
  timestamp: string;
  status: SimulationStatus;
  modelStamp: string;
  provenance: DataProvenance;
  deterministicSeed: string;
}

export interface ScenarioImpactSummary {
  scenario: ScenarioPreset;
  modifiersApplied: ScenarioModifiers;
  timestamp: string;
  status: SimulationStatus;
  totalHabitationsEvaluated: number;
  totalHabitationsEscalated: number;
  baselineCriticalHabitations: number;
  scenarioCriticalHabitations: number;
  newlyCriticalHabitations: number;
  baselineImmediateRelocations: number;
  scenarioImmediateRelocations: number;
  newlyImmediateRelocations: number;
  totalAssessedPopulation: number;
  totalPopulationAtRiskBaseline: number;
  totalPopulationAtRiskScenario: number;
  additionalPopulationAtRisk: number;
  additionalRelocationDemand: number;
  totalAvailableRelocationHeadroom: number;
  capacityDeficit: number;
  districtImpacts: DistrictScenarioImpact[];
  allHabitations: HabitationScenarioResult[];
  changedHabitations: HabitationScenarioResult[];
  provenance: DataProvenance;

  // Complete Structured Result Sub-Objects
  settlements: HabitationScenarioResult[];
  aggregates: SimulationResultAggregates;
  transitions: SimulationResultTransitions;
  relocation: SimulationResultRelocation;
  capacity: SimulationResultCapacity;
  metadata: SimulationResultMetadata;
}
