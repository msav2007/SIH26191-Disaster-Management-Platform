import Link from 'next/link';

import { PageHeader } from '@/components/status/page-header';
import { buttonStyles } from '@/components/ui/button';
import { HabitationsWorkspace } from '@/features/habitations/components/habitations-workspace';
import {
  getRegionalRiskRollup,
  listHabitationRiskAssessments,
} from '@/server/risk/risk-service';

export interface HabitationsPageProps {
  searchParams?: Promise<{
    selected?: string;
  }>;
}

export default async function HabitationsPage(props: HabitationsPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const initialSelectedId = searchParams?.selected ?? null;

  const [items, rollup] = await Promise.all([
    listHabitationRiskAssessments(),
    getRegionalRiskRollup(),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          <>
            <Link className={buttonStyles({ size: 'sm', variant: 'secondary' })} href="/map">
              Open GIS Map
            </Link>
            <Link className={buttonStyles({ size: 'sm', variant: 'primary' })} href="/relocation">
              Candidate Relocation Sites
            </Link>
          </>
        }
        badge="PRIORITIZATION QUEUE"
        description="Multi-hazard risk assessment and statutory relocation queue for vulnerable settlements. Evaluated using deterministic multi-criteria scoring."
        title="Vulnerable Habitations Prioritization"
      />

      <HabitationsWorkspace
        initialSelectedId={initialSelectedId}
        items={items}
        rollup={rollup}
      />
    </div>
  );
}
