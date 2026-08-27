import type { Habitation, RelocationSite, ServiceRating } from '@/types/domain';
import {
  getActiveCapacityConfig,
  type CapacityConfig,
  type SuitabilityBand,
} from '@/server/capacity/capacity-config';
import type { SiteCapacityAssessment } from '@/server/capacity/capacity-engine';

export interface FactorContribution {
  raw: number;
  weight: number;
  weightedContribution: number;
  label: string;
}

export interface SiteSuitabilityAssessment {
  siteId: string;
  habitationId: string;
  suitabilityScore: number;
  suitabilityBand: SuitabilityBand;
  distanceKm: number;
  capacityHeadroom: number;
  isDisqualified: boolean;
  disqualificationReason?: string;
  hasHeadroomShortfall: boolean;
  shortfallPopulation: number;
  safetyStatus: string;
  warnings: string[];
  strengths: string[];
  factors: {
    safety: FactorContribution;
    capacity: FactorContribution;
    distance: FactorContribution;
    road: FactorContribution;
    water: FactorContribution;
    healthcare: FactorContribution;
    shelter: FactorContribution;
    power: FactorContribution;
    livelihood: FactorContribution;
    schools: FactorContribution;
  };
}

/**
 * Proximity decay curve: scores physical distance between habitation and candidate site.
 */
export function calculateDistanceScore(
  distanceKm: number,
  customConfig?: CapacityConfig,
): number {
  const config = customConfig ?? getActiveCapacityConfig();
  const { extremeKm, farKm, interDistrictMaxKm, moderateKm, nearKm } =
    config.distanceThresholds;

  if (distanceKm <= nearKm) return 100;
  if (distanceKm <= moderateKm) return 85;
  if (distanceKm <= farKm) return 65;
  if (distanceKm <= extremeKm) return 40;
  if (distanceKm <= interDistrictMaxKm) return 20;
  return 0;
}

function rateService(
  rating: ServiceRating | undefined,
  config: CapacityConfig,
): number {
  if (!rating) return 0;
  return config.serviceRatings[rating] ?? 50;
}

/**
 * Calculates multi-criteria suitability of a specific site for a specific vulnerable habitation.
 */
