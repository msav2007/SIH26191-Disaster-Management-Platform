import type { RedZone } from '@/types/domain';
import { redZonesFixture } from '@/server/db/fixtures/disaster-data';

export async function getRedZones(filter?: {
  district?: string | undefined;
  severity?: string | undefined;
  hazard?: string | undefined;
}): Promise<RedZone[]> {
  let list = [...redZonesFixture];

  if (filter?.district && filter.district !== 'all') {
    list = list.filter((z) => z.district.toLowerCase() === filter.district?.toLowerCase());
  }

  if (filter?.severity && filter.severity !== 'all') {
    list = list.filter((z) => z.severity === filter.severity);
  }

  if (filter?.hazard && filter.hazard !== 'all') {
    list = list.filter(
      (z) => z.primaryHazard === filter.hazard || z.secondaryHazards.includes(filter.hazard as never),
    );
  }

  return list;
}

export async function getRedZoneById(id: string): Promise<RedZone | null> {
  const found = redZonesFixture.find((z) => z.id === id);
  return found ?? null;
}
