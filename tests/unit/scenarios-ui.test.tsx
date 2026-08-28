import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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

describe('Scenario UI Components (Reliability & Control)', () => {
  it('renders ScenarioControlPanel with preset dropdown, status badge, and sliders', () => {
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
        status="COMPLETED"
      />,
    );

    expect(screen.getByText(/Multi-Hazard Climate Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/DETERMINISTIC ENGINE ACTIVE/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Run Simulation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Baseline/i })).toBeInTheDocument();
    expect(screen.getByText(/Rainfall Multiplier:/i)).toBeInTheDocument();
  });

  it('disables buttons and shows SIMULATING badge when isSimulating is true', () => {
    render(
      <ScenarioControlPanel
        isSimulating={true}
        modifiers={defaultScenarioModifiers}
        onModifierChange={vi.fn()}
        onPresetChange={vi.fn()}
        onResetBaseline={vi.fn()}
        onRunSimulation={vi.fn()}
        presets={scenarioPresets}
        selectedPresetId="monsoon_rainfall_20"
        status="RUNNING"
      />,
    );

    expect(screen.getByText(/^SIMULATING\.\.\.$/i)).toBeInTheDocument();
    const runBtn = screen.getByRole('button', { name: /Simulating Engine\.\.\./i });
    expect(runBtn).toBeDisabled();
    const resetBtn = screen.getByRole('button', { name: /Reset Baseline/i });
    expect(resetBtn).toBeDisabled();
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

  it('renders ScenariosWorkspace and executes simulation on user trigger', async () => {
    const user = userEvent.setup();
    const summary = await runScenarioSimulation('monsoon_rainfall_20');

    // Mock global fetch for API calls
    const mockSimulateResponse = {
      status: 'success',
      data: summary,
    };
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/api/scenarios/simulate')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSimulateResponse),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: null }),
      } as Response);
    });

    render(
      <ScenariosWorkspace
        initialSummary={summary}
        presets={scenarioPresets}
      />,
    );

    expect(screen.getByText(/Multi-Hazard Climate Simulator/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Escalated Settlements/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /View on GIS Workspace/i }).length).toBeGreaterThan(0);

    // Trigger Run Simulation button
    const runBtn = screen.getByRole('button', { name: /Run Simulation/i });
    await user.click(runBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/scenarios/simulate',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  it('handles simulation API error gracefully in ScenariosWorkspace', async () => {
    const user = userEvent.setup();
    const summary = await runScenarioSimulation('monsoon_rainfall_20');

    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/api/scenarios/simulate')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ status: 'error', message: 'Deterministic engine timeout' }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: null }),
      } as Response);
    });

    render(
      <ScenariosWorkspace
        initialSummary={summary}
        presets={scenarioPresets}
      />,
    );

    const runBtn = screen.getByRole('button', { name: /Run Simulation/i });
    await user.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText(/Deterministic engine timeout/i)).toBeInTheDocument();
    });

    // Dismiss error
    const dismissBtn = screen.getByRole('button', { name: /Dismiss/i });
    await user.click(dismissBtn);

    expect(screen.queryByText(/Deterministic engine timeout/i)).not.toBeInTheDocument();
  });
});
