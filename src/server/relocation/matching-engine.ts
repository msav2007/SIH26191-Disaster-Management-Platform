import type { Habitation, RelocationSite } from '@/types/domain';
import { calculateDistanceKm } from '@/server/gis/spatial-queries';
import {
  calculateSiteCapacity,
  type SiteCapacityAssessment,
} from '@/server/capacity/capacity-engine';
import {
  calculateHabitationRisk,
  type HabitationRiskResult,
} from '@/server/risk/risk-engine';
import {
  evaluateSiteSuitability,
  type SiteSuitabilityAssessment,
} from './suitability-engine';

export interface CandidateSiteMatchResult {
  rank: number;
  isRecommended: boolean;
  site: RelocationSite;
  distanceKm: number;
  capacity: SiteCapacityAssessment;
  suitability: SiteSuitabilityAssessment;
  coveragePct: number;
  shortfall: number;
  evidence: {
    advantages: string[];
    limitingFactors: string[];
    recommendationSummary: string;
  };
}

export interface HabitationRelocationPlan {
  habitation: Habitation;
  riskAssessment: HabitationRiskResult;
  recommendedSite: CandidateSiteMatchResult | null;
  alternativeSites: CandidateSiteMatchResult[];
  unabsorbedPopulation: number;
  overallFeasibility: 'fully_feasible' | 'partial_capacity' | 'no_feasible_site';
  decisionExplanation: {
    headline: string;
    rationaleText: string;
    tradeoffsText: string;
    statutoryMandate: string;
    keyStrengths: string[];
    constraints: string[];
  };
}

/**
 * Matches a vulnerable habitation to candidate relocation sites, evaluating capacity, suitability and statutory priority.
 */
export function findRelocationCandidates(
  habitation: Habitation,
  allSites: RelocationSite[],
): HabitationRelocationPlan {
  const riskAssessment = calculateHabitationRisk(habitation);

  // Evaluate and score all candidate sites
  const evaluatedCandidates: CandidateSiteMatchResult[] = allSites
    .map((site) => {
      const distanceKm = calculateDistanceKm(habitation.coordinates, site.coordinates);
      const capacity = calculateSiteCapacity(site);
      const suitability = evaluateSiteSuitability(site, habitation, distanceKm, capacity);

      const coveragePct =
        habitation.population > 0
          ? Math.min(100, Math.round((capacity.availableHeadroom / habitation.population) * 100))
          : 100;
      const shortfall = Math.max(0, habitation.population - capacity.availableHeadroom);

      const advantages = [...suitability.strengths];
      const limitingFactors = [
        `Constrained by ${capacity.limitingFactorLabel}`,
        ...suitability.warnings,
      ];

      const recommendationSummary =
        coveragePct >= 100
          ? `Primary recommended relocation sector: full population absorption (${capacity.availableHeadroom.toLocaleString('en-IN')} headroom) at ${distanceKm} km.`
          : `Alternative candidate sector: ${coveragePct}% absorption capacity, constrained by ${capacity.limitingFactorLabel}.`;

      return {
        rank: 0,
        isRecommended: false,
        site,
        distanceKm,
        capacity,
        suitability,
        coveragePct,
        shortfall,
        evidence: {
          advantages,
          limitingFactors,
          recommendationSummary,
        },
      };
    })
    .sort((a, b) => {
      // 1. Non-disqualified first
      if (a.suitability.isDisqualified !== b.suitability.isDisqualified) {
        return a.suitability.isDisqualified ? 1 : -1;
      }

      // 2. Explicit candidate mapping priority
      const aExplicit = habitation.candidateSiteIds.includes(a.site.id);
      const bExplicit = habitation.candidateSiteIds.includes(b.site.id);
      if (aExplicit !== bExplicit) return aExplicit ? -1 : 1;

      // 3. Composite suitability score descending
      return b.suitability.suitabilityScore - a.suitability.suitabilityScore;
    });

  // Assign Ranks
  evaluatedCandidates.forEach((m, idx) => {
    m.rank = idx + 1;
    m.isRecommended = idx === 0 && !m.suitability.isDisqualified;
  });

  const recommendedSite = evaluatedCandidates.find((m) => m.isRecommended) ?? null;
  const alternativeSites = evaluatedCandidates.filter((m) => m !== recommendedSite);

  const unabsorbedPopulation = recommendedSite ? recommendedSite.shortfall : habitation.population;

  const overallFeasibility =
    recommendedSite && unabsorbedPopulation === 0
      ? 'fully_feasible'
      : recommendedSite && unabsorbedPopulation > 0
        ? 'partial_capacity'
        : 'no_feasible_site';

  // Generate Decision Narrative
  let headline = '';
  let rationaleText = '';
  let tradeoffsText = '';
  const keyStrengths: string[] = [];
  const constraints: string[] = [];

  if (recommendedSite) {
    headline = `Recommended Relocation Sector: ${recommendedSite.site.name} for ${habitation.name} (Suitability: ${recommendedSite.suitability.suitabilityScore}/100 - ${recommendedSite.suitability.suitabilityBand}).`;
    rationaleText = `Rank #1 site provides ${recommendedSite.capacity.availableHeadroom.toLocaleString('en-IN')} available headroom at a transit distance of ${recommendedSite.distanceKm} km. Evaluated on ${recommendedSite.site.landClass.replace('_', ' ')} land with '${recommendedSite.site.hazardExposure}' hazard exposure.`;

    keyStrengths.push(...recommendedSite.suitability.strengths);
    constraints.push(...recommendedSite.suitability.warnings);

    if (alternativeSites.length > 0) {
      const alt1 = alternativeSites[0]!;
      tradeoffsText = `Alternative candidate ${alt1.site.name} ranked #2 (Score: ${alt1.suitability.suitabilityScore}/100) but is constrained by ${alt1.capacity.limitingFactorLabel} and distance of ${alt1.distanceKm} km.`;
    } else {
      tradeoffsText = 'No secondary candidate sites identified within the administrative planning perimeter.';
    }
  } else {
    headline = `No Feasible Candidate Relocation Site Identified for ${habitation.name}.`;
    rationaleText = 'All evaluated candidate sites fail either statutory hazard safety thresholds or have zero available capacity.';
    tradeoffsText = 'State Disaster Management Authority must identify new government revenue parcels outside high-hazard buffer zones.';
    constraints.push('Critical deficit of safe relocation land parcels.');
  }

  const statutoryMandate =
    habitation.priority === 'CRITICAL'
      ? 'Immediate statutory resettlement order under the Disaster Management Act (Section 30) is recommended.'
      : 'Phased relocation and land development scheduled under State Disaster Mitigation Plan.';

  return {
    habitation,
    riskAssessment,
    recommendedSite,
    alternativeSites,
    unabsorbedPopulation,
    overallFeasibility,
    decisionExplanation: {
      headline,
      rationaleText,
      tradeoffsText,
      statutoryMandate,
      keyStrengths,
      constraints,
    },
  };
}

// Alias for backward compatibility
export const matchHabitationToSites = findRelocationCandidates;
