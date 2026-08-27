import {
  buildExecutiveAuthoritySummary,
  buildHabitationVulnerabilityDossier,
  buildRelocationJustificationReport,
  buildScenarioImpactReport,
} from './report-builder';
import type { ReportType } from './report-types';

export interface StandardJsonReportEnvelope {
  status: 'success';
  schemaVersion: string;
  generatedAt: string;
  reportType: ReportType;
  data: unknown;
}

/**
 * Generates machine-readable structured JSON report export.
 */
export async function generateMachineReadableReportJson(
  reportType: ReportType,
  targetId?: string,
  districtFilter?: string,
): Promise<StandardJsonReportEnvelope | null> {
  let reportData: unknown = null;

  if (reportType === 'vulnerability_dossier') {
    if (!targetId) return null;
    reportData = await buildHabitationVulnerabilityDossier(targetId);
  } else if (reportType === 'relocation_justification') {
    if (!targetId) return null;
    reportData = await buildRelocationJustificationReport(targetId);
  } else if (reportType === 'scenario_impact') {
    reportData = await buildScenarioImpactReport(targetId || 'monsoon_rainfall_20', districtFilter);
  } else {
    reportData = await buildExecutiveAuthoritySummary(districtFilter);
  }

  if (!reportData) return null;

  return {
    status: 'success',
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    reportType,
    data: reportData,
  };
}
