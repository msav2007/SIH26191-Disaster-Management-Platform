import { NextResponse } from 'next/server';

import { generateGroundedExplanation } from '@/server/ai/ai-service';
import { runScenarioSimulation } from '@/server/scenarios/scenario-service';

export async function GET(
  request: Request,
  props: { params: Promise<{ habitationId: string }> },
) {
  const params = await props.params;
  const { searchParams } = new URL(request.url);
  const scenarioId = searchParams.get('scenarioId') || 'monsoon_rainfall_20';

  const impact = await runScenarioSimulation(scenarioId);
  const match = impact.changedHabitations.find(
    (h) => h.habitation.id === params.habitationId,
  ) ?? impact.changedHabitations[0];

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
