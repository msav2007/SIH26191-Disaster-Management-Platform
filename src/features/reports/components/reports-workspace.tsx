'use client';

import { useMemo, useState } from 'react';

import type {
  ExecutiveAuthoritySummaryReport,
  HabitationVulnerabilityDossierReport,
  RelocationJustificationReport,
  ReportType,
} from '@/server/reports/report-types';
import type { Habitation } from '@/types/domain';
import { buttonStyles } from '@/components/ui/button';
import { DownloadIcon, PrinterIcon } from '@/components/ui/icons';
import { ExecutiveSummaryReportView } from './executive-summary-report-view';
import { HabitationDossierReportView } from './habitation-dossier-report-view';
import { RelocationJustificationReportView } from './relocation-justification-report-view';

export interface ReportsWorkspaceProps {
  initialReportType: ReportType;
  initialHabitationId?: string | null | undefined;
  executiveSummary: ExecutiveAuthoritySummaryReport;
  allHabitations: Habitation[];
  preloadedDossier?: HabitationVulnerabilityDossierReport | null | undefined;
  preloadedJustification?: RelocationJustificationReport | null | undefined;
}

export function ReportsWorkspace({
  allHabitations,
  executiveSummary,
  initialHabitationId,
  initialReportType,
  preloadedDossier,
  preloadedJustification,
}: ReportsWorkspaceProps) {
  const [reportType, setReportType] = useState<ReportType>(initialReportType);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedHabitationId, setSelectedHabitationId] = useState<string>(() => {
    if (initialHabitationId) return initialHabitationId;
    return allHabitations[0]?.id ?? '';
  });

  const [dossierReport, setDossierReport] = useState<HabitationVulnerabilityDossierReport | null>(
    () => preloadedDossier ?? null,
  );
  const [justificationReport, setJustificationReport] = useState<RelocationJustificationReport | null>(
    () => preloadedJustification ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);

  // Extract unique districts
  const districts = useMemo(() => {
    const set = new Set(allHabitations.map((h) => h.district));
    return Array.from(set).sort();
  }, [allHabitations]);

  // Filter habitations by district
  const filteredHabitations = useMemo(() => {
    if (selectedDistrict === 'all') return allHabitations;
    return allHabitations.filter(
      (h) => h.district.toLowerCase() === selectedDistrict.toLowerCase(),
    );
  }, [allHabitations, selectedDistrict]);

  // Fetch report when selecting a new habitation or report type
  const fetchReport = async (type: ReportType, habId: string) => {
    setIsLoading(true);
    try {
      if (type === 'vulnerability_dossier') {
        const res = await fetch(`/api/reports/vulnerability/${habId}`);
        const data = await res.json();
        if (data.status === 'success') {
          setDossierReport(data.data);
        }
      } else if (type === 'relocation_justification') {
        const res = await fetch(`/api/reports/relocation/${habId}`);
        const data = await res.json();
        if (data.status === 'success') {
          setJustificationReport(data.data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch report:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHabitationChange = (habId: string) => {
    setSelectedHabitationId(habId);
    if (reportType !== 'executive_summary') {
      fetchReport(reportType, habId);
    }
  };

  const handleReportTypeChange = (type: ReportType) => {
    setReportType(type);
    if (type !== 'executive_summary' && selectedHabitationId) {
      fetchReport(type, selectedHabitationId);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action & Configuration Toolbar (Hidden during print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Report Type Selector */}
          <div className="flex rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] p-0.5">
            <button
              className={`rounded-sm px-3 py-1 text-xs font-semibold transition-colors ${
                reportType === 'executive_summary'
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
              onClick={() => handleReportTypeChange('executive_summary')}
              type="button"
            >
              Executive Summary
            </button>
            <button
              className={`rounded-sm px-3 py-1 text-xs font-semibold transition-colors ${
                reportType === 'vulnerability_dossier'
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
              onClick={() => handleReportTypeChange('vulnerability_dossier')}
              type="button"
            >
              Vulnerability Dossier
            </button>
            <button
              className={`rounded-sm px-3 py-1 text-xs font-semibold transition-colors ${
                reportType === 'relocation_justification'
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
              onClick={() => handleReportTypeChange('relocation_justification')}
              type="button"
            >
              Relocation Justification
            </button>
          </div>

          {/* District Filter */}
          <select
            aria-label="Filter reports by district"
            className="h-8 rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] px-2 text-xs font-semibold text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
            onChange={(e) => setSelectedDistrict(e.target.value)}
            value={selectedDistrict}
          >
            <option value="all">All Districts ({districts.length})</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Habitation Selector (Visible for Dossier and Justification) */}
          {reportType !== 'executive_summary' && (
            <div className="flex items-center gap-2">
              <label className="label-xs" htmlFor="habitation-report-selector">
                Subject:
              </label>
              <select
                id="habitation-report-selector"
                aria-label="Select target habitation for report generation"
                className="h-8 rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] px-2 text-xs font-semibold text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                onChange={(e) => handleHabitationChange(e.target.value)}
                value={selectedHabitationId}
              >
                {filteredHabitations.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.district} · {h.priority})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Export & Print Actions */}
        <div className="flex items-center gap-2">
          <button
            className={buttonStyles({ size: 'sm', variant: 'primary' })}
            onClick={handlePrint}
            type="button"
          >
            <PrinterIcon className="size-3.5" />
            Print Report (A4)
          </button>

          <a
            className={buttonStyles({ size: 'sm', variant: 'secondary' })}
            download
            href={`/api/reports/export/csv?type=${reportType === 'relocation_justification' ? 'relocations' : 'habitations'}&district=${selectedDistrict}`}
          >
            <DownloadIcon className="size-3.5" />
            Export CSV
          </a>

          <a
            className={buttonStyles({ size: 'sm', variant: 'secondary' })}
            download
            href={`/api/reports/export/json?type=${reportType}&habitationId=${selectedHabitationId}&district=${selectedDistrict}`}
          >
            <DownloadIcon className="size-3.5" />
            Export JSON
          </a>
        </div>
      </div>

      {/* Report Preview Body */}
      {isLoading ? (
        <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-12 text-center text-xs text-[var(--text-muted)]">
          Generating deterministic report dossier...
        </div>
      ) : reportType === 'executive_summary' ? (
        <ExecutiveSummaryReportView report={executiveSummary} />
      ) : reportType === 'vulnerability_dossier' && dossierReport ? (
        <HabitationDossierReportView dossier={dossierReport} />
      ) : reportType === 'relocation_justification' && justificationReport ? (
        <RelocationJustificationReportView report={justificationReport} />
      ) : (
        <div className="rounded-sm border border-[var(--border)] bg-[var(--surface)] p-12 text-center text-xs text-[var(--text-muted)]">
          Select a subject settlement from the dropdown above to render the report.
        </div>
      )}
    </div>
  );
}
