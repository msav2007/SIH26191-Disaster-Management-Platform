import type { HabitationVulnerabilityDossierReport } from '@/server/reports/report-types';
import { CheckIcon, CloseIcon } from '@/components/ui/icons';
import { StatusPill } from '@/components/ui/status-pill';
import { GisCoordinateAppendixView } from './gis-coordinate-appendix-view';
import { ReportProvenanceBanner } from './report-provenance-banner';

export interface HabitationDossierReportViewProps {
  dossier: HabitationVulnerabilityDossierReport;
}

export function HabitationDossierReportView({ dossier }: HabitationDossierReportViewProps) {
  const {
    demographics,
    disasterHistory,
    gisAppendix,
    habitation: h,
    infrastructure,
    metadata,
    redZoneRelationship,
    riskAssessment,
  } = dossier;

  const tone =
    riskAssessment.priority === 'CRITICAL'
      ? 'critical'
      : riskAssessment.priority === 'HIGH'
        ? 'high'
        : riskAssessment.priority === 'MEDIUM'
          ? 'moderate'
          : 'neutral';

  return (
    <div className="print-page space-y-5 rounded-sm border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      {/* Title Header */}
      <header className="border-b border-[var(--border)] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="label-xs text-[var(--accent-strong)]">
              Multi-Hazard Vulnerability Dossier
            </span>
            <h1 className="text-xl font-bold text-[var(--text)]">{h.name}</h1>
            <p className="text-xs text-[var(--text-muted)]">
              {h.id} · {h.block} Block, {h.district}, {h.state}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill tone={tone}>{riskAssessment.priority} PRIORITY</StatusPill>
            <span className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-xs font-mono text-[var(--text)]">
              {metadata.reportId}
            </span>
          </div>
        </div>
      </header>

      {/* Provenance Disclaimer Banner */}
      <ReportProvenanceBanner metadata={metadata} />

      {/* 1. Triage Summary Cards */}
      <div>
        <h2 className="label-xs mb-2 text-[var(--text)]">1. Settlement Risk Profile</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <p className="label-xs">Composite Risk Score</p>
            <p className="tabnum mt-1 text-2xl font-black text-[var(--critical)]">
              {riskAssessment.compositeScore.toFixed(1)}
              <span className="text-xs font-normal text-[var(--text-muted)]">/100</span>
            </p>
            <p className="text-[10px] uppercase text-[var(--text-muted)]">{riskAssessment.riskLevel} Severity</p>
          </div>

          <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <p className="label-xs">Population at Risk</p>
            <p className="tabnum mt-1 text-xl font-bold text-[var(--text)]">
              {h.population.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">{h.households} households</p>
          </div>

          <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <p className="label-xs">Statutory Timeline</p>
            <p className="mt-1 text-sm font-bold text-[var(--text)]">
              {riskAssessment.urgencyWindow}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">Urgency Window</p>
          </div>

          <div className="rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <p className="label-xs">Red Zone Status</p>
            <p className="mt-1 text-sm font-bold text-[var(--critical)]">
              {redZoneRelationship.isContained ? 'Inside Red Zone' : 'Buffer Zone'}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">{redZoneRelationship.redZoneId || 'No direct overlap'}</p>
          </div>
        </div>
      </div>

      {/* 2. Statutory Prioritization Rationale */}
      <div className="rounded-sm border border-[var(--critical-border)] bg-[var(--critical-soft)]/60 p-4 text-xs">
        <h2 className="label-xs mb-1 text-[var(--critical)]">
          2. Statutory Decision Justification
        </h2>
        <p className="font-semibold text-[var(--text)]">{riskAssessment.explanation.headline}</p>
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">{riskAssessment.explanation.primaryDriverText}</p>
        <p className="mt-1.5 font-bold text-[var(--critical)]">{riskAssessment.explanation.urgencyJustification}</p>
      </div>

      {/* 3. Mathematical Factor Breakdown Table */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="label-xs text-[var(--text)]">3. Multi-Factor Mathematical Breakdown</h2>
          <span className="text-[10px] text-[var(--text-muted)]">$S = \sum w_i \cdot S_i$</span>
        </div>
        <div className="overflow-hidden rounded-sm border border-[var(--border)]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10px] uppercase text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2 font-bold">Factor Domain</th>
                <th className="px-3 py-2 text-right font-bold">Raw Score (0–100)</th>
                <th className="px-3 py-2 text-right font-bold">Weight ($w_i$)</th>
                <th className="px-3 py-2 text-right font-bold">Weighted Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {Object.entries(riskAssessment.factors).map(([key, f]) => (
                <tr key={key} className="hover:bg-[var(--surface-muted)]">
                  <td className="px-3 py-2 font-medium capitalize text-[var(--text)]">{key}</td>
                  <td className="tabnum px-3 py-2 text-right font-semibold text-[var(--text)]">{f.raw}</td>
                  <td className="tabnum px-3 py-2 text-right text-[var(--text-muted)]">{Math.round(f.weight * 100)}%</td>
                  <td className="tabnum px-3 py-2 text-right font-bold text-[var(--accent-strong)]">
                    +{f.weightedContribution.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Demographic Vulnerability & Infrastructure Deficit */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-xs">
        <div>
          <h2 className="label-xs mb-2 text-[var(--text)]">4. Demographic Vulnerability Breakdown</h2>
          <div className="space-y-1.5 rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="flex justify-between">
              <span>Below Poverty Line (BPL):</span>
              <span className="tabnum font-bold">{demographics.belowPovertyLine}</span>
            </div>
            <div className="flex justify-between">
              <span>Elderly (60+ years):</span>
              <span className="tabnum font-bold">{demographics.elderly}</span>
            </div>
            <div className="flex justify-between">
              <span>Children (&lt;10 years):</span>
              <span className="tabnum font-bold">{demographics.children}</span>
            </div>
            <div className="flex justify-between">
              <span>Persons with Disabilities (PWD):</span>
              <span className="tabnum font-bold">{demographics.pwd}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="label-xs mb-2 text-[var(--text)]">5. Critical Infrastructure Status</h2>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 rounded-sm border border-[var(--border)] p-2">
              {infrastructure.allWeatherRoad ? (
                <CheckIcon className="size-3.5 text-[var(--safe)]" />
              ) : (
                <CloseIcon className="size-3.5 text-[var(--critical)]" />
              )}
              <span>All-Weather Road</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-sm border border-[var(--border)] p-2">
              {infrastructure.healthSubCentre ? (
                <CheckIcon className="size-3.5 text-[var(--safe)]" />
              ) : (
                <CloseIcon className="size-3.5 text-[var(--critical)]" />
              )}
              <span>Health Sub-Centre</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-sm border border-[var(--border)] p-2">
              {infrastructure.pipedWater ? (
                <CheckIcon className="size-3.5 text-[var(--safe)]" />
              ) : (
                <CloseIcon className="size-3.5 text-[var(--critical)]" />
              )}
              <span>Piped Water</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-sm border border-[var(--border)] p-2">
              {infrastructure.mobileCoverage ? (
                <CheckIcon className="size-3.5 text-[var(--safe)]" />
              ) : (
                <CloseIcon className="size-3.5 text-[var(--critical)]" />
              )}
              <span>Emergency Telecom</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Historical Disaster Recurrence Log */}
      {disasterHistory && disasterHistory.length > 0 && (
        <div>
          <h2 className="label-xs mb-2 text-[var(--text)]">6. Historical Disaster Recurrence Log</h2>
          <div className="space-y-1.5">
            {disasterHistory.map((evt) => (
              <div key={evt.id} className="rounded-sm border border-[var(--border)] p-2 text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-[var(--text)]">{evt.year} · {evt.type.toUpperCase()}</span>
                  <span className="tabnum text-[11px] text-[var(--critical)]">
                    {evt.casualties} casualties · {evt.displaced} displaced
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{evt.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GIS Coordinate Appendix */}
      <GisCoordinateAppendixView appendix={gisAppendix} />
    </div>
  );
}
