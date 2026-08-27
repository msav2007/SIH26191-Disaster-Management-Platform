import { NextResponse } from 'next/server';

import {
  generateHabitationsPrioritizationCsv,
  generateRelocationAllocationsCsv,
  generateScenarioImpactCsv,
} from '@/server/reports/csv-export';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'habitations';
  const district = searchParams.get('district') ?? undefined;
  const priority = searchParams.get('priority') ?? undefined;
  const hazard = searchParams.get('hazard') ?? undefined;
  const scenarioId = searchParams.get('scenarioId') ?? 'monsoon_rainfall_20';

  let csvContent = '';
  let filename = '';

  if (type === 'relocations') {
    csvContent = await generateRelocationAllocationsCsv({ district });
    filename = `sih26191-relocation-allocations-${district || 'all'}-${Date.now().toString(36)}.csv`;
  } else if (type === 'scenario_impact') {
    csvContent = await generateScenarioImpactCsv(scenarioId, district);
    filename = `sih26191-scenario-impact-${scenarioId}-${Date.now().toString(36)}.csv`;
  } else {
    csvContent = await generateHabitationsPrioritizationCsv({ district, priority, hazard });
    filename = `sih26191-habitations-prioritization-${district || 'all'}-${Date.now().toString(36)}.csv`;
  }

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
