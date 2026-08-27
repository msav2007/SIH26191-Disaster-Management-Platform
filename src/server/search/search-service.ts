import { getHabitations } from '@/server/repositories/habitations';
import { getRedZones } from '@/server/repositories/red-zones';
import { getRelocationSites } from '@/server/repositories/relocation-sites';
import { criticalInfrastructureFixture } from '@/server/db/fixtures/disaster-data';
import type { SemanticTone } from '@/types/domain';

export type SearchCategory =
  | 'habitation'
  | 'red_zone'
  | 'relocation_site'
  | 'infrastructure'
  | 'district';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: SearchCategory;
  categoryLabel: string;
  district: string;
  state: string;
  href: string;
  badgeTone?: SemanticTone | undefined;
  meta?: Record<string, string | number>;
}

/**
 * Deterministic authority-wide search querying all spatial and domain entities.
 */
export async function searchAuthorityEntities(
  query: string,
  categoryFilter?: SearchCategory,
): Promise<SearchResultItem[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const [habitations, redZones, relocationSites] = await Promise.all([
    getHabitations(),
    getRedZones(),
    getRelocationSites(),
  ]);

  const results: SearchResultItem[] = [];

  // 1. Habitations
  if (!categoryFilter || categoryFilter === 'habitation') {
    for (const h of habitations) {
      if (
        h.id.toLowerCase().includes(q) ||
        h.name.toLowerCase().includes(q) ||
        h.block.toLowerCase().includes(q) ||
        h.district.toLowerCase().includes(q) ||
        h.primaryHazard.toLowerCase().includes(q)
      ) {
        results.push({
          id: h.id,
          title: h.name,
          subtitle: `${h.district}, ${h.state} · ${h.population.toLocaleString('en-IN')} pop · ${h.primaryHazard.replace('_', ' ')}`,
          category: 'habitation',
          categoryLabel: 'Habitation',
          district: h.district,
          state: h.state,
          href: `/habitations?selected=${h.id}`,
          badgeTone: h.priority === 'CRITICAL' ? 'critical' : 'high',
          meta: {
            priority: h.priority,
            population: h.population,
          },
        });
      }
    }
  }

  // 2. Red Zones
  if (!categoryFilter || categoryFilter === 'red_zone') {
    for (const rz of redZones) {
      if (
        rz.id.toLowerCase().includes(q) ||
        rz.name.toLowerCase().includes(q) ||
        rz.district.toLowerCase().includes(q) ||
        rz.primaryHazard.toLowerCase().includes(q)
      ) {
        results.push({
          id: rz.id,
          title: rz.name,
          subtitle: `${rz.district}, ${rz.state} · ${rz.areaSqKm} km² · ${rz.severity} severity`,
          category: 'red_zone',
          categoryLabel: 'Red Zone',
          district: rz.district,
          state: rz.state,
          href: `/map?selected=${rz.id}`,
          badgeTone: 'critical',
          meta: {
            areaSqKm: rz.areaSqKm,
            severity: rz.severity,
          },
        });
      }
    }
  }

  // 3. Relocation Sites
  if (!categoryFilter || categoryFilter === 'relocation_site') {
    for (const s of relocationSites) {
      if (
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.landClass.toLowerCase().includes(q)
      ) {
        results.push({
          id: s.id,
          title: s.name,
          subtitle: `${s.district}, ${s.state} · ${s.areaHectares} ha · ${s.carryingCapacity.toLocaleString('en-IN')} nominal capacity`,
          category: 'relocation_site',
          categoryLabel: 'Relocation Sector',
          district: s.district,
          state: s.state,
          href: `/relocation?selectedSiteId=${s.id}`,
          badgeTone: 'safe',
          meta: {
            nominalCapacity: s.carryingCapacity,
          },
        });
      }
    }
  }

  // 4. Critical Infrastructure
  if (!categoryFilter || categoryFilter === 'infrastructure') {
    for (const inf of criticalInfrastructureFixture) {
      if (
        inf.id.toLowerCase().includes(q) ||
        inf.name.toLowerCase().includes(q) ||
        inf.district.toLowerCase().includes(q) ||
        inf.kind.toLowerCase().includes(q)
      ) {
        results.push({
          id: inf.id,
          title: inf.name,
          subtitle: `${inf.district}, ${inf.state} · ${inf.kind.replace('_', ' ')}`,
          category: 'infrastructure',
          categoryLabel: 'Infrastructure',
          district: inf.district,
          state: inf.state,
          href: `/map?selected=${inf.id}`,
          badgeTone: 'safe',
          meta: {
            kind: inf.kind,
          },
        });
      }
    }
  }

  // 5. Districts
  if (!categoryFilter || categoryFilter === 'district') {
    const districts = Array.from(
      new Set(habitations.map((h) => `${h.district}::${h.state}`)),
    );
    for (const dKey of districts) {
      const [dName, sName] = dKey.split('::');
      if (dName!.toLowerCase().includes(q) || sName!.toLowerCase().includes(q)) {
        const count = habitations.filter((h) => h.district === dName).length;
        results.push({
          id: `DIST-${dName!.toUpperCase()}`,
          title: `${dName} District`,
          subtitle: `${sName} · ${count} assessed habitations`,
          category: 'district',
          categoryLabel: 'District',
          district: dName!,
          state: sName!,
          href: `/habitations?district=${encodeURIComponent(dName!)}`,
          badgeTone: 'neutral',
          meta: {
            habitationsCount: count,
          },
        });
      }
    }
  }

  return results.slice(0, 25);
}
