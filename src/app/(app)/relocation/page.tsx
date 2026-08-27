import Link from 'next/link';

import { PageHeader } from '@/components/status/page-header';
import { buttonStyles } from '@/components/ui/button';
import { RelocationWorkspace } from '@/features/relocation/components/relocation-workspace';
import { calculateSiteCapacity } from '@/server/capacity/capacity-engine';
import {
  getRelocationKpiSummary,
  listAllRelocationPlans,
} from '@/server/relocation/relocation-service';
import { getRelocationSites } from '@/server/repositories/relocation-sites';

export interface RelocationPageProps {
  searchParams?: Promise<{
    habitationId?: string;
  }>;
}

export default async function RelocationPage(props: RelocationPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const targetHabitationId = searchParams?.habitationId ?? null;

  const [plans, kpis, rawSites] = await Promise.all([
    listAllRelocationPlans(),
    getRelocationKpiSummary(),
    getRelocationSites(),
  ]);

  const siteInventory = rawSites.map((site) => ({
    site,
    capacity: calculateSiteCapacity(site),
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          <>
            <Link className={buttonStyles({ size: 'sm', variant: 'secondary' })} href="/habitations">
              Habitations Queue ({plans.filter((p) => p.habitation.priority === 'CRITICAL').length} critical)
            </Link>
            <Link className={buttonStyles({ size: 'sm', variant: 'primary' })} href="/map">
              Open GIS Map
            </Link>
          </>
        }
        badge="CARRYING CAPACITY & MATCHING"
        description="Multi-criteria relocation site matching: evaluate effective carrying capacity, limiting factors, transit distances, and essential services readiness for vulnerable settlements."
        title="Relocation Capacity & Sector Allocation"
      />

      <RelocationWorkspace
        initialHabitationId={targetHabitationId}
        kpis={kpis}
        plans={plans}
        siteInventory={siteInventory}
      />
    </div>
  );
}
