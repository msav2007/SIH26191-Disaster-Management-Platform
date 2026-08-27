import { NextResponse } from 'next/server';

import { buildExecutiveAuthoritySummary } from '@/server/reports/report-builder';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district') ?? undefined;

  const report = await buildExecutiveAuthoritySummary(district);

  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    data: report,
  });
}
