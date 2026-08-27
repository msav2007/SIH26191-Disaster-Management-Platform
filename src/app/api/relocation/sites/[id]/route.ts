import { NextResponse } from 'next/server';

import { getRelocationSiteById } from '@/server/repositories/relocation-sites';
import { calculateSiteCapacity } from '@/server/capacity/capacity-engine';

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const site = await getRelocationSiteById(params.id);

  if (!site) {
    return NextResponse.json(
      {
        status: 'error',
        message: `Relocation site with id '${params.id}' was not found.`,
      },
      { status: 404 },
    );
  }

  const capacity = calculateSiteCapacity(site);

  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    data: {
      site,
      capacity,
    },
  });
}
