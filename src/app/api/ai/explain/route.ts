import { NextResponse } from 'next/server';

import { generateGroundedExplanation } from '@/server/ai/ai-service';
import type { AiExplanationMode } from '@/server/ai/ai-types';

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      mode?: AiExplanationMode;
      targetId?: string;
    };

    const mode = body.mode || 'risk_justification';
    const targetId = body.targetId || 'HAB-WY-01';

    const result = await generateGroundedExplanation(mode, targetId);

    if (!result) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Could not generate grounded explanation for target '${targetId}'.`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'AI explanation failed',
      },
      { status: 500 },
    );
  }
}
