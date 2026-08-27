import type { GroundedExplanationResult } from '@/server/ai/ai-types';
import type { HabitationScenarioResult } from '@/server/scenarios/scenario-types';
import { ProvenanceTag } from '@/components/ui/provenance-tag';

export interface ScenarioExplanationPanelProps {
  selectedResult: HabitationScenarioResult | null;
  groundedExplanation: GroundedExplanationResult | null;
  isLoadingExplanation: boolean;
}

export function ScenarioExplanationPanel({
  groundedExplanation,
  isLoadingExplanation,
  selectedResult,
}: ScenarioExplanationPanelProps) {
  if (!selectedResult) {
    return (
      <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-xs text-[var(--text-muted)]">
        Select a settlement in the comparison table above to generate the AI-assisted grounded briefing.
      </div>
    );
  }

  const { factorComparisons, habitation } = selectedResult;

  return (
    <div className="space-y-4 rounded-sm border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
        <div>
          <span className="label-xs text-[var(--accent-strong)]">Grounded AI Decision Briefing</span>
          <h2 className="text-sm font-bold text-[var(--text)]">
            Explainable Scenario Impact Analysis: {habitation.name}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <ProvenanceTag value="DEMO DATA" />
          <span className="font-mono text-[10px] text-[var(--text-muted)]">{habitation.id}</span>
        </div>
      </div>

      {isLoadingExplanation ? (
        <div className="p-6 text-center text-xs text-[var(--text-muted)]">
          Synthesizing grounded explanation from deterministic engine factors...
        </div>
      ) : groundedExplanation ? (
        <div className="space-y-3.5 text-xs">
          {/* Executive Summary Card */}
          <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-3.5">
            <h3 className="text-xs font-bold text-[var(--text)]">{groundedExplanation.headline}</h3>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">{groundedExplanation.executiveSummary}</p>
          </div>

          {/* Mathematical Driver */}
          <div>
            <h4 className="label-xs mb-1 text-[var(--text)]">Primary Mathematical Driver</h4>
            <p className="text-[11px] font-medium text-[var(--text)]">
              {groundedExplanation.mathematicalDriverExplanation}
            </p>
          </div>

          {/* 5-Factor Delta Table */}
          <div>
            <h4 className="label-xs mb-1.5 text-[var(--text)]">Multi-Factor Mathematical Proof ($\Delta w_i \cdot S_i$)</h4>
            <div className="overflow-hidden rounded-sm border border-[var(--border)]">
              <table className="w-full text-left text-[11px]">
                <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10px] uppercase text-[var(--text-muted)]">
                  <tr>
                    <th className="px-2.5 py-1.5 font-bold">Domain</th>
                    <th className="px-2.5 py-1.5 text-right font-bold">Baseline Raw</th>
                    <th className="px-2.5 py-1.5 text-right font-bold">Scenario Raw</th>
                    <th className="px-2.5 py-1.5 text-right font-bold">Weight</th>
                    <th className="px-2.5 py-1.5 text-right font-bold">Contribution Shift</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {Object.entries(factorComparisons).map(([key, f]) => (
                    <tr
                      key={key}
                      className={f.contributionDelta > 0 ? 'bg-[var(--high-soft)]/20 font-semibold' : 'hover:bg-[var(--surface-muted)]'}
                    >
                      <td className="px-2.5 py-1.5 capitalize text-[var(--text)]">{key}</td>
                      <td className="tabnum px-2.5 py-1.5 text-right text-[var(--text-muted)]">{f.baselineRaw}</td>
                      <td className="tabnum px-2.5 py-1.5 text-right font-bold text-[var(--text)]">{f.scenarioRaw}</td>
                      <td className="tabnum px-2.5 py-1.5 text-right text-[var(--text-muted)]">{Math.round(f.weight * 100)}%</td>
                      <td className="tabnum px-2.5 py-1.5 text-right font-black text-[var(--critical)]">
                        {f.contributionDelta > 0 ? `+${f.contributionDelta.toFixed(1)}` : '0.0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Evidence Bullet Points */}
          <div>
            <h4 className="label-xs mb-1 text-[var(--text)]">Verified Grounded Facts</h4>
            <div className="space-y-1 rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-2.5 text-[10px]">
              {groundedExplanation.evidenceBulletPoints.map((pt, i) => (
                <div key={i} className="text-[var(--text)]">{pt}</div>
              ))}
            </div>
          </div>

          {/* Operational Directive */}
          <div className="rounded-sm border border-[var(--critical-border)] bg-[var(--critical-soft)]/60 p-3 text-[11px]">
            <span className="label-xs block text-[var(--critical)]">Operational Directive</span>
            <p className="mt-0.5 font-bold text-[var(--text)]">{groundedExplanation.operationalConsequence}</p>
          </div>

          {/* Provenance & Disclaimer Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-2 text-[10px] text-[var(--text-muted)]">
            <span>Engine: <strong>{groundedExplanation.modelStamp}</strong> ({groundedExplanation.generatedBy})</span>
            <span className="font-semibold uppercase text-[var(--critical)]">{groundedExplanation.disclaimer}</span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-[var(--text-muted)]">
          {selectedResult.deterministicExplanation}
        </div>
      )}
    </div>
  );
}
