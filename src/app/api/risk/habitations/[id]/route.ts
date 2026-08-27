import { NextResponse } from 'next/server';

import { getHabitationRiskAssessment } from '@/server/risk/risk-service';

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const assessment = await getHabitationRiskAssessment(params.id);

  if (!assessment) {
    return NextResponse.json(
      {
        status: 'error',
        message: `Habitation with id '${params.id}' not found.`,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    data: assessment,
  });
}
