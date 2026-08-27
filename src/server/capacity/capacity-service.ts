import { getRelocationSiteById, getRelocationSites } from '@/server/repositories/relocation-sites';
import {
  calculateSiteCapacity,
  type SiteCapacityAssessment,
} from './capacity-engine';

export interface RegionalCapacityRollup {
  totalSites: number;
  totalNominalCapacity: number;
  totalEffectiveCapacity: number;
  totalCurrentOccupancy: number;
  totalAvailableHeadroom: number;
  sitesAvailable: number;
  sitesNearCapacity: number;
  sitesFull: number;
  sitesUnsuitable: number;
  sitesWithMissingData: number;
}

export async function getSiteCapacityById(
  siteId: string,
): Promise<SiteCapacityAssessment | null> {
  const site = await getRelocationSiteById(siteId);
  if (!site) return null;
  return calculateSiteCapacity(site);
}

export async function listSiteCapacityAssessments(filter?: {
  district?: string | undefined;
  status?: string | undefined;
}): Promise<SiteCapacityAssessment[]> {
  const sites = await getRelocationSites(filter);
  return sites.map((s) => calculateSiteCapacity(s));
}

export async function getRegionalCapacityRollup(filter?: {
  district?: string | undefined;
}): Promise<RegionalCapacityRollup> {
  const assessments = await listSiteCapacityAssessments(filter);

  return {
    totalSites: assessments.length,
    totalNominalCapacity: assessments.reduce((sum, a) => sum + a.nominalCapacity, 0),
    totalEffectiveCapacity: assessments.reduce((sum, a) => sum + a.effectiveCapacity, 0),
    totalCurrentOccupancy: assessments.reduce((sum, a) => sum + a.currentOccupancy, 0),
    totalAvailableHeadroom: assessments.reduce((sum, a) => sum + a.availableHeadroom, 0),
    sitesAvailable: assessments.filter((a) => a.capacityStatus === 'AVAILABLE').length,
    sitesNearCapacity: assessments.filter((a) => a.capacityStatus === 'NEAR_CAPACITY' || a.capacityStatus === 'LIMITED').length,
    sitesFull: assessments.filter((a) => a.capacityStatus === 'FULL').length,
    sitesUnsuitable: assessments.filter((a) => a.capacityStatus === 'UNSUITABLE').length,
    sitesWithMissingData: assessments.filter((a) => a.missingDataFields.length > 0).length,
  };
}
