import type { HabitationScenarioResult } from '@/server/scenarios/scenario-types';
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
    <div className="space-y-3 rounded-sm border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
        <div>
          <span className="label-xs text-[var(--accent-strong)]">Triage Transition Matrix</span>
          <h2 className="text-sm font-bold text-[var(--text)]">
            Baseline vs Scenario Comparison ({displayedResults.length} settlements)
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <label className="flex cursor-pointer items-center gap-1.5 font-medium text-[var(--text)]">
            <input
              checked={showOnlyChanged}
              className="accent-[var(--accent)]"
              type="checkbox"
              onChange={(e) => onToggleShowOnlyChanged(e.target.checked)}
            />
            Show only escalated / changed settlements
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-[var(--border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10px] uppercase text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2 font-bold">Settlement & District</th>
                <th className="px-3 py-2 text-right font-bold">Baseline Score</th>
                <th className="px-3 py-2 text-right font-bold">Scenario Score</th>
                <th className="px-3 py-2 text-right font-bold">Shift ($\Delta$)</th>
                <th className="px-3 py-2 font-bold">Priority Transition</th>
                <th className="px-3 py-2 font-bold">Timeline Shift</th>
                <th className="px-3 py-2 font-bold">Primary Driver</th>
                <th className="px-3 py-2 font-bold">Allocated Sector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {displayedResults.map((r) => {
                const isSelected = selectedHabitationId === r.habitation.id;
                const isEscalated = r.priorityTransition.hasEscalated;
                const isNewlyCritical = r.priorityTransition.isNewlyCritical;

                return (
                  <tr
                    key={r.habitation.id}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[var(--accent-soft)]/30 font-medium'
                        : isNewlyCritical
                          ? 'bg-[var(--critical-soft)]/20 hover:bg-[var(--critical-soft)]/30'
                          : isEscalated
                            ? 'bg-[var(--high-soft)]/15 hover:bg-[var(--high-soft)]/25'
                            : 'hover:bg-[var(--surface-muted)]'
                    }`}
                    onClick={() => onSelectHabitation(r.habitation.id)}
                  >
                    {/* 1. Settlement Name */}
                    <td className="px-3 py-2">
                      <div className="font-bold text-[var(--text)]">{r.habitation.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {r.habitation.id} · {r.habitation.district} ({r.habitation.population} pop)
                      </div>
                    </td>

                    {/* 2. Baseline Score */}
                    <td className="tabnum px-3 py-2 text-right font-medium text-[var(--text-muted)]">
                      {r.baselineRisk.compositeScore.toFixed(1)}
                    </td>

                    {/* 3. Scenario Score */}
                    <td className="tabnum px-3 py-2 text-right font-bold text-[var(--text)]">
                      {r.scenarioRisk.compositeScore.toFixed(1)}
                    </td>

                    {/* 4. Delta Shift */}
                    <td className="tabnum px-3 py-2 text-right font-bold">
                      {r.riskDelta > 0 ? (
                        <span className="text-[var(--critical)]">+{r.riskDelta.toFixed(1)}</span>
                      ) : (
                        <span className="text-[var(--text-muted)]">0.0</span>
                      )}
                    </td>

                    {/* 5. Priority Transition */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[var(--text-muted)]">{r.baselineRisk.priority}</span>
                        <span>→</span>
                        <StatusPill tone={r.scenarioRisk.priority === 'CRITICAL' ? 'critical' : 'high'}>
                          {r.scenarioRisk.priority}
                        </StatusPill>
                        {isNewlyCritical && (
                          <span className="rounded-xs bg-[var(--critical)] px-1 py-0.2 text-[9px] font-black text-white">
                            NEW
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 6. Timeline Shift */}
                    <td className="px-3 py-2">
                      <span className="text-[11px] font-medium text-[var(--text)]">
                        {r.scenarioRisk.urgencyWindow}
                      </span>
                    </td>

                    {/* 7. Primary Driver */}
                    <td className="px-3 py-2 capitalize font-medium text-[var(--accent-strong)]">
                      {r.primaryDriverFactor}
                    </td>

                    {/* 8. Candidate Relocation Sector */}
                    <td className="px-3 py-2 text-[11px] text-[var(--text-muted)]">
                      {r.scenarioRecommendedSite?.site.name ?? 'None'}
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
