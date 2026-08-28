import { NextResponse } from 'next/server';

import {
  PLATFORM_INFO,
  criticalInfrastructureFixture,
  disasterEventsFixture,
  districtSummariesFixture,
  habitationsFixture,
  redZonesFixture,
  relocationSitesFixture,
} from '@/server/db/fixtures/disaster-data';
import { defaultRiskModel } from '@/config/risk/default-model';

export async function GET() {
  const exportedAt = new Date().toISOString();
  const filename = `sih26191-master-db-backup-${new Date().toISOString().split('T')[0]}.json`;

  const backupPayload = {
    metadata: {
      format: 'SIH26191_MASTER_DB_BACKUP',
      schemaVersion: '1.0.0',
      system: PLATFORM_INFO.name,
      agency: PLATFORM_INFO.agency,
      version: PLATFORM_INFO.version,
      exportedAt,
      provenance: PLATFORM_INFO.provenance,
      recordCounts: {
        habitations: habitationsFixture.length,
        relocationSites: relocationSitesFixture.length,
        redZones: redZonesFixture.length,
        districts: districtSummariesFixture.length,
        criticalInfrastructure: criticalInfrastructureFixture.length,
      },
    },
    systemConfiguration: {
      riskModel: defaultRiskModel,
    },
    registries: {
      habitations: habitationsFixture,
      relocationSites: relocationSitesFixture,
      redZones: redZonesFixture,
      districts: districtSummariesFixture,
      criticalInfrastructure: criticalInfrastructureFixture,
      disasterEvents: disasterEventsFixture,
    },
  };

  return new NextResponse(JSON.stringify(backupPayload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
