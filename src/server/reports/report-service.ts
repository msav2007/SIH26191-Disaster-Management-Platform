import {
  buildExecutiveAuthoritySummary,
  buildHabitationVulnerabilityDossier,
  buildRelocationJustificationReport,
} from './report-builder';
import {
  generateHabitationsPrioritizationCsv,
  generateRelocationAllocationsCsv,
} from './csv-export';
import { generateMachineReadableReportJson } from './json-export';
import type { ReportType } from './report-types';

export async function getReportByTypeAndTarget(
  type: ReportType,
  targetHabitationId?: string,
  districtFilter?: string,
) {
  if (type === 'vulnerability_dossier' && targetHabitationId) {
    return buildHabitationVulnerabilityDossier(targetHabitationId);
  }
  if (type === 'relocation_justification' && targetHabitationId) {
    return buildRelocationJustificationReport(targetHabitationId);
  }
  return buildExecutiveAuthoritySummary(districtFilter);
}

export {
  buildExecutiveAuthoritySummary,
  buildHabitationVulnerabilityDossier,
  buildRelocationJustificationReport,
  generateHabitationsPrioritizationCsv,
  generateRelocationAllocationsCsv,
  generateMachineReadableReportJson,
};
