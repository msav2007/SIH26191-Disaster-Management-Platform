import { render, screen } from '@testing-library/react';

import {
  defaultScenarioModifiers,
  scenarioPresets,
} from '@/server/scenarios/scenario-config';
import { runScenarioSimulation } from '@/server/scenarios/scenario-service';
import { ScenarioComparisonTable } from '@/features/scenarios/components/scenario-comparison-table';
import { ScenarioControlPanel } from '@/features/scenarios/components/scenario-control-panel';
import { ScenarioExplanationPanel } from '@/features/scenarios/components/scenario-explanation-panel';
import { ScenarioImpactKpiStrip } from '@/features/scenarios/components/scenario-impact-kpi-strip';
import { ScenariosWorkspace } from '@/features/scenarios/components/scenarios-workspace';

describe('Scenario UI Components (Phase 8)', () => {
  it('renders ScenarioControlPanel with preset dropdown and sliders', () => {
    render(
      <ScenarioControlPanel
        isSimulating={false}
        modifiers={defaultScenarioModifiers}
        onModifierChange={vi.fn()}
        onPresetChange={vi.fn()}
        onResetBaseline={vi.fn()}
        onRunSimulation={vi.fn()}
        presets={scenarioPresets}
        selectedPresetId="monsoon_rainfall_20"
      />,
    );

    expect(screen.getByText(/Multi-Hazard Climate Simulator/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Run Simulation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Baseline/i })).toBeInTheDocument();
    expect(screen.getByText(/Rainfall Multiplier:/i)).toBeInTheDocument();
  });

  it('renders ScenarioImpactKpiStrip with simulation delta cards', async () => {
    const summary = await runScenarioSimulation('monsoon_rainfall_20');

    render(<ScenarioImpactKpiStrip summary={summary} />);

    expect(screen.getByText(/Escalated Settlements/i)).toBeInTheDocument();
    expect(screen.getByText(/Critical Tiers/i)).toBeInTheDocument();
    expect(screen.getByText(/Immediate Relocation \(0–6mo\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Elevated Pop. at Risk/i)).toBeInTheDocument();
  });

  it('renders ScenarioComparisonTable and triggers habitation selection', async () => {
    const summary = await runScenarioSimulation('monsoon_rainfall_20');
    const handleSelect = vi.fn();

    render(
      <ScenarioComparisonTable
        onSelectHabitation={handleSelect}
        onToggleShowOnlyChanged={vi.fn()}
        results={summary.changedHabitations}
        selectedHabitationId={summary.changedHabitations[0]!.habitation.id}
        showOnlyChanged={false}
      />,
    );

    expect(screen.getByText(/Baseline vs Scenario Comparison/i)).toBeInTheDocument();
    expect(screen.getByText(summary.changedHabitations[0]!.habitation.name)).toBeInTheDocument();
  });

  it('renders ScenarioExplanationPanel with mathematical proof and facts', async () => {
    const { generateGroundedExplanation } = await import('@/server/ai/ai-service');
    const summary = await runScenarioSimulation('monsoon_rainfall_20');
    const firstResult = summary.changedHabitations[0]!;

    const explanation = await generateGroundedExplanation('scenario_briefing', firstResult.habitation.id, {
      result: firstResult,
      scenarioName: summary.scenario.name,
    });

    render(
      <ScenarioExplanationPanel
        groundedExplanation={explanation}
        isLoadingExplanation={false}
        selectedResult={firstResult}
      />,
    );

    expect(screen.getByText(new RegExp(`Explainable Scenario Impact Analysis: ${firstResult.habitation.name}`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(/Multi-Factor Mathematical Proof/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified Grounded Facts/i)).toBeInTheDocument();
  });

  it('renders ScenariosWorkspace and coordinates simulation interactions', async () => {
    const summary = await runScenarioSimulation('monsoon_rainfall_20');

    render(
      <ScenariosWorkspace
        initialSummary={summary}
        presets={scenarioPresets}
      />,
    );

    expect(screen.getByText(/Multi-Hazard Climate Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/Escalated Settlements/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View on GIS Workspace/i })).toBeInTheDocument();
  });
});
