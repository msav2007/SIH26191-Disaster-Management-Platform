import type { ScenarioModifiers, ScenarioPreset, SimulationStatus } from '@/server/scenarios/scenario-types';
import { buttonStyles } from '@/components/ui/button';
import { SlidersIcon, RefreshIcon, CheckIcon } from '@/components/ui/icons';

export interface ScenarioControlPanelProps {
  presets: ScenarioPreset[];
  selectedPresetId: string;
  modifiers: ScenarioModifiers;
  onPresetChange: (presetId: string) => void;
  onModifierChange: (key: keyof ScenarioModifiers, value: number) => void;
  onRunSimulation: () => void;
  onResetBaseline: () => void;
  isSimulating: boolean;
  status?: SimulationStatus;
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
  status = 'COMPLETED',
}: ScenarioControlPanelProps) {
  const currentPreset = presets.find((p) => p.id === selectedPresetId) ?? presets[0]!;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all">
      {/* 1. Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
              Multi-Hazard Climate Simulator
            </span>
            {status === 'RUNNING' && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 ring-1 ring-sky-600/20 animate-pulse">
                <span className="size-1.5 rounded-full bg-sky-600" />
                SIMULATING...
              </span>
            )}
            {status === 'COMPLETED' && !isSimulating && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                <CheckIcon className="size-3 text-emerald-600" />
                DETERMINISTIC ENGINE ACTIVE
              </span>
            )}
            {status === 'FAILED' && !isSimulating && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 ring-1 ring-red-600/20">
                <span className="size-1.5 rounded-full bg-red-600" />
                SIMULATION FAILED
              </span>
            )}
          </div>
          <h2 className="text-sm font-bold text-slate-900 mt-0.5">
            Scenario Parameters & Modifiers
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={buttonStyles({ size: 'sm', variant: 'secondary' })}
            disabled={isSimulating}
            onClick={onResetBaseline}
            type="button"
          >
            <RefreshIcon className="size-3 text-slate-500" />
            Reset Baseline
          </button>
          <button
            className={buttonStyles({ size: 'sm', variant: 'primary' })}
            disabled={isSimulating}
            onClick={onRunSimulation}
            type="button"
          >
            {isSimulating ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Simulating Engine...
              </span>
            ) : status === 'COMPLETED' ? (
              <span className="inline-flex items-center gap-1.5">
                <CheckIcon className="size-3.5" />
                Run Simulation
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <SlidersIcon className="size-3.5" />
                Run Simulation
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Step 1: Active Scenario Preset Selector */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block" htmlFor="scenario-preset-selector">
            <span className="text-sky-700 font-black mr-1">STEP 1:</span> Choose Scenario Model Preset
          </label>
          <span className="text-[10px] text-slate-500 font-mono">Preset ID: {selectedPresetId}</span>
        </div>
        <select
          id="scenario-preset-selector"
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs font-semibold text-slate-900 transition-colors focus:border-cyan-500 focus:bg-white focus:outline-none disabled:opacity-60"
          disabled={isSimulating}
          onChange={(e) => onPresetChange(e.target.value)}
          value={selectedPresetId}
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{currentPreset.description}</p>
      </div>

      {/* 3. Step 2: Scenario Parameter Sliders */}
      <div className="mt-5">
        <div className="mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            <span className="text-sky-700 font-black mr-1">STEP 2:</span> Adjust Hazard & Stress Modifiers
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Rainfall Multiplier */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-700">Rainfall Multiplier:</span>
              <span className="tabnum font-bold text-sky-700">
                {modifiers.rainfallMultiplier.toFixed(2)}x ({Math.round((modifiers.rainfallMultiplier - 1) * 100)}%)
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-500">Precipitation intensity scaling</p>
            <input
              aria-label="Adjust precipitation multiplier"
              className="mt-2.5 w-full accent-sky-600 disabled:opacity-60"
              disabled={isSimulating}
              max="2.0"
              min="1.0"
              step="0.05"
              type="range"
              value={modifiers.rainfallMultiplier}
              onChange={(e) => onModifierChange('rainfallMultiplier', parseFloat(e.target.value))}
            />
          </div>

          {/* Cloudburst Surge */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-700">Cloudburst Surge:</span>
              <span className="tabnum font-bold text-amber-700">+{modifiers.cloudburstSurge} pts</span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-500">Short-duration flash flood surge</p>
            <input
              aria-label="Adjust cloudburst intensity surge"
              className="mt-2.5 w-full accent-amber-600 disabled:opacity-60"
              disabled={isSimulating}
              max="50"
              min="0"
              step="5"
              type="range"
              value={modifiers.cloudburstSurge}
              onChange={(e) => onModifierChange('cloudburstSurge', parseInt(e.target.value, 10))}
            />
          </div>

          {/* Slope Saturation */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-700">Slope Saturation:</span>
              <span className="tabnum font-bold text-red-700">{modifiers.slopeSaturationFactor.toFixed(2)}x</span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-500">Groundwater pore pressure multiplier</p>
            <input
              aria-label="Adjust slope pore saturation multiplier"
              className="mt-2.5 w-full accent-red-600 disabled:opacity-60"
              disabled={isSimulating}
              max="2.0"
              min="1.0"
              step="0.05"
              type="range"
              value={modifiers.slopeSaturationFactor}
              onChange={(e) => onModifierChange('slopeSaturationFactor', parseFloat(e.target.value))}
            />
          </div>

          {/* Infrastructure Strain */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-700">Infra Strain:</span>
              <span className="tabnum font-bold text-slate-900">{modifiers.infrastructureStrainMultiplier.toFixed(2)}x</span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-500">Corridor road and power grid disruption</p>
            <input
              aria-label="Adjust infrastructure strain multiplier"
              className="mt-2.5 w-full accent-slate-800 disabled:opacity-60"
              disabled={isSimulating}
              max="2.0"
              min="1.0"
              step="0.05"
              type="range"
              value={modifiers.infrastructureStrainMultiplier}
              onChange={(e) => onModifierChange('infrastructureStrainMultiplier', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* 4. Step 3: Expected Impact Preview Box */}
      <div className="mt-4 rounded-lg border border-sky-100 bg-sky-50/50 p-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sky-950">
            <span className="text-sky-700 font-black mr-1">STEP 3:</span> Expected Stress & Model Projections
          </span>
          <span className="font-mono text-[10px] text-sky-800">Deterministic Evaluation Engine</span>
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="text-sky-700 font-bold">↑</span>
            <span>
              {modifiers.rainfallMultiplier > 1 || modifiers.cloudburstSurge > 0
                ? `Precipitation stress scaled by ${modifiers.rainfallMultiplier.toFixed(2)}× (+${modifiers.cloudburstSurge} surge)`
                : 'Baseline precipitation without additional stress'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-700 font-bold">↑</span>
            <span>
              {modifiers.slopeSaturationFactor > 1 || modifiers.infrastructureStrainMultiplier > 1
                ? `Geotechnical pore pressure (${modifiers.slopeSaturationFactor.toFixed(2)}×) & grid strain (${modifiers.infrastructureStrainMultiplier.toFixed(2)}×)`
                : 'Baseline geotechnical and infrastructure resilience'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-700 font-bold">→</span>
            <span>Click &quot;Run Simulation&quot; to project escalated settlements &amp; relocation demand</span>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 flex items-center justify-between">
        <span>
          <strong>Scientific Basis:</strong> {currentPreset.scientificContext}
        </span>
        <span className="font-mono text-[10px] text-slate-400">IMD / IPCC Calibration</span>
      </div>
    </div>
  );
}
