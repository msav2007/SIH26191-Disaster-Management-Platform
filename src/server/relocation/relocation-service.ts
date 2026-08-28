import { getHabitationById, getHabitations } from '@/server/repositories/habitations';
import { getRelocationSites } from '@/server/repositories/relocation-sites';
import {
  calculateSiteCapacity,
  type SiteCapacityAssessment,
} from '@/server/capacity/capacity-engine';
import {
  getRegionalCapacityRollup,
  listSiteCapacityAssessments,
} from '@/server/capacity/capacity-service';
import {
  findRelocationCandidates,
  type HabitationRelocationPlan,
} from './matching-engine';

export interface RelocationKpiSummary {
  totalCandidateSites: number;
  totalNominalCapacity: number;
  totalEffectiveCapacity: number;
  totalCurrentOccupancy: number;
  totalAvailableHeadroom: number;
  sitesWithHeadroom: number;
  sitesNearCapacity: number;
  sitesRequiringData: number;
  totalHabitationsRequiringRelocation: number;
  immediateRelocationHabitations: number;
  unabsorbedPopulationShortfall: number;
}

export async function getRelocationPlanForHabitation(
  habitationId: string,
): Promise<HabitationRelocationPlan | null> {
  const habitation = await getHabitationById(habitationId);
  if (!habitation) return null;

  const allSites = await getRelocationSites();
  return findRelocationCandidates(habitation, allSites);
}

export async function listAllRelocationPlans(filter?: {
  district?: string | undefined;
  priority?: string | undefined;
}): Promise<HabitationRelocationPlan[]> {
  const [habitations, allSites] = await Promise.all([
    getHabitations(filter),
    getRelocationSites({ district: filter?.district }),
  ]);

  return habitations.map((h) => findRelocationCandidates(h, allSites));
}

export async function getRelocationKpiSummary(): Promise<RelocationKpiSummary> {
  const [capacityRollup, plans] = await Promise.all([
    getRegionalCapacityRollup(),
    listAllRelocationPlans(),
  ]);

  const immediateRelocationHabitations = plans.filter(
    (p) => p.riskAssessment.priority === 'CRITICAL' || p.riskAssessment.timeline === 'immediate',
  ).length;

  const totalHabitationsRequiringRelocation = plans.filter(
    (p) => p.riskAssessment.priority !== 'LOW',
  ).length;

  const unabsorbedPopulationShortfall = plans.reduce((sum, p) => sum + p.unabsorbedPopulation, 0);

  return {
    totalCandidateSites: capacityRollup.totalSites,
    totalNominalCapacity: capacityRollup.totalNominalCapacity,
    totalEffectiveCapacity: capacityRollup.totalEffectiveCapacity,
    totalCurrentOccupancy: capacityRollup.totalCurrentOccupancy,
    totalAvailableHeadroom: capacityRollup.totalAvailableHeadroom,
    sitesWithHeadroom: capacityRollup.sitesAvailable + capacityRollup.sitesNearCapacity,
    sitesNearCapacity: capacityRollup.sitesNearCapacity,
    sitesRequiringData: capacityRollup.sitesWithMissingData,
    totalHabitationsRequiringRelocation,
    immediateRelocationHabitations,
    unabsorbedPopulationShortfall,
  };
}

export {
  calculateSiteCapacity,
  listSiteCapacityAssessments,
  type SiteCapacityAssessment,
};
