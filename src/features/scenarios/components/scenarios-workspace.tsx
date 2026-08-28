'use client';

import { useState } from 'react';
import Link from 'next/link';

import type {
  HabitationScenarioResult,
  ScenarioImpactSummary,
  ScenarioModifiers,
  ScenarioPreset,
  SimulationStatus,
} from '@/server/scenarios/scenario-types';
import { BASELINE_SCENARIO_MODIFIERS } from '@/server/scenarios/scenario-config';
import type { GroundedExplanationResult } from '@/server/ai/ai-types';
import { buttonStyles } from '@/components/ui/button';
import { MapPinIcon } from '@/components/ui/icons';
import { ProvenanceTag } from '@/components/ui/provenance-tag';
import { ScenarioComparisonTable } from './scenario-comparison-table';
import { ScenarioControlPanel } from './scenario-control-panel';
import { ScenarioExplanationPanel } from './scenario-explanation-panel';
import { ScenarioImpactKpiStrip } from './scenario-impact-kpi-strip';

export interface ScenariosWorkspaceProps {
  initialSummary: ScenarioImpactSummary;
  presets: ScenarioPreset[];
}

export function ScenariosWorkspace({
  initialSummary,
  presets,
}: ScenariosWorkspaceProps) {
  const [summary, setSummary] = useState<ScenarioImpactSummary>(initialSummary);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialSummary.scenario.id);
  const [modifiers, setModifiers] = useState<ScenarioModifiers>(initialSummary.modifiersApplied);
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>('COMPLETED');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [showOnlyChanged, setShowOnlyChanged] = useState<boolean>(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  const [selectedHabitationId, setSelectedHabitationId] = useState<string>(() => {
    return (
      initialSummary.changedHabitations[0]?.habitation.id ??
      initialSummary.allHabitations?.[0]?.habitation.id ??
      ''
    );
  });

  const [groundedExplanation, setGroundedExplanation] = useState<GroundedExplanationResult | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState<boolean>(false);

  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = presets.find((p) => p.id === presetId) ?? presets[0]!;
    setModifiers(preset.modifiers);
  };

  const handleModifierChange = (key: keyof ScenarioModifiers, value: number) => {
    setModifiers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const executeSimulation = async (
    targetPresetId: string,
    targetModifiers: ScenarioModifiers,
  ) => {
    if (isSimulating) return; // Prevent duplicate concurrent submissions

    setIsSimulating(true);
    setSimulationStatus('RUNNING');
    setSimulationError(null);

    try {
      const res = await fetch('/api/scenarios/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: targetPresetId,
          customModifiers: targetModifiers,
        }),
      });

      const data = await res.json();

      if (data.status === 'success' && data.data) {
        // Atomic update of the entire simulation result
        const completeResult: ScenarioImpactSummary = data.data;
        setSummary(completeResult);
        setSimulationStatus('COMPLETED');

        const list =
          completeResult.allHabitations && completeResult.allHabitations.length > 0
            ? completeResult.allHabitations
            : completeResult.changedHabitations;

        // Preserve previous selected habitation if it exists in new result, otherwise pick first
        let nextSelectedId = selectedHabitationId;
        const exists = list.some((r) => r.habitation.id === selectedHabitationId);
        if (!exists && list.length > 0) {
          nextSelectedId = list[0]!.habitation.id;
          setSelectedHabitationId(nextSelectedId);
        }

        if (nextSelectedId) {
          fetchExplanation(nextSelectedId, completeResult, targetModifiers);
        }
      } else {
        const errorMsg = data.message || 'Simulation engine returned an execution error.';
        console.error('[Simulation Execution Error]:', data);
        setSimulationError(errorMsg);
        setSimulationStatus('FAILED');
      }
    } catch (e) {
      console.error('[Simulation Network / Server Failure]:', e);
      setSimulationError('Unable to connect to the deterministic simulation engine.');
      setSimulationStatus('FAILED');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRunSimulation = () => {
    executeSimulation(selectedPresetId, modifiers);
  };

  const handleResetBaseline = () => {
    const baselinePreset = presets.find((p) => p.id === 'baseline_state') ?? presets[0]!;
    setSelectedPresetId(baselinePreset.id);
    setModifiers(BASELINE_SCENARIO_MODIFIERS);
    executeSimulation(baselinePreset.id, BASELINE_SCENARIO_MODIFIERS);
  };

  const fetchExplanation = async (
    habId: string,
    currentSummary: ScenarioImpactSummary = summary,
    currentModifiers: ScenarioModifiers = modifiers,
  ) => {
    setIsLoadingExplanation(true);
    try {
      const res = await fetch(`/api/scenarios/explanation/${habId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: currentSummary.scenario.id,
          customModifiers: currentModifiers,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setGroundedExplanation(data.data);
      }
    } catch (e) {
      console.error('[Explanation Fetch Error]:', e);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleSelectHabitation = (habId: string) => {
    setSelectedHabitationId(habId);
    fetchExplanation(habId, summary, modifiers);
  };

  const displayedList =
    summary.allHabitations && summary.allHabitations.length > 0
      ? summary.allHabitations
      : summary.changedHabitations;

  const selectedResult: HabitationScenarioResult | null =
    displayedList.find((r) => r.habitation.id === selectedHabitationId) ??
    displayedList[0] ??
    null;

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
              State Disaster Management Authority
            </span>
            <span className="rounded bg-cyan-50 px-1.5 py-0.5 text-[10px] font-bold text-cyan-800 ring-1 ring-cyan-600/20">
              CLIMATE STRESS MODEL
            </span>
          </div>
          <h1 className="mt-1 text-lg font-bold text-slate-900">
            Multi-Hazard Climate Scenario Simulator
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Simulate extreme precipitation and geotechnical stress events to project escalated risk levels, population impact, and relocation demand.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <ProvenanceTag value="DEMO DATA" />
          <Link className={buttonStyles({ size: 'sm', variant: 'secondary' })} href="/map">
            <MapPinIcon className="size-3.5" />
            View on GIS Workspace
          </Link>
        </div>
      </div>

      {simulationError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 shadow-xs">
          <div>
            <strong className="font-bold">Simulation Engine Error:</strong> {simulationError}
          </div>
          <button
            className="rounded-lg border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 shadow-2xs"
            onClick={() => setSimulationError(null)}
            type="button"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Top Controls */}
      <ScenarioControlPanel
        isSimulating={isSimulating}
        modifiers={modifiers}
        onModifierChange={handleModifierChange}
        onPresetChange={handlePresetChange}
        onResetBaseline={handleResetBaseline}
        onRunSimulation={handleRunSimulation}
        presets={presets}
        selectedPresetId={selectedPresetId}
        status={simulationStatus}
      />

      {/* 3. Impact KPI Summary */}
      <ScenarioImpactKpiStrip summary={summary} />

      {/* 4. Action Strip: Active Simulation Details & GIS Map Link */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-xs">
        <span className="text-slate-600">
          Simulation active: <strong className="text-slate-900">{summary.scenario.name}</strong> ({summary.totalHabitationsEscalated} habitations escalated)
        </span>
        <div className="flex items-center gap-2">
          {selectedResult && (
            <Link
              className={buttonStyles({ size: 'sm', variant: 'secondary' })}
              href={`/map?selected=${selectedResult.habitation.id}`}
            >
              <MapPinIcon className="size-3.5" />
              View on GIS Workspace
            </Link>
          )}
        </div>
      </div>

      {/* 5. Main Workspace Grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left 2 Cols: Settlement Comparison Matrix */}
        <div className="space-y-4 lg:col-span-2">
          <ScenarioComparisonTable
            onSelectHabitation={handleSelectHabitation}
            onToggleShowOnlyChanged={(val) => setShowOnlyChanged(val)}
            results={displayedList}
            selectedHabitationId={selectedHabitationId}
            showOnlyChanged={showOnlyChanged}
          />
        </div>

        {/* Right 1 Col: Grounded AI Explanation & Fact Provenance Panel */}
        <div className="space-y-4">
          <ScenarioExplanationPanel
            groundedExplanation={groundedExplanation}
            isLoadingExplanation={isLoadingExplanation}
            selectedResult={selectedResult}
          />
        </div>
      </div>
    </div>
  );
}
