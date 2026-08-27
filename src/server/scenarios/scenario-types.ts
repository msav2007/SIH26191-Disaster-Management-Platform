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

export interface HabitationScenarioResult {
  habitation: Habitation;
  baselineRisk: HabitationRiskResult;
  scenarioRisk: HabitationRiskResult;
  riskDelta: number; // e.g. +7.3
  pctChange: number; // e.g. +8.5%
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
  factorComparisons: {
    hazard: FactorComparison;
    vulnerability: FactorComparison;
    history: FactorComparison;
    exposure: FactorComparison;
    infrastructure: FactorComparison;
  };
  primaryDriverFactor: 'hazard' | 'vulnerability' | 'history' | 'exposure' | 'infrastructure';
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

export interface ScenarioImpactSummary {
  scenario: ScenarioPreset;
  modifiersApplied: ScenarioModifiers;
  timestamp: string;
  totalHabitationsEvaluated: number;
  totalHabitationsEscalated: number;
  baselineCriticalHabitations: number;
  scenarioCriticalHabitations: number;
  newlyCriticalHabitations: number;
  baselineImmediateRelocations: number;
  scenarioImmediateRelocations: number;
  newlyImmediateRelocations: number;
  totalPopulationAtRiskBaseline: number;
  totalPopulationAtRiskScenario: number;
  additionalPopulationAtRisk: number;
  additionalRelocationDemand: number;
  totalAvailableRelocationHeadroom: number;
  capacityDeficit: number;
  districtImpacts: DistrictScenarioImpact[];
  changedHabitations: HabitationScenarioResult[];
  provenance: DataProvenance;
}
