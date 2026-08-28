import { render, screen } from '@testing-library/react';

import { getCommandCenterData } from '@/server/command-center/command-center-service';
import { CommandCenterWorkspace } from '@/features/command-center/components/command-center-workspace';

describe('Command Center Service & Workspace (Phase 9)', () => {
  it('aggregates authoritative command center data from underlying engines', async () => {
    const data = await getCommandCenterData();

    expect(data.kpis.totalAssessedHabitations).toBe(7);
    expect(data.kpis.criticalHabitationsCount).toBeGreaterThanOrEqual(2);
    expect(data.kpis.totalPopulationAtRisk).toBeGreaterThan(5000);
    expect(data.kpis.totalAvailableRelocationHeadroom).toBeGreaterThan(0);
    expect(data.priorityQueue.length).toBe(7);
    expect(data.priorityQueue[0]!.rank).toBe(1);
    expect(data.actionQueue.length).toBeGreaterThan(0);
    expect(data.provenance).toBe('DEMO DATA');
  });

  it('generates deterministic action queue items with verified evidence references', async () => {
    const data = await getCommandCenterData();

    const relocationMandate = data.actionQueue.find((a) => a.actionType === 'relocation_mandate');
    expect(relocationMandate).toBeDefined();
    expect(relocationMandate?.severity).toBe('critical');
    expect(relocationMandate?.href).toContain('/relocation?habitationId=');

    const bottleneckAlert = data.actionQueue.find((a) => a.actionType === 'bottleneck_relief');
    expect(bottleneckAlert).toBeDefined();
    expect(bottleneckAlert?.description).toContain('constrained by');
  });

  it('renders CommandCenterWorkspace with 5 KPIs, GIS Overview, Scenario Simulator, and Priority Settlements', async () => {
    const data = await getCommandCenterData();

    render(<CommandCenterWorkspace data={data} />);

    expect(screen.getByText(/Multi-Hazard Disaster Relocation Command Center/i)).toBeInTheDocument();
    expect(screen.getByText(/Assessed Settlements/i)).toBeInTheDocument();
    expect(screen.getByText(/Critical Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Immediate Relocation/i)).toBeInTheDocument();
    expect(screen.getByText(/People at Risk/i)).toBeInTheDocument();
    expect(screen.getByText(/Relocation Headroom/i)).toBeInTheDocument();
    expect(screen.getByText(/Geographic Risk Overview/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Top Priority Settlements/i })).toBeInTheDocument();
  });
});
