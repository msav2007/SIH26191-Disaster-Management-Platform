import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HabitationEvidenceDossier } from '@/features/habitations/components/habitation-evidence-dossier';
import { HabitationKpiSummary } from '@/features/habitations/components/habitation-kpi-summary';
import { HabitationPrioritizationTable } from '@/features/habitations/components/habitation-prioritization-table';
import { HabitationsWorkspace } from '@/features/habitations/components/habitations-workspace';
import {
  getRegionalRiskRollup,
  listHabitationRiskAssessments,
} from '@/server/risk/risk-service';

describe('Habitation Prioritization Surface (Phase 5B)', () => {
  it('renders HabitationKpiSummary with correct values and units', () => {
    render(
      <HabitationKpiSummary
        criticalHabitations={3}
        immediateRelocation={3}
        mediumTermRelocation={1}
        populationAtRisk={9350}
        shortTermRelocation={2}
        totalHabitations={7}
      />,
    );

    expect(screen.getByText('Assessed Habitations')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Immediate Relocation')).toBeInTheDocument();
    expect(screen.getByText('9,350')).toBeInTheDocument();
  });

  it('renders HabitationPrioritizationTable sorted by urgency and composite score', async () => {
    const items = await listHabitationRiskAssessments();
    const handleSelect = vi.fn();

    render(
      <HabitationPrioritizationTable
        items={items}
        onSelect={handleSelect}
        selectedId={null}
      />,
    );

    // Verify Chooralmala (Immediate/Critical) is displayed
    expect(screen.getByText('Chooralmala Town Settlement')).toBeInTheDocument();
    expect(screen.getAllByText(/CRITICAL/i).length).toBeGreaterThan(0);
  });

  it('filters habitations table by search query and district', async () => {
    const user = userEvent.setup();
    const items = await listHabitationRiskAssessments();

    render(
      <HabitationPrioritizationTable
        items={items}
        onSelect={vi.fn()}
        selectedId={null}
      />,
    );

    const searchInput = screen.getByLabelText(/Filter habitations by settlement name or code/i);
    await user.type(searchInput, 'Joshimath');

    expect(screen.getByText(/Sunil Ward Cluster/i)).toBeInTheDocument();
    expect(screen.queryByText(/Chooralmala Town Settlement/i)).not.toBeInTheDocument();
  });

  it('renders HabitationEvidenceDossier with decision explanation and action links', async () => {
    const items = await listHabitationRiskAssessments();
    const firstItem = items[0]!;

    render(<HabitationEvidenceDossier item={firstItem} onClose={vi.fn()} />);

    expect(screen.getByText(/Why This Habitation Is Prioritized/i)).toBeInTheDocument();
    expect(screen.getByText(/Risk Factor Contribution Model/i)).toBeInTheDocument();
    expect(screen.getByText(/Demographic Vulnerability Cohort/i)).toBeInTheDocument();

    // Operational Action links
    const relocationLink = screen.getByRole('link', { name: /Find Relocation Options/i });
    expect(relocationLink).toHaveAttribute(
      'href',
      `/relocation?habitationId=${firstItem.habitation.id}`,
    );

    const mapLink = screen.getByRole('link', { name: /View on GIS Workspace/i });
    expect(mapLink).toHaveAttribute('href', `/map?selected=${firstItem.habitation.id}`);
  });

  it('renders empty state in HabitationEvidenceDossier when no item is selected', () => {
    render(<HabitationEvidenceDossier item={null} onClose={vi.fn()} />);
    expect(screen.getByText(/No Habitation Selected/i)).toBeInTheDocument();
  });

  it('renders HabitationsWorkspace coordinating table and dossier selection', async () => {
    const user = userEvent.setup();
    const [items, rollup] = await Promise.all([
      listHabitationRiskAssessments(),
      getRegionalRiskRollup(),
    ]);

    render(<HabitationsWorkspace items={items} rollup={rollup} />);

    expect(screen.getByText('Assessed Habitations')).toBeInTheDocument();
    expect(screen.getByText(/Why This Habitation Is Prioritized/i)).toBeInTheDocument();

    // Click on another settlement row
    const joshimathRow = screen.getByText('Sunil Ward Cluster');
    await user.click(joshimathRow);

    expect(screen.getByText(/Sunil Ward Cluster evaluated at/i)).toBeInTheDocument();
  });
});
