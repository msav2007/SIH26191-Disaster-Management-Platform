import Link from 'next/link';

import { PageHeader } from '@/components/status/page-header';
import { buttonStyles } from '@/components/ui/button';
import { OperationalGisMap } from '@/features/gis/components/operational-gis-map';
import { getPlatformSummary } from '@/server/repositories/decision-summary';

export default async function MapPage() {
  const summary = await getPlatformSummary();

  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          <>
            <Link className={buttonStyles({ size: 'sm', variant: 'secondary' })} href="/habitations">
              Habitations Queue ({summary.habitations.critical} critical)
            </Link>
            <Link className={buttonStyles({ size: 'sm', variant: 'primary' })} href="/relocation">
              Relocation Capacity ({summary.relocationSites.availableCapacity.toLocaleString('en-IN')} available)
            </Link>
          </>
        }
        badge="OPERATIONAL GIS"
        description="Spatial multi-hazard intelligence: inspect notified Red Zones, settlement vulnerability profiles, candidate relocation sites, and emergency infrastructure."
        title="GIS Risk & Relocation Workspace"
      />

      <OperationalGisMap className="w-full" />
    </div>
  );
}
