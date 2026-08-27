import { NextResponse } from 'next/server';

import { runScenarioSimulation } from '@/server/scenarios/scenario-service';
import type { ScenarioModifiers } from '@/server/scenarios/scenario-types';

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      scenarioId?: string;
      customModifiers?: Partial<ScenarioModifiers>;
      district?: string;
    };

    const scenarioId = body.scenarioId || 'monsoon_rainfall_20';
    const impact = await runScenarioSimulation(
      scenarioId,
      body.customModifiers,
      body.district,
    );

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: impact,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Simulation failed',
      },
      { status: 500 },
    );
  }
}
