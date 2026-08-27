import { NextResponse } from 'next/server';

import { buildRelocationJustificationReport } from '@/server/reports/report-builder';

export async function GET(
  _request: Request,
  props: { params: Promise<{ habitationId: string }> },
) {
  const params = await props.params;
  const report = await buildRelocationJustificationReport(params.habitationId);

  if (!report) {
    return NextResponse.json(
      {
        status: 'error',
        message: `Habitation with id '${params.habitationId}' not found.`,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    data: report,
  });
}
