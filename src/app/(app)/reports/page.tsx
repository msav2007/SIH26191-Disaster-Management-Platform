import type { ReportType } from '@/server/reports/report-types';
import { getHabitations } from '@/server/repositories/habitations';
import {
  buildExecutiveAuthoritySummary,
  buildHabitationVulnerabilityDossier,
  buildRelocationJustificationReport,
} from '@/server/reports/report-builder';
import { ReportsWorkspace } from '@/features/reports/components/reports-workspace';

export interface ReportsPageProps {
  searchParams?: Promise<{
    type?: string;
    habitationId?: string;
    district?: string;
  }>;
}

export default async function ReportsPage(props: ReportsPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const reportType: ReportType =
    searchParams.type === 'vulnerability_dossier' || searchParams.type === 'relocation_justification'
      ? searchParams.type
      : 'executive_summary';

  const district = searchParams.district;
  const habitationId = searchParams.habitationId;

  const [executiveSummary, allHabitations] = await Promise.all([
    buildExecutiveAuthoritySummary(district),
    getHabitations({ district }),
  ]);

  const targetHabId = habitationId ?? allHabitations[0]?.id;

  const [preloadedDossier, preloadedJustification] = await Promise.all([
    targetHabId ? buildHabitationVulnerabilityDossier(targetHabId) : null,
    targetHabId ? buildRelocationJustificationReport(targetHabId) : null,
  ]);

  return (
    <div className="space-y-4">
      <ReportsWorkspace
        allHabitations={allHabitations}
        executiveSummary={executiveSummary}
        initialHabitationId={targetHabId}
        initialReportType={reportType}
        preloadedDossier={preloadedDossier}
        preloadedJustification={preloadedJustification}
      />
    </div>
  );
}
