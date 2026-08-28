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
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500 shadow-xs">
        Select a settlement in the comparison table to inspect the grounded impact analysis.
      </div>
    );
  }

  const { factorComparisons, habitation } = selectedResult;

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
            Grounded AI Decision Briefing
          </span>
          <h2 className="text-sm font-bold text-slate-900 mt-0.5">
            Explainable Scenario Impact Analysis: {habitation.name}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <ProvenanceTag value="DEMO DATA" />
          <span className="font-mono text-[10px] text-slate-500">{habitation.id}</span>
        </div>
      </div>

      {isLoadingExplanation ? (
        <div className="p-8 text-center text-xs text-slate-500">
          <div className="inline-block size-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent mb-2" />
          <p>Synthesizing grounded explanation from deterministic engine factors...</p>
        </div>
      ) : groundedExplanation ? (
        <div className="space-y-4 text-xs">
          {/* Executive Summary Card */}
          <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3.5">
            <h3 className="text-xs font-bold text-slate-900">{groundedExplanation.headline}</h3>
            <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">{groundedExplanation.executiveSummary}</p>
          </div>

          {/* Mathematical Driver */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Primary Driver</h4>
            <p className="text-xs font-medium text-slate-800 leading-relaxed">
              {groundedExplanation.mathematicalDriverExplanation}
            </p>
          </div>

          {/* Evidence Bullet Points */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Verified Grounded Facts</h4>
            <div className="space-y-1 rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-[11px]">
              {groundedExplanation.evidenceBulletPoints.map((pt, i) => (
                <div key={i} className="text-slate-700 leading-relaxed">• {pt}</div>
              ))}
            </div>
          </div>

          {/* Operational Directive */}
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 text-[11px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 block">Operational Directive</span>
            <p className="mt-0.5 font-bold text-red-950">{groundedExplanation.operationalConsequence}</p>
          </div>

          {/* Advanced Collapsible: Multi-Factor Mathematical Proof */}
          <details className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 group">
            <summary className="text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none flex items-center justify-between">
              <span>Multi-Factor Mathematical Proof (Δ wi · Si)</span>
              <span className="text-xs text-sky-700 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left text-[11px]">
                <thead className="border-b border-slate-200 bg-slate-50/90 text-[10px] uppercase font-semibold text-slate-600">
                  <tr>
                    <th className="px-2.5 py-1.5">Domain</th>
                    <th className="px-2.5 py-1.5 text-right">Baseline</th>
                    <th className="px-2.5 py-1.5 text-right">Scenario</th>
                    <th className="px-2.5 py-1.5 text-right">Weight</th>
                    <th className="px-2.5 py-1.5 text-right">Contribution Shift</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(factorComparisons).map(([key, f]) => (
                    <tr
                      key={key}
                      className={f.contributionDelta > 0 ? 'bg-amber-50/30 font-medium' : 'hover:bg-slate-50/60'}
                    >
                      <td className="px-2.5 py-1.5 capitalize text-slate-900">{key}</td>
                      <td className="tabnum px-2.5 py-1.5 text-right text-slate-500">{f.baselineRaw}</td>
                      <td className="tabnum px-2.5 py-1.5 text-right font-bold text-slate-900">{f.scenarioRaw}</td>
                      <td className="tabnum px-2.5 py-1.5 text-right text-slate-500">{Math.round(f.weight * 100)}%</td>
                      <td className="tabnum px-2.5 py-1.5 text-right font-black">
                        {f.contributionDelta > 0 ? (
                          <span className="text-red-700">+{f.contributionDelta.toFixed(1)}</span>
                        ) : f.contributionDelta < 0 ? (
                          <span className="text-emerald-700">{f.contributionDelta.toFixed(1)}</span>
                        ) : (
                          <span className="text-slate-400">0.0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          {/* Provenance & Disclaimer Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[10px] text-slate-500">
            <span>Engine: <strong>{groundedExplanation.modelStamp}</strong></span>
            <span className="font-semibold text-slate-500">{groundedExplanation.disclaimer}</span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-600 leading-relaxed">
          {selectedResult.deterministicExplanation}
        </div>
      )}
    </div>
  );
}
