import { NextResponse } from 'next/server';

import { generateGroundedExplanation } from '@/server/ai/ai-service';
import { runScenarioSimulation } from '@/server/scenarios/scenario-service';
import type { ScenarioModifiers } from '@/server/scenarios/scenario-types';

export async function GET(
  request: Request,
  props: { params: Promise<{ habitationId: string }> },
) {
  const params = await props.params;
  const { searchParams } = new URL(request.url);
  const scenarioId = searchParams.get('scenarioId') || 'monsoon_rainfall_20';

  const customModifiers: Partial<ScenarioModifiers> = {};
  if (searchParams.has('rainfallMultiplier')) {
    customModifiers.rainfallMultiplier = parseFloat(searchParams.get('rainfallMultiplier')!);
  }
  if (searchParams.has('cloudburstSurge')) {
    customModifiers.cloudburstSurge = parseFloat(searchParams.get('cloudburstSurge')!);
  }
  if (searchParams.has('slopeSaturationFactor')) {
    customModifiers.slopeSaturationFactor = parseFloat(searchParams.get('slopeSaturationFactor')!);
  }
  if (searchParams.has('floodIntensityMultiplier')) {
    customModifiers.floodIntensityMultiplier = parseFloat(searchParams.get('floodIntensityMultiplier')!);
  }
  if (searchParams.has('infrastructureStrainMultiplier')) {
    customModifiers.infrastructureStrainMultiplier = parseFloat(searchParams.get('infrastructureStrainMultiplier')!);
  }

  const impact = await runScenarioSimulation(
    scenarioId,
    Object.keys(customModifiers).length > 0 ? customModifiers : undefined,
  );

  const match = impact.allHabitations.find(
    (h) => h.habitation.id === params.habitationId,
  );

  if (!match) {
    return NextResponse.json(
      {
        status: 'error',
        message: `Habitation '${params.habitationId}' not found in simulation.`,
      },
      { status: 404 },
    );
  }

  const explanation = await generateGroundedExplanation('scenario_briefing', params.habitationId, {
    result: match,
    scenarioName: impact.scenario.name,
  });

  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    data: explanation,
  });
}

export async function POST(
  request: Request,
  props: { params: Promise<{ habitationId: string }> },
) {
  const params = await props.params;
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

  const match = impact.allHabitations.find(
    (h) => h.habitation.id === params.habitationId,
  );

  if (!match) {
    return NextResponse.json(
      {
        status: 'error',
        message: `Habitation '${params.habitationId}' not found in simulation.`,
      },
      { status: 404 },
    );
  }

  const explanation = await generateGroundedExplanation('scenario_briefing', params.habitationId, {
    result: match,
    scenarioName: impact.scenario.name,
  });

  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    data: explanation,
  });
}
