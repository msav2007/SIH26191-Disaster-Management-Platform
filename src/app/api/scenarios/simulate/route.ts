import { NextResponse } from 'next/server';

import { runScenarioSimulation } from '@/server/scenarios/scenario-service';
import { CalculationValidationError } from '@/server/validation/data-validation';
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
      timestamp: impact.timestamp,
      data: impact,
    });
  } catch (error) {
    console.error('[Simulation API Error]:', error);

    if (error instanceof CalculationValidationError) {
      return NextResponse.json(
        {
          status: 'error',
          errorType: 'VALIDATION_ERROR',
          message: error.message,
          details: error.details,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        status: 'error',
        errorType: 'SIMULATION_EXECUTION_ERROR',
        message: error instanceof Error ? error.message : 'Deterministic simulation failed.',
      },
      { status: 500 },
    );
  }
}
