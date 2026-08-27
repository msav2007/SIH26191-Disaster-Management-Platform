import type { DataProvenance, HazardType, PriorityLevel, RelocationTimeline, Severity } from '@/types/domain';

export type AiExplanationMode =
  | 'risk_justification'
  | 'relocation_rationale'
  | 'scenario_briefing';

export interface GroundedFactItem {
  domain: string;
  metric: string;
  value: string | number;
  weight?: string | number;
  isLimitingOrDominant?: boolean;
}

export interface GroundedDecisionContext {
  mode: AiExplanationMode;
  targetId: string;
  targetName: string;
  district: string;
  state: string;
  primaryHazard: HazardType;
  population: number;
  households: number;
  riskScore: number;
  riskLevel: Severity;
  priority: PriorityLevel;
  timeline: RelocationTimeline;
  urgencyWindow: string;
  verifiedFacts: GroundedFactItem[];
  relocationContext?: {
    recommendedSiteId: string;
    recommendedSiteName: string;
    distanceKm: number;
    suitabilityScore: number;
    availableHeadroom: number;
    effectiveCapacity: number;
    limitingFactor: string;
  } | undefined;
  scenarioContext?: {
    scenarioName: string;
    baselineRisk: number;
    scenarioRisk: number;
    deltaRisk: number;
    baselinePriority: PriorityLevel;
    scenarioPriority: PriorityLevel;
    primaryDriver: string;
  } | undefined;
  provenance: DataProvenance;
}

export interface GroundedExplanationResult {
  mode: AiExplanationMode;
  targetId: string;
  headline: string;
  executiveSummary: string;
  mathematicalDriverExplanation: string;
  evidenceBulletPoints: string[];
  operationalConsequence: string;
  capacityAndSiteAnalysis?: string | undefined;
  generatedBy: 'deterministic_rule_engine' | 'grounded_llm';
  modelStamp: string;
  provenance: DataProvenance;
  disclaimer: string;
}
