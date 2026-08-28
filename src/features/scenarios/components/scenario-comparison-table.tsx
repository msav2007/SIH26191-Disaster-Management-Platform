import type { HabitationScenarioResult } from '@/server/scenarios/scenario-types';
import { getPriorityTone } from '@/server/classification/classification-engine';
import { StatusPill } from '@/components/ui/status-pill';

export interface ScenarioComparisonTableProps {
  results: HabitationScenarioResult[];
  selectedHabitationId: string | null;
  onSelectHabitation: (habitationId: string) => void;
  showOnlyChanged: boolean;
  onToggleShowOnlyChanged: (val: boolean) => void;
}

export function ScenarioComparisonTable({
  onSelectHabitation,
  onToggleShowOnlyChanged,
  results,
  selectedHabitationId,
  showOnlyChanged,
}: ScenarioComparisonTableProps) {
  const displayedResults = showOnlyChanged
    ? results.filter((r) => r.riskDelta !== 0 || r.priorityTransition.hasEscalated)
    : results;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
            Triage Transition Matrix
          </span>
          <h2 className="text-sm font-bold text-slate-900 mt-0.5">
            Baseline vs Scenario Comparison ({displayedResults.length} settlements)
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <label className="flex cursor-pointer items-center gap-2 font-medium text-slate-700 select-none">
            <input
              checked={showOnlyChanged}
              className="size-3.5 rounded border-slate-300 accent-sky-600 focus:ring-sky-500"
              type="checkbox"
              onChange={(e) => onToggleShowOnlyChanged(e.target.checked)}
            />
            <span>Show only escalated settlements</span>
          </label>
        </div>
      </div>

      <div className="mt-3.5 overflow-hidden rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-semibold uppercase text-slate-600">
              <tr>
                <th className="px-3.5 py-2.5">Settlement</th>
                <th className="px-3.5 py-2.5">District</th>
                <th className="px-3.5 py-2.5 text-right">Baseline</th>
                <th className="px-3.5 py-2.5 text-right">Scenario</th>
                <th className="px-3.5 py-2.5 text-right">Change (Δ)</th>
                <th className="px-3.5 py-2.5">Priority Transition</th>
                <th className="px-3.5 py-2.5">Timeline</th>
                <th className="px-3.5 py-2.5">Primary Driver</th>
                <th className="px-3.5 py-2.5">Candidate Sector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedResults.map((r) => {
                const isSelected = selectedHabitationId === r.habitation.id;
                const isNewlyCritical = r.priorityTransition.isNewlyCritical;
                const isCritical = r.scenarioRisk.priority === 'CRITICAL';

                return (
                  <tr
                    key={r.habitation.id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-50/80 ring-1 ring-inset ring-sky-300'
                        : isNewlyCritical
                          ? 'bg-red-50/30 hover:bg-red-50/50'
                          : isCritical
                            ? 'bg-red-50/15 hover:bg-red-50/30'
                            : 'hover:bg-slate-50/80'
                    }`}
                    onClick={() => onSelectHabitation(r.habitation.id)}
                  >
                    {/* 1. Settlement */}
                    <td className="px-3.5 py-2.5">
                      <div className="font-bold text-slate-900">{r.habitation.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {r.habitation.id} · {r.habitation.population.toLocaleString('en-IN')} pop
                      </div>
                    </td>

                    {/* 2. District */}
                    <td className="px-3.5 py-2.5 text-slate-600">{r.habitation.district}</td>

                    {/* 3. Baseline */}
                    <td className="tabnum px-3.5 py-2.5 text-right font-medium text-slate-600">
                      {r.baselineRisk.compositeScore.toFixed(1)}
                    </td>

                    {/* 4. Scenario */}
                    <td className="tabnum px-3.5 py-2.5 text-right font-bold text-slate-900">
                      {r.scenarioRisk.compositeScore.toFixed(1)}
                    </td>

                    {/* 5. Change Delta */}
                    <td className="tabnum px-3.5 py-2.5 text-right font-bold">
                      {r.riskDelta > 0 ? (
                        <span className="text-amber-700">+{r.riskDelta.toFixed(1)}</span>
                      ) : r.riskDelta < 0 ? (
                        <span className="text-emerald-700">{r.riskDelta.toFixed(1)}</span>
                      ) : (
                        <span className="text-slate-400">0.0</span>
                      )}
                    </td>

                    {/* 6. Priority Transition */}
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-medium">{r.baselineRisk.priority}</span>
                        <span className="text-slate-400">→</span>
                        <StatusPill tone={getPriorityTone(r.scenarioRisk.priority)}>
                          {r.scenarioRisk.priority}
                        </StatusPill>
                        {isNewlyCritical && (
                          <span className="rounded bg-red-600 px-1 py-0.2 text-[9px] font-black uppercase text-white">
                            NEW
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 7. Timeline */}
                    <td className="px-3.5 py-2.5 text-[11px] font-medium text-slate-700">
                      {r.scenarioRisk.urgencyWindow}
                    </td>

                    {/* 8. Primary Driver */}
                    <td className="px-3.5 py-2.5 capitalize font-medium text-sky-700">
                      {r.primaryDriverFactor}
                    </td>

                    {/* 9. Candidate Sector */}
                    <td className="px-3.5 py-2.5 text-[11px] text-slate-600">
                      {r.scenarioRecommendedSite?.site.name ?? 'Unassigned'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
