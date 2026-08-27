import type { RelocationSite } from '@/types/domain';
import { relocationSitesFixture } from '@/server/db/fixtures/disaster-data';

export async function getRelocationSites(filter?: {
  district?: string | undefined;
  suitability?: string | undefined;
  status?: string | undefined;
}): Promise<RelocationSite[]> {
  let list = [...relocationSitesFixture];

  if (filter?.district && filter.district !== 'all') {
    list = list.filter((s) => s.district.toLowerCase() === filter.district?.toLowerCase());
  }

  if (filter?.suitability && filter.suitability !== 'all') {
    list = list.filter((s) => s.suitability === filter.suitability);
  }

  if (filter?.status && filter.status !== 'all') {
    list = list.filter((s) => s.status === filter.status);
  }

  return list;
}

export async function getRelocationSiteById(id: string): Promise<RelocationSite | null> {
  const found = relocationSitesFixture.find((s) => s.id === id);
  return found ?? null;
}
