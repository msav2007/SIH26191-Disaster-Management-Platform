import type { RelocationJustificationReport } from '@/server/reports/report-types';
import { StatusPill } from '@/components/ui/status-pill';
import { GisCoordinateAppendixView } from './gis-coordinate-appendix-view';
import { ReportProvenanceBanner } from './report-provenance-banner';

export interface RelocationJustificationReportViewProps {
  report: RelocationJustificationReport;
}

export function RelocationJustificationReportView({ report }: RelocationJustificationReportViewProps) {
  const {
    alternativeSites,
    decisionExplanation,
    gisAppendix,
    habitation: h,
    metadata,
    recommendedSite,
    riskAssessment,
    statutoryMandate,
  } = report;

  return (
    <div className="print-page space-y-5 rounded-sm border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      {/* Title Header */}
      <header className="border-b border-[var(--border)] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="label-xs text-[var(--accent-strong)]">
              Draft Statutory Relocation Justification
            </span>
            <h1 className="text-xl font-bold text-[var(--text)]">{metadata.title}</h1>
            <p className="text-xs text-[var(--text-muted)]">
              Subject: {h.name} ({h.id}) · {h.block} Block, {h.district}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill tone={statutoryMandate.priorityLevel === 'CRITICAL' ? 'critical' : 'high'}>
              {statutoryMandate.priorityLevel} PRIORITY
            </StatusPill>
            <span className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-xs font-mono text-[var(--text)]">
              {metadata.reportId}
            </span>
          </div>
        </div>
      </header>

      {/* Provenance Disclaimer Banner */}
      <ReportProvenanceBanner metadata={metadata} />

      {/* 1. Statutory Context & Mandate */}
      <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-xs">
        <h2 className="label-xs mb-1 text-[var(--text)]">1. Statutory Context & Legal Authority</h2>
        <p className="font-semibold text-[var(--text)]">{statutoryMandate.disasterActReference}</p>
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">
          Relocation Window: <strong>{statutoryMandate.urgencyWindow}</strong>. Generated from deterministic multi-hazard vulnerability scoring model ({riskAssessment.compositeScore.toFixed(1)}/100 risk).
        </p>
      </div>

      {/* 2. Recommended Relocation Sector Assessment */}
      <div>
        <h2 className="label-xs mb-2 text-[var(--text)]">2. Primary Recommended Relocation Sector</h2>
        {recommendedSite ? (
          <div className="rounded-sm border border-[var(--safe-border)] bg-[var(--safe-soft)]/40 p-4 text-xs">
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[var(--safe-border)]/60 pb-3">
              <div>
                <span className="rounded-sm border border-[var(--safe-border)] bg-[var(--safe-soft)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--safe)]">
                  Rank #1 Recommended Sector
                </span>
                <h3 className="mt-1 text-base font-bold text-[var(--text)]">{recommendedSite.site.name}</h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {recommendedSite.site.id} · {recommendedSite.site.block} Block, {recommendedSite.site.district} · {recommendedSite.site.landClass.replace('_', ' ')}
                </p>
              </div>

              <div className="text-right">
                <p className="label-xs">Suitability Score</p>
                <p className="tabnum text-lg font-black text-[var(--safe)]">
                  {recommendedSite.suitability.suitabilityScore}/100
                </p>
                <p className="text-[10px] font-bold text-[var(--safe)]">{recommendedSite.suitability.suitabilityBand}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-2">
                <p className="label-xs">Transit Distance</p>
                <p className="tabnum mt-1 font-bold text-[var(--text)]">{recommendedSite.distanceKm} km</p>
                <p className="text-[10px] text-[var(--text-muted)]">from {h.name}</p>
              </div>

              <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-2">
                <p className="label-xs">Available Headroom</p>
                <p className="tabnum mt-1 font-bold text-[var(--safe)]">
                  {recommendedSite.capacity.availableHeadroom.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">of {recommendedSite.capacity.effectiveCapacity} eff</p>
              </div>

              <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-2">
                <p className="label-xs">Limiting Factor</p>
                <p className="mt-1 font-bold capitalize text-[var(--high)]">
                  {recommendedSite.capacity.limitingFactor}
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">{recommendedSite.capacity.limitingFactorLabel}</p>
              </div>

              <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-2">
                <p className="label-xs">Hazard Safety</p>
                <p className="mt-1 font-bold capitalize text-[var(--text)]">
                  {recommendedSite.site.hazardExposure}
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">Outside active runouts</p>
              </div>
            </div>

            <div className="mt-3">
              <p className="font-semibold text-[var(--text)]">{decisionExplanation.headline}</p>
              <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{decisionExplanation.rationaleText}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-sm border border-[var(--critical-border)] bg-[var(--critical-soft)] p-4 text-xs text-[var(--critical)]">
            No feasible candidate relocation site currently identified meeting statutory safety and capacity headroom thresholds.
          </div>
        )}
      </div>

      {/* 3. Multi-Dimensional Capacity Breakdown */}
      {recommendedSite && (
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="label-xs text-[var(--text)]">3. Multi-Dimensional Carrying Capacity Assessment</h2>
            <span className="text-[10px] text-[var(--text-muted)]">
              Limiting factor: <strong>{recommendedSite.capacity.limitingFactorLabel}</strong>
            </span>
          </div>
          <div className="overflow-hidden rounded-sm border border-[var(--border)]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10px] uppercase text-[var(--text-muted)]">
                <tr>
                  <th className="px-3 py-2 font-bold">Dimension</th>
                  <th className="px-3 py-2 text-right font-bold">Supported Population</th>
                  <th className="px-3 py-2 font-bold">Constraint Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {Object.values(recommendedSite.capacity.dimensions).map((dim) => (
                  <tr
                    key={dim.dimension}
                    className={dim.isLimiting ? 'bg-[var(--high-soft)]/40 font-semibold' : 'hover:bg-[var(--surface-muted)]'}
                  >
                    <td className="px-3 py-2">
                      <span className="block text-[var(--text)]">{dim.label}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{dim.notes}</span>
                    </td>
                    <td className="tabnum px-3 py-2 text-right text-[var(--text)]">
                      {dim.supportedPopulation.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2">
                      {dim.isLimiting ? (
                        <span className="rounded-sm border border-[var(--high-border)] bg-[var(--high-soft)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--high)]">
                          Limiting Bottleneck
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--safe)]">Adequate</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Alternative Candidate Sectors */}
      {alternativeSites.length > 0 && (
        <div>
          <h2 className="label-xs mb-2 text-[var(--text)]">4. Alternative Candidate Sectors Evaluated</h2>
          <div className="overflow-hidden rounded-sm border border-[var(--border)]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10px] uppercase text-[var(--text-muted)]">
                <tr>
                  <th className="px-3 py-2 font-bold">Candidate Site</th>
                  <th className="px-3 py-2 font-bold">Distance</th>
                  <th className="px-3 py-2 text-right font-bold">Headroom</th>
                  <th className="px-3 py-2 text-right font-bold">Suitability</th>
                  <th className="px-3 py-2 font-bold">Limiting Factor / Tradeoff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {alternativeSites.map((alt) => (
                  <tr key={alt.site.id} className="hover:bg-[var(--surface-muted)]">
                    <td className="px-3 py-2 font-medium text-[var(--text)]">
                      {alt.site.name} ({alt.site.district})
                    </td>
                    <td className="tabnum px-3 py-2 text-[var(--text-muted)]">{alt.distanceKm} km</td>
                    <td className="tabnum px-3 py-2 text-right font-semibold text-[var(--text)]">
                      {alt.capacity.availableHeadroom.toLocaleString('en-IN')}
                    </td>
                    <td className="tabnum px-3 py-2 text-right font-bold text-[var(--accent-strong)]">
                      {alt.suitability.suitabilityScore}/100
                    </td>
                    <td className="px-3 py-2 text-[10px] text-[var(--text-muted)]">
                      Constrained by {alt.capacity.limitingFactorLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GIS Coordinate Appendix */}
      <GisCoordinateAppendixView appendix={gisAppendix} />
    </div>
  );
}
