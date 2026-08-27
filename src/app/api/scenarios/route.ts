import { NextResponse } from 'next/server';

import { listScenarioPresets } from '@/server/scenarios/scenario-service';

export async function GET() {
  const presets = listScenarioPresets();

  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    count: presets.length,
    data: presets,
  });
}
