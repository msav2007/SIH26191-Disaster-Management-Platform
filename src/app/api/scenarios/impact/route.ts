import { NextResponse } from 'next/server';

import { runScenarioSimulation } from '@/server/scenarios/scenario-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scenarioId = searchParams.get('scenarioId') || 'monsoon_rainfall_20';
  const district = searchParams.get('district') || undefined;

  const impact = await runScenarioSimulation(scenarioId, undefined, district);

  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    data: impact,
  });
}
