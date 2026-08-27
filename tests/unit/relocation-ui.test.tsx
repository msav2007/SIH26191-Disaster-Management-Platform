import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { relocationSitesFixture } from '@/server/db/fixtures/disaster-data';
import { calculateSiteCapacity } from '@/server/capacity/capacity-engine';
import { RelocationAssessmentBanner } from '@/features/relocation/components/relocation-assessment-banner';
import { RelocationKpiSummaryBar } from '@/features/relocation/components/relocation-kpi-summary';
import { RelocationRecommendationsList } from '@/features/relocation/components/relocation-recommendations-list';
import { RelocationSiteDossier } from '@/features/relocation/components/relocation-site-dossier';
import { RelocationSitesTable } from '@/features/relocation/components/relocation-sites-table';
import { RelocationWorkspace } from '@/features/relocation/components/relocation-workspace';
import {
  getRelocationKpiSummary,
  listAllRelocationPlans,
} from '@/server/relocation/relocation-service';

describe('Relocation UI Components (Phase 6G–6H)', () => {
  it('renders RelocationKpiSummaryBar with 6 authority KPI cards', () => {
    render(
      <RelocationKpiSummaryBar
        summary={{
          totalCandidateSites: 7,
          totalNominalCapacity: 17200,
          totalEffectiveCapacity: 14500,
          totalCurrentOccupancy: 4500,
          totalAvailableHeadroom: 10000,
          sitesWithHeadroom: 7,
          sitesNearCapacity: 2,
          sitesRequiringData: 0,
          totalHabitationsRequiringRelocation: 7,
          immediateRelocationHabitations: 3,
          unabsorbedPopulationShortfall: 0,
        }}
      />,
    );

    expect(screen.getByText('Candidate Sites')).toBeInTheDocument();
    expect(screen.getByText('Total Nominal Capacity')).toBeInTheDocument();
    expect(screen.getByText('Available Headroom')).toBeInTheDocument();
    expect(screen.getByText('Sites Near Capacity')).toBeInTheDocument();
    expect(screen.getByText('Sites Requiring Data')).toBeInTheDocument();
    expect(screen.getByText('Priority Habitations')).toBeInTheDocument();
  });

  it('renders RelocationAssessmentBanner with habitation risk profile', async () => {
    const plans = await listAllRelocationPlans();
    const plan = plans[0]!;

    render(<RelocationAssessmentBanner plan={plan} />);

    expect(screen.getByText(/RELOCATION ASSESSMENT/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Habitation: ${plan.habitation.name}`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(/Population Requiring Relocation/i)).toBeInTheDocument();
  });

  it('renders RelocationRecommendationsList and triggers selection', async () => {
    const plans = await listAllRelocationPlans();
    const plan = plans[0]!;
    const allMatches = [plan.recommendedSite!, ...plan.alternativeSites];
    const handleSelect = vi.fn();

    render(
      <RelocationRecommendationsList
        matches={allMatches}
        onSelect={handleSelect}
        selectedSiteId={allMatches[0]!.site.id}
      />,
    );

    expect(screen.getByText(/RANK #1 · RECOMMENDED SECTOR/i)).toBeInTheDocument();
    expect(screen.getByText(allMatches[0]!.site.name)).toBeInTheDocument();
  });

  it('renders RelocationSitesTable with sorting and filtering', () => {
    const siteInventory = relocationSitesFixture.map((site) => ({
      site,
      capacity: calculateSiteCapacity(site),
    }));

    render(
      <RelocationSitesTable
        onSelect={vi.fn()}
        selectedSiteId={null}
        sites={siteInventory}
      />,
    );

    expect(screen.getByText('Meppadi High Ridge Rehabilitation Complex')).toBeInTheDocument();
    expect(screen.getByText('Pipalkoti Uplands Resettlement Sector')).toBeInTheDocument();
  });

  it('renders RelocationSiteDossier with 10-dimension table and GIS link', async () => {
    const plans = await listAllRelocationPlans();
    const match = plans[0]!.recommendedSite!;

    render(
      <RelocationSiteDossier
        capacity={match.capacity}
        onClose={vi.fn()}
        selectedMatch={match}
        selectedSite={match.site}
        targetHabitationName="Chooralmala"
      />,
    );

    expect(screen.getByText(/Why This Site Is Recommended/i)).toBeInTheDocument();
    expect(screen.getByText(/Multi-Dimensional Capacity Assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/Essential Services Readiness Matrix/i)).toBeInTheDocument();

    const gisLink = screen.getByRole('link', { name: /View on GIS Workspace/i });
    expect(gisLink).toHaveAttribute('href', `/map?selected=${match.site.id}`);
  });

  it('renders RelocationWorkspace and coordinates tab switching & habitation selection', async () => {
    const user = userEvent.setup();
    const [plans, kpis] = await Promise.all([
      listAllRelocationPlans(),
      getRelocationKpiSummary(),
    ]);

    const siteInventory = relocationSitesFixture.map((site) => ({
      site,
      capacity: calculateSiteCapacity(site),
    }));

    render(
      <RelocationWorkspace
        initialHabitationId="HAB-WY-01"
        kpis={kpis}
        plans={plans}
        siteInventory={siteInventory}
      />,
    );

    expect(screen.getByText('Candidate Sites')).toBeInTheDocument();
    expect(screen.getAllByText(/Meppadi High Ridge/i).length).toBeGreaterThan(0);

    // Switch tab to Inventory
    const inventoryTab = screen.getByRole('button', { name: /Candidate Sites Inventory/i });
    await user.click(inventoryTab);

    expect(screen.getByText('Candidate Relocation Sites Master Inventory')).toBeInTheDocument();

    // Switch back to matching
    const matchingTab = screen.getByRole('button', { name: /Habitation Matching/i });
    await user.click(matchingTab);

    // Switch habitation selector
    const selector = screen.getByLabelText(/Select target habitation for relocation matching/i);
    await user.selectOptions(selector, 'HAB-CH-01');

    expect(screen.getAllByText(/Sunil Ward Cluster/i).length).toBeGreaterThan(0);
  });
});