export function evaluateSiteSuitability(
  site: RelocationSite,
  habitation: Habitation,
  distanceKm: number,
  capacity: SiteCapacityAssessment,
  customConfig?: CapacityConfig,
): SiteSuitabilityAssessment {
  const config = customConfig ?? getActiveCapacityConfig();
  const weights = config.suitabilityWeights;
  const warnings: string[] = [];
  const strengths: string[] = [];

  // Hard Safety Rule: Critical hazard exposure strictly disqualifies candidate site
  if (site.hazardExposure === 'critical') {
    return {
      siteId: site.id,
      habitationId: habitation.id,
      suitabilityScore: 0,
      suitabilityBand: 'UNSUITABLE',
      distanceKm,
      capacityHeadroom: capacity.availableHeadroom,
      isDisqualified: true,
      disqualificationReason: 'Disqualified: Site is located within a critical hazard exposure envelope.',
      hasHeadroomShortfall: true,
      shortfallPopulation: habitation.population,
      safetyStatus: 'CRITICAL HAZARD - UNACCEPTABLE',
      warnings: ['Site fails statutory safety threshold due to critical hazard exposure.'],
      strengths: [],
      factors: {
        safety: { raw: 0, weight: weights.safety, weightedContribution: 0, label: 'Hazard Safety' },
        capacity: { raw: 0, weight: weights.capacity, weightedContribution: 0, label: 'Capacity Headroom' },
        distance: { raw: 0, weight: weights.distance, weightedContribution: 0, label: 'Transit Proximity' },
        road: { raw: 0, weight: weights.road, weightedContribution: 0, label: 'All-Weather Road' },
        water: { raw: 0, weight: weights.water, weightedContribution: 0, label: 'Water Supply' },
        healthcare: { raw: 0, weight: weights.healthcare, weightedContribution: 0, label: 'Healthcare Access' },
        shelter: { raw: 0, weight: weights.shelter, weightedContribution: 0, label: 'Emergency Shelters' },
        power: { raw: 0, weight: weights.power, weightedContribution: 0, label: 'Power Grid' },
        livelihood: { raw: 0, weight: weights.livelihood, weightedContribution: 0, label: 'Livelihood Readiness' },
        schools: { raw: 0, weight: weights.schools, weightedContribution: 0, label: 'School Integration' },
      },
    };
  }

  // 1. Safety Score
  const safetyScore =
    site.hazardExposure === 'low'
      ? 100
      : site.hazardExposure === 'moderate'
        ? 65
        : 25;
  if (safetyScore === 100) strengths.push('Outside identified hazard runout zones (Bedrock ridge)');
  if (safetyScore <= 65) warnings.push(`Moderate hazard exposure (${site.hazardExposure})`);

  // 2. Capacity Score (Population Absorption)
  const coverageRatio =
    habitation.population > 0 ? capacity.availableHeadroom / habitation.population : 1.0;
  const capacityScore = Math.min(100, Math.round(coverageRatio * 100));
  const hasHeadroomShortfall = capacity.availableHeadroom < habitation.population;
  const shortfallPopulation = Math.max(0, habitation.population - capacity.availableHeadroom);

  if (!hasHeadroomShortfall) {
    strengths.push(`Full population absorption (${capacity.availableHeadroom.toLocaleString('en-IN')} available headroom)`);
  } else {
    warnings.push(`Capacity deficit: ${shortfallPopulation.toLocaleString('en-IN')} unabsorbed residents`);
  }

  // 3. Distance Score
  const distanceScore = calculateDistanceScore(distanceKm, config);
  if (distanceScore >= 85) strengths.push(`Close proximity transit corridor (${distanceKm} km)`);
  if (distanceScore <= 40) warnings.push(`Extended transit distance: ${distanceKm} km`);

  // 4. Infrastructure & Services Scores
  const roadScore = rateService(site.services.roadAccess, config);
  if (roadScore === 100) strengths.push('Paved all-weather road access');
  if (roadScore < 60) warnings.push('Unpaved or seasonal access road');

  const waterScore = rateService(site.services.water, config);
  if (waterScore === 100) strengths.push('Commissioned potable water supply');
  if (waterScore < 60) warnings.push('Potable water deficit');

  const healthcareScore = rateService(site.services.healthcare, config);
  if (healthcareScore === 100) strengths.push('Primary health centre within 5 km');
  if (healthcareScore < 60) warnings.push('Healthcare access deficit');

  const shelterScore =
    site.shelterCapacity >= habitation.households * 3
      ? 100
      : Math.min(100, Math.round((site.shelterCapacity / (habitation.households || 1)) * 30));

  const powerScore = rateService(site.services.power, config);
  const livelihoodScore = rateService(site.services.livelihood, config);
  const schoolsScore = rateService(site.services.school, config);

  // Compute Weighted Composite Suitability Score
  const factorMap = {
    safety: { raw: safetyScore, weight: weights.safety, label: 'Hazard Safety' },
    capacity: { raw: capacityScore, weight: weights.capacity, label: 'Capacity Headroom' },
    distance: { raw: distanceScore, weight: weights.distance, label: 'Transit Proximity' },
    road: { raw: roadScore, weight: weights.road, label: 'All-Weather Road' },
    water: { raw: waterScore, weight: weights.water, label: 'Water Supply' },
    healthcare: { raw: healthcareScore, weight: weights.healthcare, label: 'Healthcare Access' },
    shelter: { raw: shelterScore, weight: weights.shelter, label: 'Emergency Shelters' },
    power: { raw: powerScore, weight: weights.power, label: 'Power Grid' },
    livelihood: { raw: livelihoodScore, weight: weights.livelihood, label: 'Livelihood Readiness' },
    schools: { raw: schoolsScore, weight: weights.schools, label: 'School Integration' },
  };

  let compositeScore = 0;
  const factors = {} as SiteSuitabilityAssessment['factors'];

  (Object.keys(factorMap) as Array<keyof typeof factorMap>).forEach((key) => {
    const f = factorMap[key];
    const weighted = +(f.raw * f.weight).toFixed(2);
    compositeScore += weighted;
    factors[key] = {
      raw: f.raw,
      weight: f.weight,
      weightedContribution: weighted,
      label: f.label,
    };
  });

  const finalScore = Math.round(compositeScore);

  // Determine Suitability Band
  let suitabilityBand: SuitabilityBand = 'POOR';
  if (finalScore >= config.suitabilityBands.excellent) {
    suitabilityBand = 'EXCELLENT';
  } else if (finalScore >= config.suitabilityBands.good) {
    suitabilityBand = 'GOOD';
  } else if (finalScore >= config.suitabilityBands.conditional) {
    suitabilityBand = 'CONDITIONAL';
  } else if (finalScore >= config.suitabilityBands.poor) {
    suitabilityBand = 'POOR';
  } else {
    suitabilityBand = 'UNSUITABLE';
  }

  const safetyStatus =
    site.hazardExposure === 'low'
      ? 'OPTIMAL SAFETY (LOW HAZARD)'
      : site.hazardExposure === 'moderate'
        ? 'CONDITIONAL SAFETY (MODERATE HAZARD)'
        : 'HIGH HAZARD ENVELOPE';

  return {
    siteId: site.id,
    habitationId: habitation.id,
    suitabilityScore: finalScore,
    suitabilityBand,
    distanceKm,
    capacityHeadroom: capacity.availableHeadroom,
    isDisqualified: false,
    hasHeadroomShortfall,
    shortfallPopulation,
    safetyStatus,
    warnings,
    strengths,
    factors,
  };
}
