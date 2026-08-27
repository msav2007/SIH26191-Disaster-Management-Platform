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

  it('renders CommandCenterWorkspace with all 6 operational sections', async () => {
    const data = await getCommandCenterData();

    render(<CommandCenterWorkspace data={data} />);

    expect(screen.getByText(/Multi-Hazard Disaster Relocation Command Center/i)).toBeInTheDocument();
    expect(screen.getByText(/Assessed Habitations/i)).toBeInTheDocument();
    expect(screen.getByText(/Operational Habitation Priority Queue/i)).toBeInTheDocument();
    expect(screen.getByText(/Authority Action Queue/i)).toBeInTheDocument();
    expect(screen.getByText(/Carrying Capacity Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Capacity ≠ Suitability/i)).toBeInTheDocument();
  });
});
