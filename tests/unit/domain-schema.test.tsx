import { render, screen } from '@testing-library/react';

import { StatusPill } from '@/components/ui/status-pill';
import { MetricBar } from '@/components/ui/metric-bar';
import { KpiCard } from '@/components/ui/kpi-card';
import { ProvenanceTag } from '@/components/ui/provenance-tag';
import { Panel } from '@/components/ui/panel';
import { getHabitations, getHabitationById } from '@/server/repositories/habitations';
import { getRedZones } from '@/server/repositories/red-zones';
import { getRelocationSites } from '@/server/repositories/relocation-sites';
import { getPlatformSummary } from '@/server/repositories/decision-summary';

describe('Domain Repositories & Fixtures', () => {
  it('loads habitations fixture and filters by district', async () => {
    const all = await getHabitations();
    expect(all.length).toBeGreaterThan(0);

    const wayanad = await getHabitations({ district: 'Wayanad' });
    expect(wayanad.length).toBeGreaterThan(0);
    expect(wayanad.every((h) => h.district === 'Wayanad')).toBe(true);

    const single = await getHabitationById('HAB-WY-01');
    expect(single).not.toBeNull();
    expect(single?.name).toContain('Chooralmala');
  });

  it('loads red zones and filters by severity', async () => {
    const criticalZones = await getRedZones({ severity: 'critical' });
    expect(criticalZones.length).toBeGreaterThan(0);
    expect(criticalZones.every((z) => z.severity === 'critical')).toBe(true);
  });

  it('calculates aggregate platform decision summaries accurately', async () => {
    const summary = await getPlatformSummary();
    expect(summary.habitations.total).toBeGreaterThan(0);
    expect(summary.habitations.populationAtRisk).toBeGreaterThan(0);
    expect(summary.relocationSites.carryingCapacity).toBeGreaterThan(0);
    expect(summary.relocationSites.availableCapacity).toBeLessThanOrEqual(
      summary.relocationSites.carryingCapacity,
    );
  });

  it('retrieves candidate relocation sites with valid carrying capacity', async () => {
    const sites = await getRelocationSites();
    expect(sites.length).toBeGreaterThan(0);
    expect(sites.every((s) => s.carryingCapacity > 0)).toBe(true);
  });
});

describe('Authority UI Primitives', () => {
  it('renders StatusPill with semantic tone and label', () => {
    render(<StatusPill tone="critical">CRITICAL RISK</StatusPill>);
    expect(screen.getByText('CRITICAL RISK')).toBeInTheDocument();
  });

  it('renders MetricBar with progress percentage', () => {
    render(<MetricBar label="Hazard Intensity" max={100} showValue value={85} />);
    expect(screen.getByText('Hazard Intensity')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('renders KpiCard with metric label, value and unit', () => {
    render(
      <KpiCard
        context="Immediate action window"
        label="Critical Habitations"
        status="Urgent"
        tone="critical"
        unit="settlements"
        value="4"
      />,
    );
    expect(screen.getByText('Critical Habitations')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('settlements')).toBeInTheDocument();
    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('renders ProvenanceTag with DEMO DATA indicator', () => {
    render(<ProvenanceTag value="DEMO DATA" />);
    expect(screen.getByText('DEMO DATA')).toBeInTheDocument();
  });

  it('renders Panel with title, description and provenance', () => {
    render(
      <Panel description="Top prioritized list" provenance="DEMO DATA" title="Habitations Queue">
        <div>Content Body</div>
      </Panel>,
    );
    expect(screen.getByText('Habitations Queue')).toBeInTheDocument();
    expect(screen.getByText('Top prioritized list')).toBeInTheDocument();
    expect(screen.getByText('Content Body')).toBeInTheDocument();
  });
});
