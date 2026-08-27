import { NextResponse } from 'next/server';

import {
  getRegionalCapacityRollup,
  listSiteCapacityAssessments,
} from '@/server/capacity/capacity-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district') ?? undefined;
  const status = searchParams.get('status') ?? undefined;
  const capacityStatus = searchParams.get('capacityStatus') ?? undefined;
  const includeRollup = searchParams.get('rollup') === 'true';

  let sites = await listSiteCapacityAssessments({ district, status });

  if (capacityStatus && capacityStatus !== 'all') {
    sites = sites.filter((s) => s.capacityStatus === capacityStatus);
  }

  if (includeRollup) {
    const rollup = await getRegionalCapacityRollup({ district });
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      rollup,
      count: sites.length,
      data: sites,
    });
  }

  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    count: sites.length,
    data: sites,
  });
}
