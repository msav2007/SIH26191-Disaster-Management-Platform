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
import { ProvenanceTag } from '@/components/ui/provenance-tag';
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
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              State Disaster Management Authority
            </span>
            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 ring-1 ring-blue-600/20">
              OFFICIAL RECORDS
            </span>
          </div>
          <h1 className="mt-1 text-lg font-bold text-slate-900">
            Executive &amp; Statutory Decision Reports
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Generate and export official decision-ready reports for district collectors, relief commissioners, and planning authorities under DMA 2005.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <ProvenanceTag value="DEMO DATA" />
        </div>
      </div>

      {/* 2. Action & Configuration Toolbar (Hidden during print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Report Type Selector */}
          <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1">
            <button
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                reportType === 'executive_summary'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => handleReportTypeChange('executive_summary')}
              type="button"
            >
              Executive Summary
            </button>
            <button
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                reportType === 'vulnerability_dossier'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => handleReportTypeChange('vulnerability_dossier')}
              type="button"
            >
              Vulnerability Dossier
            </button>
            <button
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                reportType === 'relocation_justification'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
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
            className="h-8.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 shadow-xs hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
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
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500" htmlFor="habitation-report-selector">
                Subject:
              </label>
              <select
                id="habitation-report-selector"
                aria-label="Select target habitation for report generation"
                className="h-8.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 shadow-xs hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
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
            title="Format and print official DMA resettlement order dossier"
            type="button"
          >
            <PrinterIcon className="size-3.5" />
            Print Report (A4)
          </button>

          <a
            className={buttonStyles({ size: 'sm', variant: 'secondary' })}
            download
            href={`/api/reports/export/csv?type=${reportType === 'relocation_justification' ? 'relocations' : 'habitations'}&district=${selectedDistrict}`}
            title="Download tabular dataset as CSV spreadsheet"
          >
            <DownloadIcon className="size-3.5" />
            Export CSV
          </a>

          <a
            className={buttonStyles({ size: 'sm', variant: 'secondary' })}
            download
            href={`/api/reports/export/json?type=${reportType}&habitationId=${selectedHabitationId}&district=${selectedDistrict}`}
            title="Download machine-readable structured JSON decision document"
          >
            <DownloadIcon className="size-3.5" />
            Export JSON
          </a>
        </div>
      </div>

      {/* 3. Report Preview Body */}
      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 shadow-xs">
          Generating deterministic report dossier...
        </div>
      ) : reportType === 'executive_summary' ? (
        <ExecutiveSummaryReportView report={executiveSummary} />
      ) : reportType === 'vulnerability_dossier' && dossierReport ? (
        <HabitationDossierReportView dossier={dossierReport} />
      ) : reportType === 'relocation_justification' && justificationReport ? (
        <RelocationJustificationReportView report={justificationReport} />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 shadow-xs">
          Select a subject settlement from the dropdown above to render the report.
        </div>
      )}
    </div>
  );
}
