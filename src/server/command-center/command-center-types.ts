import type {
  DataProvenance,
  HazardType,
  PriorityLevel,
  RelocationTimeline,
  Severity,
} from '@/types/domain';
import type { CandidateSiteMatchResult } from '@/server/relocation/matching-engine';
import type { ScenarioImpactSummary } from '@/server/scenarios/scenario-types';

export interface CommandCenterKpis {
  totalAssessedHabitations: number;
  criticalHabitationsCount: number;
  immediateRelocationCount: number;
  totalPopulationAtRisk: number;
  totalAvailableRelocationHeadroom: number;
  activeScenarioEscalatedCount: number;
}

export interface OperationalPriorityQueueItem {
  rank: number;
  habitationId: string;
  habitationName: string;
  district: string;
  state: string;
  primaryHazard: HazardType;
  compositeRiskScore: number;
  riskLevel: Severity;
  priority: PriorityLevel;
  timeline: RelocationTimeline;
  urgencyWindow: string;
  population: number;
  households: number;
  recommendedSite: CandidateSiteMatchResult | null;
  recommendedAction: string;
  provenance: DataProvenance;
}

export interface RelocationCapacityOverview {
  totalSites: number;
  totalNominalCapacity: number;
  totalEffectiveCapacity: number;
  totalCurrentOccupancy: number;
  totalAvailableHeadroom: number;
  averageUtilizationPercent: number;
  topConstrainedSites: Array<{
    siteId: string;
    siteName: string;
    district: string;
    headroom: number;
    limitingFactor: string;
    utilizationPercent: number;
  }>;
}

export interface AuthorityActionItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  actionType: 'relocation_mandate' | 'red_zone_verification' | 'bottleneck_relief' | 'scenario_review';
  targetEntityId: string;
  targetEntityType: 'habitation' | 'relocation_site' | 'scenario';
  href: string;
  evidenceReference: string;
  timestamp: string;
}

export interface CommandCenterData {
  kpis: CommandCenterKpis;
  priorityQueue: OperationalPriorityQueueItem[];
  capacityOverview: RelocationCapacityOverview;
  activeScenario: ScenarioImpactSummary;
  actionQueue: AuthorityActionItem[];
  provenance: DataProvenance;
  lastUpdated: string;
}
