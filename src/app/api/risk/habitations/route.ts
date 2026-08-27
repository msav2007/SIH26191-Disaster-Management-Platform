import { NextResponse } from 'next/server';

import { listHabitationRiskAssessments } from '@/server/risk/risk-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district') ?? undefined;
  const hazard = searchParams.get('hazard') ?? undefined;
  const priority = searchParams.get('priority') ?? undefined;
  const timeline = searchParams.get('timeline') ?? undefined;

  const results = await listHabitationRiskAssessments({
    district,
    hazard,
    priority,
    timeline,
  });

  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    count: results.length,
    data: results,
  });
}
