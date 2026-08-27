'use client';

import { useState } from 'react';
import Link from 'next/link';

import type {
  HabitationScenarioResult,
  ScenarioImpactSummary,
  ScenarioModifiers,
  ScenarioPreset,
} from '@/server/scenarios/scenario-types';
import type { GroundedExplanationResult } from '@/server/ai/ai-types';
import { buttonStyles } from '@/components/ui/button';
import { MapPinIcon } from '@/components/ui/icons';
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
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [showOnlyChanged, setShowOnlyChanged] = useState<boolean>(false);

  const [selectedHabitationId, setSelectedHabitationId] = useState<string>(() => {
    return initialSummary.changedHabitations[0]?.habitation.id ?? '';
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

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/scenarios/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedPresetId,
          customModifiers: modifiers,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSummary(data.data);
        if (data.data.changedHabitations.length > 0) {
          const firstId = data.data.changedHabitations[0].habitation.id;
          setSelectedHabitationId(firstId);
          fetchExplanation(firstId, data.data);
        }
      }
    } catch (e) {
      console.error('Simulation failed:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetBaseline = () => {
    handlePresetChange(presets[0]!.id);
    handleRunSimulation();
  };

  const fetchExplanation = async (habId: string, currentSummary: ScenarioImpactSummary = summary) => {
    setIsLoadingExplanation(true);
    try {
      const res = await fetch(`/api/scenarios/explanation/${habId}?scenarioId=${currentSummary.scenario.id}`);
      const data = await res.json();
      if (data.status === 'success') {
        setGroundedExplanation(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch explanation:', e);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleSelectHabitation = (habId: string) => {
    setSelectedHabitationId(habId);
    fetchExplanation(habId);
  };

  const selectedResult: HabitationScenarioResult | null =
    summary.changedHabitations.find((r) => r.habitation.id === selectedHabitationId) ??
    summary.changedHabitations[0] ??
    null;

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <ScenarioControlPanel
        isSimulating={isSimulating}
        modifiers={modifiers}
        onModifierChange={handleModifierChange}
        onPresetChange={handlePresetChange}
        onResetBaseline={handleResetBaseline}
        onRunSimulation={handleRunSimulation}
        presets={presets}
        selectedPresetId={selectedPresetId}
      />

      {/* Impact KPI Summary */}
      <ScenarioImpactKpiStrip summary={summary} />

      {/* Action Strip: GIS Map Link */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[var(--border)] bg-[var(--surface)] p-2.5 text-xs shadow-xs">
        <span className="text-[var(--text-muted)]">
          Simulation active: <strong>{summary.scenario.name}</strong> ({summary.totalHabitationsEscalated} habitations escalated)
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
          <Link
            className={buttonStyles({ size: 'sm', variant: 'secondary' })}
            href="/reports"
          >
            Generate Statutory Reports →
          </Link>
        </div>
      </div>

      {/* Comparison Matrix & AI Explanation Panel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ScenarioComparisonTable
            onSelectHabitation={handleSelectHabitation}
            onToggleShowOnlyChanged={setShowOnlyChanged}
            results={summary.changedHabitations}
            selectedHabitationId={selectedHabitationId}
            showOnlyChanged={showOnlyChanged}
          />
        </div>

        <div className="lg:col-span-5">
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
