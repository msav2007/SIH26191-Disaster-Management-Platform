export type HazardType =
  | 'landslide'
  | 'flood'
  | 'coastal_erosion'
  | 'cloudburst'
  | 'multi_hazard';

export type Severity = 'critical' | 'high' | 'moderate' | 'low';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type RelocationTimeline = 'immediate' | 'short_term' | 'medium_term' | 'monitoring';

export type DataProvenance = 'LIVE CONNECTED' | 'SEEDED DATA' | 'DEMO DATA' | 'DATA SOURCE REQUIRED';

export type SemanticTone = 'critical' | 'high' | 'moderate' | 'safe' | 'info' | 'neutral';

export type ServiceRating = 'adequate' | 'partial' | 'inadequate' | 'unassessed';

export type LandClass = 'government_revenue' | 'forest_cleared' | 'acquired_private' | 'panchayat';

export interface MapPoint {
  latitude: number;
  longitude: number;
  x?: number;
  y?: number;
}

export interface DisasterEvent {
  id: string;
  year: number;
  type: HazardType;
  description: string;
  casualties: number;
  displaced: number;
}

export interface VulnerabilityFactors {
  hazardIntensity: number;
  populationVulnerability: number;
  disasterHistory: number;
  exposure: number;
  infrastructureRisk: number;
  relocationFeasibility: number;
}

export interface HabitationDemographics {
  children: number;
  elderly: number;
  pwd: number;
  belowPovertyLine: number;
}

export interface HabitationInfrastructure {
  school: boolean;
  healthSubCentre: boolean;
  allWeatherRoad: boolean;
  pipedWater: boolean;
  electrified: boolean;
  mobileCoverage: boolean;
}

export interface Habitation {
  id: string;
  name: string;
  block: string;
  district: string;
  state: string;
  population: number;
  households: number;
  primaryHazard: HazardType;
  redZoneId: string | null;
  vulnerability: Severity;
  priority: PriorityLevel;
  timeline: RelocationTimeline;
  status: 'awaiting_decision' | 'survey_complete' | 'relocation_approved' | 'in_progress';
  elevationM: number;
  slopeDeg: number;
  distanceToRiverKm: number;
  coordinates: MapPoint;
  factors: VulnerabilityFactors;
  demographics: HabitationDemographics;
  infrastructure: HabitationInfrastructure;
  history: DisasterEvent[];
  candidateSiteIds: string[];
  notes: string[];
  lastSurvey: string;
  isDemoData: boolean;
  provenance: DataProvenance;
}

export interface RedZone {
  id: string;
  name: string;
  district: string;
  state: string;
  primaryHazard: HazardType;
  secondaryHazards: HazardType[];
  severity: Severity;
  areaSqKm: number;
  affectedPopulation: number;
  affectedHabitations: number;
  status: 'notified' | 'under_review' | 'draft';
  lastUpdated: string;
  source: string;
  coordinates: MapPoint;
  radiusKm: number;
  isDemoData: boolean;
  provenance: DataProvenance;
}

export interface SiteServices {
  water: ServiceRating;
  healthcare: ServiceRating;
  roadAccess: ServiceRating;
  school: ServiceRating;
  power: ServiceRating;
  livelihood: ServiceRating;
}

export interface RelocationSite {
  id: string;
  name: string;
  block: string;
  district: string;
  state: string;
  landClass: LandClass;
  areaHectares: number;
  carryingCapacity: number;
  currentOccupancy: number;
  projectedRequirement: number;
  services: SiteServices;
  shelterCapacity: number;
  distanceToNearestHabitationKm: number;
  hazardExposure: Severity;
  suitability: 'suitable' | 'conditionally_suitable' | 'requires_assessment' | 'not_suitable';
  status: 'commissioned' | 'development' | 'identified' | 'assessment_pending';
  lastUpdated: string;
  coordinates: MapPoint;
  notes: string[];
  isDemoData: boolean;
  provenance: DataProvenance;
}

export interface DistrictSummary {
  district: string;
  state: string;
  redZones: number;
  habitations: number;
  populationAtRisk: number;
  siteCapacity: number;
  dominantHazard: HazardType;
}

export interface CriticalInfrastructure {
  id: string;
  name: string;
  kind: 'hospital' | 'shelter' | 'highway_node' | 'eoc' | 'helipad';
  district: string;
  state: string;
  coordinates: MapPoint;
}

export interface AuthorityAction {
  id: string;
  urgency: 'critical' | 'high' | 'moderate';
  headline: string;
  evidence: string;
  recommendation: string;
  window: string;
  targetId?: string;
  targetType?: 'habitation' | 'site' | 'zone';
}

export interface SiteMatch {
  site: RelocationSite;
  availableCapacity: number;
  suitabilityScore: number;
  coveragePct: number;
}

export interface HabitationCoverage {
  habitation: Habitation;
  population: number;
  matchedCapacity: number;
  shortfall: number;
  coveragePct: number;
  bestSite: RelocationSite | null;
}
