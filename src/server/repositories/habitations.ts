import type { Habitation } from '@/types/domain';
import { habitationsFixture } from '@/server/db/fixtures/disaster-data';

export async function getHabitations(filter?: {
  district?: string | undefined;
  hazard?: string | undefined;
  priority?: string | undefined;
  timeline?: string | undefined;
}): Promise<Habitation[]> {
  let list = [...habitationsFixture];

  if (filter?.district && filter.district !== 'all') {
    list = list.filter((h) => h.district.toLowerCase() === filter.district?.toLowerCase());
  }

  if (filter?.hazard && filter.hazard !== 'all') {
    list = list.filter((h) => h.primaryHazard === filter.hazard);
  }

  if (filter?.priority && filter.priority !== 'all') {
    list = list.filter((h) => h.priority === filter.priority);
  }

  if (filter?.timeline && filter.timeline !== 'all') {
    list = list.filter((h) => h.timeline === filter.timeline);
  }

  return list;
}

export async function getHabitationById(id: string): Promise<Habitation | null> {
  const found = habitationsFixture.find((h) => h.id === id);
  return found ?? null;
}
