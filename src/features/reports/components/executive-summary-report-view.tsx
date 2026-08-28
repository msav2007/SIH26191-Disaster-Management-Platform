import type { ExecutiveAuthoritySummaryReport } from '@/server/reports/report-types';
import { getPriorityTone } from '@/server/classification/classification-engine';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/ui/status-pill';
import { ReportProvenanceBanner } from './report-provenance-banner';

export interface ExecutiveSummaryReportViewProps {
  report: ExecutiveAuthoritySummaryReport;
}

export function ExecutiveSummaryReportView({ report }: ExecutiveSummaryReportViewProps) {
  const {
    districtsRepresented,
    hazardDistribution,
    keyOperationalRecommendations,
    metadata,
    priorityBreakdown,
    scope,
    topPriorityHabitations,
  } = report;

  return (
    <div className="print-page space-y-5 rounded-sm border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      {/* Title Header */}
      <header className="border-b border-[var(--border)] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="label-xs text-[var(--accent-strong)]">Official Decision-Support Report</span>
            <h1 className="text-xl font-bold text-[var(--text)]">{metadata.title}</h1>
            <p className="text-xs text-[var(--text-muted)]">
              Jurisdiction: {metadata.authorityJurisdiction} · Scope: {scope.district || 'National/Multi-District'}
            </p>
          </div>
          <span className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-xs font-mono text-[var(--text)]">
            {metadata.reportId}
          </span>
        </div>
      </header>

      {/* Provenance Disclaimer Banner */}
      <ReportProvenanceBanner metadata={metadata} />

      {/* Scope KPI Cards */}
      <div>
        <h2 className="label-xs mb-2 text-[var(--text)]">1. Executive Overview & Priority Triage</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <p className="label-xs">Assessed Habitations</p>
            <p className="tabnum mt-1 text-xl font-black text-[var(--text)]">
              {scope.totalAssessedHabitations}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">across {districtsRepresented.length} districts</p>
          </div>

          <div className="rounded-sm border border-[var(--critical-border)] bg-[var(--critical-soft)] p-3">
            <p className="label-xs text-[var(--critical)]">Immediate Relocation (0–6mo)</p>
            <p className="tabnum mt-1 text-xl font-black text-[var(--critical)]">
              {priorityBreakdown.immediate}
            </p>
            <p className="text-[10px] text-[var(--critical)]">Active Red Zone & Critical Risk</p>
          </div>

          <div className="rounded-sm border border-[var(--high-border)] bg-[var(--high-soft)] p-3">
            <p className="label-xs text-[var(--high)]">Short-Term Relocation (6–18mo)</p>
            <p className="tabnum mt-1 text-xl font-black text-[var(--high)]">
              {priorityBreakdown.shortTerm}
            </p>
            <p className="text-[10px] text-[var(--high)]">High-Hazard Recurrence</p>
          </div>

          <div className="rounded-sm border border-[var(--safe-border)] bg-[var(--safe-soft)] p-3">
            <p className="label-xs text-[var(--safe)]">Net Relocation Headroom</p>
            <p className="tabnum mt-1 text-xl font-black text-[var(--safe)]">
              {scope.totalAvailableHeadroom.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-[var(--safe)]">across {scope.totalCandidateSites} candidate sites</p>
          </div>
        </div>
      </div>

      {/* Multi-Hazard Distribution */}
      <div>
        <h2 className="label-xs mb-2 text-[var(--text)]">2. Primary Hazard Distribution</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
          {Object.entries(hazardDistribution).map(([hz, count]) => (
            <div key={hz} className="flex items-center justify-between rounded-sm border border-[var(--border)] p-2">
              <span className="capitalize text-[var(--text)]">{hz.replace('_', ' ')}:</span>
              <span className="tabnum font-bold text-[var(--text)]">{count} habitations</span>
            </div>
          ))}
        </div>
      </div>

      {/* District-Level Summary Table */}
      <div>
        <h2 className="label-xs mb-2 text-[var(--text)]">3. District-Level Vulnerability Matrix</h2>
        <div className="overflow-hidden rounded-sm border border-[var(--border)]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10px] uppercase text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2 font-bold">District & State</th>
                <th className="px-3 py-2 text-right font-bold">Assessed Settlements</th>
                <th className="px-3 py-2 text-right font-bold">Population at Risk</th>
                <th className="px-3 py-2 text-right font-bold">Critical (Immediate)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {districtsRepresented.map((d) => (
                <tr key={d.district} className="hover:bg-[var(--surface-muted)]">
                  <td className="px-3 py-2 font-medium text-[var(--text)]">
                    {d.district}, {d.state}
                  </td>
                  <td className="tabnum px-3 py-2 text-right text-[var(--text)]">
                    {d.habitationsCount}
                  </td>
                  <td className="tabnum px-3 py-2 text-right font-semibold text-[var(--text)]">
                    {d.populationAtRisk.toLocaleString('en-IN')}
                  </td>
                  <td className="tabnum px-3 py-2 text-right font-bold text-[var(--critical)]">
                    {d.criticalCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Priority Settlements Queue */}
      <div>
        <h2 className="label-xs mb-2 text-[var(--text)]">4. High-Priority Habitations Queue</h2>
        <div className="overflow-hidden rounded-sm border border-[var(--border)]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10px] uppercase text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2 font-bold">Settlement Name</th>
                <th className="px-3 py-2 font-bold">District</th>
                <th className="px-3 py-2 font-bold">Hazard</th>
                <th className="px-3 py-2 text-right font-bold">Population</th>
                <th className="px-3 py-2 text-right font-bold">Risk Score</th>
                <th className="px-3 py-2 font-bold">Priority</th>
                <th className="px-3 py-2 font-bold">Recommended Relocation Sector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {topPriorityHabitations.map((h) => (
                <tr key={h.id} className="hover:bg-[var(--surface-muted)]">
                  <td className="px-3 py-2 font-bold text-[var(--text)]">{h.name}</td>
                  <td className="px-3 py-2 text-[var(--text-muted)]">{h.district}</td>
                  <td className="px-3 py-2">
                    <Badge variant={h.hazard === 'landslide' ? 'amber' : 'teal'}>
                      {h.hazard}
                    </Badge>
                  </td>
                  <td className="tabnum px-3 py-2 text-right text-[var(--text)]">
                    {h.population.toLocaleString('en-IN')}
                  </td>
                  <td className="tabnum px-3 py-2 text-right font-black text-[var(--critical)]">
                    {h.riskScore.toFixed(1)}
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill tone={getPriorityTone(h.priority)}>
                      {h.priority}
                    </StatusPill>
                  </td>
                  <td className="px-3 py-2 font-medium text-[var(--accent-strong)]">
                    {h.recommendedSiteName || 'Pending Allocation'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operational Recommendations */}
      <div>
        <h2 className="label-xs mb-2 text-[var(--text)]">5. Operational Directives & Recommendations</h2>
        <div className="space-y-1.5 rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs">
          {keyOperationalRecommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="font-bold text-[var(--accent-strong)]">{i + 1}.</span>
              <span className="text-[var(--text)]">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
