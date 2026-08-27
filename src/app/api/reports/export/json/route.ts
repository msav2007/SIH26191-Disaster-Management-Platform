import { NextResponse } from 'next/server';

import { generateMachineReadableReportJson } from '@/server/reports/json-export';
import type { ReportType } from '@/server/reports/report-types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get('type') as ReportType) ?? 'executive_summary';
  const habitationId = searchParams.get('habitationId') ?? undefined;
  const district = searchParams.get('district') ?? undefined;

  const result = await generateMachineReadableReportJson(type, habitationId, district);

  if (!result) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Could not generate report for specified parameters.',
      },
      { status: 400 },
    );
  }

  const filename = `sih26191-${type}-${habitationId || district || 'all'}-${Date.now().toString(36)}.json`;

  return new NextResponse(JSON.stringify(result, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
