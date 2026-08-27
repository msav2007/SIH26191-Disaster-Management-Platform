import { NextResponse } from 'next/server';

import {
  getRelocationPlanForHabitation,
  listAllRelocationPlans,
} from '@/server/relocation/relocation-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const habitationId = searchParams.get('habitationId');
  const district = searchParams.get('district') ?? undefined;
  const priority = searchParams.get('priority') ?? undefined;

  if (habitationId) {
    const plan = await getRelocationPlanForHabitation(habitationId);
    if (!plan) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Habitation with id '${habitationId}' not found.`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: plan,
    });
  }

  const plans = await listAllRelocationPlans({ district, priority });
  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    count: plans.length,
    data: plans,
  });
}
