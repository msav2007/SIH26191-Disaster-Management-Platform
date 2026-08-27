import type { ScenarioModifiers, ScenarioPreset } from '@/server/scenarios/scenario-types';
import { buttonStyles } from '@/components/ui/button';

export interface ScenarioControlPanelProps {
  presets: ScenarioPreset[];
  selectedPresetId: string;
  modifiers: ScenarioModifiers;
  onPresetChange: (presetId: string) => void;
  onModifierChange: (key: keyof ScenarioModifiers, value: number) => void;
  onRunSimulation: () => void;
  onResetBaseline: () => void;
  isSimulating: boolean;
}

export function ScenarioControlPanel({
  isSimulating,
  modifiers,
  onModifierChange,
  onPresetChange,
  onResetBaseline,
  onRunSimulation,
  presets,
  selectedPresetId,
}: ScenarioControlPanelProps) {
  const currentPreset = presets.find((p) => p.id === selectedPresetId) ?? presets[0]!;

  return (
    <div className="space-y-3.5 rounded-sm border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
        <div>
          <span className="label-xs text-[var(--accent-strong)]">Multi-Hazard Climate Simulator</span>
          <h2 className="text-sm font-bold text-[var(--text)]">Scenario Parameters & Modifiers</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={buttonStyles({ size: 'sm', variant: 'secondary' })}
            onClick={onResetBaseline}
            type="button"
          >
            Reset Baseline
          </button>
          <button
            className={buttonStyles({ size: 'sm', variant: 'primary' })}
            disabled={isSimulating}
            onClick={onRunSimulation}
            type="button"
          >
            {isSimulating ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div>
        <label className="label-xs mb-1.5 block" htmlFor="scenario-preset-selector">
          Scenario Model Preset
        </label>
        <select
          id="scenario-preset-selector"
          className="h-8 w-full rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 text-xs font-semibold text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          onChange={(e) => onPresetChange(e.target.value)}
          value={selectedPresetId}
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">{currentPreset.description}</p>
      </div>

      {/* Modifier Sliders */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2.5">
          <div className="flex justify-between text-xs font-semibold">
            <span>Rainfall Multiplier:</span>
            <span className="tabnum text-[var(--accent-strong)]">
              {modifiers.rainfallMultiplier.toFixed(2)}x ({Math.round((modifiers.rainfallMultiplier - 1) * 100)}%)
            </span>
          </div>
          <input
            aria-label="Adjust precipitation multiplier"
            className="mt-2 w-full accent-[var(--accent)]"
            max="2.0"
            min="1.0"
            step="0.05"
            type="range"
            value={modifiers.rainfallMultiplier}
            onChange={(e) => onModifierChange('rainfallMultiplier', parseFloat(e.target.value))}
          />
        </div>

        <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2.5">
          <div className="flex justify-between text-xs font-semibold">
            <span>Cloudburst Surge:</span>
            <span className="tabnum text-[var(--high)]">+{modifiers.cloudburstSurge} pts</span>
          </div>
          <input
            aria-label="Adjust cloudburst intensity surge"
            className="mt-2 w-full accent-[var(--high)]"
            max="50"
            min="0"
            step="5"
            type="range"
            value={modifiers.cloudburstSurge}
            onChange={(e) => onModifierChange('cloudburstSurge', parseInt(e.target.value, 10))}
          />
        </div>

        <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2.5">
          <div className="flex justify-between text-xs font-semibold">
            <span>Slope Saturation:</span>
            <span className="tabnum text-[var(--critical)]">{modifiers.slopeSaturationFactor.toFixed(2)}x</span>
          </div>
          <input
            aria-label="Adjust slope pore saturation multiplier"
            className="mt-2 w-full accent-[var(--critical)]"
            max="2.0"
            min="1.0"
            step="0.05"
            type="range"
            value={modifiers.slopeSaturationFactor}
            onChange={(e) => onModifierChange('slopeSaturationFactor', parseFloat(e.target.value))}
          />
        </div>

        <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2.5">
          <div className="flex justify-between text-xs font-semibold">
            <span>Infra Strain:</span>
            <span className="tabnum text-[var(--text)]">{modifiers.infrastructureStrainMultiplier.toFixed(2)}x</span>
          </div>
          <input
            aria-label="Adjust infrastructure strain multiplier"
            className="mt-2 w-full accent-[var(--text)]"
            max="2.0"
            min="1.0"
            step="0.05"
            type="range"
            value={modifiers.infrastructureStrainMultiplier}
            onChange={(e) => onModifierChange('infrastructureStrainMultiplier', parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-2 text-[10px] text-[var(--text-muted)]">
        <strong>Scientific Basis:</strong> {currentPreset.scientificContext}
      </div>
    </div>
  );
}
