import type {
  DataProvenance,
  DisasterEvent,
  Habitation,
  HabitationDemographics,
  HabitationInfrastructure,
  HazardType,
  MapPoint,
  PriorityLevel,
  RelocationTimeline,
  Severity,
} from '@/types/domain';
import type { CandidateSiteMatchResult } from '@/server/relocation/matching-engine';
import type { HabitationRiskResult } from '@/server/risk/risk-engine';

import type { ScenarioImpactSummary } from '@/server/scenarios/scenario-types';

export type ReportType =
  | 'executive_summary'
  | 'vulnerability_dossier'
  | 'relocation_justification'
  | 'scenario_impact';

export interface ReportMetadata {
  reportId: string;
  title: string;
  reportType: ReportType;
  generatedAt: string;
  authorityJurisdiction: string;
  modelVersion: string;
  provenance: DataProvenance;
  disclaimer: string;
}

export interface GisFeatureSummary {
  featureId: string;
  featureType: 'habitation' | 'red_zone' | 'relocation_site' | 'infrastructure';
  name: string;
  district: string;
  state: string;
  coordinates: MapPoint;
  crs: string; // EPSG:4326 / WGS84
  notes?: string;
}

export interface GisCoordinateAppendix {
  crs: string;
  subjectCoordinates: MapPoint;
  redZoneFeatures: GisFeatureSummary[];
  candidateSiteFeatures: GisFeatureSummary[];
  infrastructureFeatures: GisFeatureSummary[];
}

export interface HabitationVulnerabilityDossierReport {
  metadata: ReportMetadata;
  habitation: Habitation;
  riskAssessment: HabitationRiskResult;
  demographics: HabitationDemographics;
  infrastructure: HabitationInfrastructure;
  disasterHistory: DisasterEvent[];
  redZoneRelationship: {
    isContained: boolean;
    redZoneId: string | null;
    redZoneName?: string | undefined;
    hazardSeverity?: Severity | undefined;
  };
  gisAppendix: GisCoordinateAppendix;
}

export interface RelocationJustificationReport {
  metadata: ReportMetadata;
  habitation: Habitation;
  riskAssessment: HabitationRiskResult;
  statutoryMandate: {
    mandateHeadline: string;
    disasterActReference: string;
    urgencyWindow: string;
    priorityLevel: PriorityLevel;
  };
  recommendedSite: CandidateSiteMatchResult | null;
  alternativeSites: CandidateSiteMatchResult[];
  unabsorbedPopulation: number;
  overallFeasibility: 'fully_feasible' | 'partial_capacity' | 'no_feasible_site';
  decisionExplanation: {
    headline: string;
    rationaleText: string;
    tradeoffsText: string;
    keyStrengths: string[];
    constraints: string[];
  };
  gisAppendix: GisCoordinateAppendix;
}

export interface ExecutiveAuthoritySummaryReport {
  metadata: ReportMetadata;
  scope: {
    district?: string | undefined;
    totalAssessedHabitations: number;
    populationAtRisk: number;
    totalCandidateSites: number;
    totalAvailableHeadroom: number;
    netShortfall: number;
  };
  priorityBreakdown: {
    immediate: number;
    shortTerm: number;
    mediumTerm: number;
    monitor: number;
  };
  hazardDistribution: Record<HazardType, number>;
  districtsRepresented: Array<{
    district: string;
    state: string;
    habitationsCount: number;
    populationAtRisk: number;
    criticalCount: number;
  }>;
  topPriorityHabitations: Array<{
    id: string;
    name: string;
    district: string;
    population: number;
    hazard: HazardType;
    riskScore: number;
    priority: PriorityLevel;
    timeline: RelocationTimeline;
    recommendedSiteName: string | null;
  }>;
  keyOperationalRecommendations: string[];
}

export interface ScenarioImpactReport {
  metadata: ReportMetadata;
  impactSummary: ScenarioImpactSummary;
}
