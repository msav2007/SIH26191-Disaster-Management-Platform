import { NextResponse } from 'next/server';

import { findScenarioPreset } from '@/server/scenarios/scenario-service';

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const preset = findScenarioPreset(params.id);

  if (!preset) {
    return NextResponse.json(
      {
        status: 'error',
        message: `Scenario preset with id '${params.id}' not found.`,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    data: preset,
  });
}
