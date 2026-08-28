import { NextResponse } from 'next/server';

import {
  habitationsFixture,
  redZonesFixture,
  relocationSitesFixture,
} from '@/server/db/fixtures/disaster-data';
import { defaultRiskModel } from '@/config/risk/default-model';
import {
  validateHabitations,
  validateRedZones,
  validateRelocationSites,
  validateRiskWeights,
} from '@/server/validation/data-validation';

export async function GET() {
  try {
    // 1. Validate fixtures against strict domain schemas
    validateHabitations(habitationsFixture);
    validateRelocationSites(relocationSitesFixture);
    validateRedZones(redZonesFixture);
    validateRiskWeights(defaultRiskModel.factors);

    // 2. Return concise verification metrics
    return NextResponse.json({
      status: 'success',
      data: {
        verified: true,
        summary: 'All authoritative seed fixtures successfully validated against statutory domain schemas.',
        counts: {
          habitations: habitationsFixture.length,
          relocationSites: relocationSitesFixture.length,
          redZones: redZonesFixture.length,
        },
        invariants: {
          riskWeightsSum: 1.0,
          coordinateSystem: 'WGS84 EPSG:4326',
          provenance: 'DEMO DATA',
        },
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Fixture validation failed.';
    return NextResponse.json(
      {
        status: 'error',
        message,
      },
      { status: 400 },
    );
  }
}
