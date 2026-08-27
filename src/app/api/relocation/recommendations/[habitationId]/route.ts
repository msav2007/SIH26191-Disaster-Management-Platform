import { NextResponse } from 'next/server';

import { getRelocationPlanForHabitation } from '@/server/relocation/relocation-service';

export async function GET(
  _request: Request,
  props: { params: Promise<{ habitationId: string }> },
) {
  const params = await props.params;
  const plan = await getRelocationPlanForHabitation(params.habitationId);

  if (!plan) {
    return NextResponse.json(
      {
        status: 'error',
        message: `Habitation with id '${params.habitationId}' was not found.`,
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
