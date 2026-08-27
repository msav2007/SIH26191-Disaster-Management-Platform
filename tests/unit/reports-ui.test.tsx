import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { habitationsFixture } from '@/server/db/fixtures/disaster-data';
import {
  buildExecutiveAuthoritySummary,
  buildHabitationVulnerabilityDossier,
  buildRelocationJustificationReport,
} from '@/server/reports/report-builder';
import { ExecutiveSummaryReportView } from '@/features/reports/components/executive-summary-report-view';
import { GisCoordinateAppendixView } from '@/features/reports/components/gis-coordinate-appendix-view';
import { HabitationDossierReportView } from '@/features/reports/components/habitation-dossier-report-view';
import { RelocationJustificationReportView } from '@/features/reports/components/relocation-justification-report-view';
import { ReportProvenanceBanner } from '@/features/reports/components/report-provenance-banner';
import { ReportsWorkspace } from '@/features/reports/components/reports-workspace';

describe('Reports UI Components (Phase 7)', () => {
  it('renders ReportProvenanceBanner with explicit disclaimer', () => {
    render(
      <ReportProvenanceBanner
        metadata={{
          reportId: 'RPT-TEST-001',
          title: 'Test Authority Report',
          reportType: 'executive_summary',
          generatedAt: '2026-08-27T05:00:00Z',
          authorityJurisdiction: 'State Disaster Management Authority (SDMA)',
          modelVersion: 'V2.0',
          provenance: 'DEMO DATA',
          disclaimer: 'DEMO / SEEDED DATA — NOT AN OFFICIAL GOVERNMENT RECORD.',
        }}
      />,
    );

    expect(screen.getByText('RPT-TEST-001')).toBeInTheDocument();
    expect(screen.getByText(/DEMO \/ SEEDED DATA — NOT AN OFFICIAL GOVERNMENT RECORD/i)).toBeInTheDocument();
    expect(screen.getByText('DEMO DATA')).toBeInTheDocument();
  });

  it('renders GisCoordinateAppendixView with spatial coordinate table', async () => {
    const dossier = await buildHabitationVulnerabilityDossier('HAB-WY-01');
    expect(dossier).not.toBeNull();

    render(<GisCoordinateAppendixView appendix={dossier!.gisAppendix} />);

    expect(screen.getByText(/Appendix A: Spatial Coordinates/i)).toBeInTheDocument();
    expect(screen.getByText(/EPSG:4326/i)).toBeInTheDocument();
    expect(screen.getByText('SUBJECT-COORDS')).toBeInTheDocument();
  });

  it('renders ExecutiveSummaryReportView with key metrics', async () => {
    const summary = await buildExecutiveAuthoritySummary();

    render(<ExecutiveSummaryReportView report={summary} />);

    expect(screen.getByText(summary.metadata.title)).toBeInTheDocument();
    expect(screen.getByText('Assessed Habitations')).toBeInTheDocument();
    expect(screen.getByText(/Net Relocation Headroom/i)).toBeInTheDocument();
    expect(screen.getByText(/District-Level Vulnerability Matrix/i)).toBeInTheDocument();
  });

  it('renders HabitationDossierReportView for Chooralmala', async () => {
    const dossier = await buildHabitationVulnerabilityDossier('HAB-WY-01');
    expect(dossier).not.toBeNull();

    render(<HabitationDossierReportView dossier={dossier!} />);

    expect(screen.getByText('Chooralmala Town Settlement')).toBeInTheDocument();
    expect(screen.getByText(/Statutory Decision Justification/i)).toBeInTheDocument();
    expect(screen.getByText(/Multi-Factor Mathematical Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Demographic Vulnerability Breakdown/i)).toBeInTheDocument();
  });

  it('renders RelocationJustificationReportView for Chooralmala', async () => {
    const report = await buildRelocationJustificationReport('HAB-WY-01');
    expect(report).not.toBeNull();

    render(<RelocationJustificationReportView report={report!} />);

    expect(screen.getByText(/Draft Statutory Relocation Justification/i)).toBeInTheDocument();
    expect(screen.getByText(/Disaster Management Act/i)).toBeInTheDocument();
    expect(screen.getAllByText('Meppadi High Ridge Rehabilitation Complex').length).toBeGreaterThan(0);
    expect(screen.getByText(/Multi-Dimensional Carrying Capacity Assessment/i)).toBeInTheDocument();
  });

  it('renders ReportsWorkspace and coordinates report type switching', async () => {
    const user = userEvent.setup();
    const [summary, dossier, justification] = await Promise.all([
      buildExecutiveAuthoritySummary(),
      buildHabitationVulnerabilityDossier('HAB-WY-01'),
      buildRelocationJustificationReport('HAB-WY-01'),
    ]);

    render(
      <ReportsWorkspace
        allHabitations={habitationsFixture}
        executiveSummary={summary}
        initialHabitationId="HAB-WY-01"
        initialReportType="executive_summary"
        preloadedDossier={dossier}
        preloadedJustification={justification}
      />,
    );

    expect(screen.getByText('Print Report (A4)')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Export JSON')).toBeInTheDocument();

    // Switch to Vulnerability Dossier
    const dossierBtn = screen.getByRole('button', { name: /Vulnerability Dossier/i });
    await user.click(dossierBtn);

    expect(screen.getAllByText(/Chooralmala Town Settlement/i).length).toBeGreaterThan(0);

    // Switch to Relocation Justification
    const justBtn = screen.getByRole('button', { name: /Relocation Justification/i });
    await user.click(justBtn);

    expect(screen.getAllByText(/Meppadi High Ridge Rehabilitation Complex/i).length).toBeGreaterThan(0);
  });
});
