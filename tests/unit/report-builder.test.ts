import {
  buildExecutiveAuthoritySummary,
  buildHabitationVulnerabilityDossier,
  buildRelocationJustificationReport,
} from '@/server/reports/report-builder';
import {
  escapeCsvField,
  generateHabitationsPrioritizationCsv,
  generateRelocationAllocationsCsv,
} from '@/server/reports/csv-export';
import { generateMachineReadableReportJson } from '@/server/reports/json-export';

describe('Report Builder & Export Engine (Phase 7)', () => {
  describe('Executive Authority Summary', () => {
    it('generates complete executive summary with multi-district scope', async () => {
      const summary = await buildExecutiveAuthoritySummary();

      expect(summary.metadata.reportType).toBe('executive_summary');
      expect(summary.metadata.authorityJurisdiction).toContain('Disaster Management Authority');
      expect(summary.metadata.disclaimer).toContain('DEMO / SEEDED DATA');
      expect(summary.scope.totalAssessedHabitations).toBeGreaterThanOrEqual(7);
      expect(summary.scope.populationAtRisk).toBeGreaterThan(5000);
      expect(summary.priorityBreakdown.immediate).toBeGreaterThan(0);
      expect(summary.districtsRepresented.length).toBeGreaterThan(0);
      expect(summary.topPriorityHabitations.length).toBeGreaterThan(0);
      expect(summary.keyOperationalRecommendations.length).toBeGreaterThan(0);
    });

    it('filters executive summary by district', async () => {
      const wayanadSummary = await buildExecutiveAuthoritySummary('Wayanad');

      expect(wayanadSummary.scope.district).toBe('Wayanad');
      expect(wayanadSummary.districtsRepresented).toHaveLength(1);
      expect(wayanadSummary.districtsRepresented[0]?.district).toBe('Wayanad');
    });
  });

  describe('Habitation Vulnerability Dossier', () => {
    it('generates multi-hazard vulnerability dossier for Chooralmala (HAB-WY-01)', async () => {
      const dossier = await buildHabitationVulnerabilityDossier('HAB-WY-01');

      expect(dossier).not.toBeNull();
      expect(dossier!.habitation.name).toBe('Chooralmala Town Settlement');
      expect(dossier!.riskAssessment.compositeScore).toBeGreaterThan(70);
      expect(dossier!.riskAssessment.factors.hazard.weight).toBe(0.35);
      expect(dossier!.riskAssessment.factors.vulnerability.weight).toBe(0.25);
      expect(dossier!.redZoneRelationship.isContained).toBe(true);
      expect(dossier!.demographics.belowPovertyLine).toBeGreaterThan(0);
      expect(dossier!.gisAppendix.crs).toBe('EPSG:4326 (WGS84)');
      expect(dossier!.gisAppendix.subjectCoordinates.latitude).toBeCloseTo(11.5432, 2);
    });

    it('returns null for non-existent habitation ID', async () => {
      const dossier = await buildHabitationVulnerabilityDossier('NON-EXISTENT-ID');
      expect(dossier).toBeNull();
    });
  });

  describe('Relocation Justification Report', () => {
    it('generates statutory justification report for Chooralmala (HAB-WY-01)', async () => {
      const report = await buildRelocationJustificationReport('HAB-WY-01');

      expect(report).not.toBeNull();
      expect(report!.habitation.name).toBe('Chooralmala Town Settlement');
      expect(report!.statutoryMandate.disasterActReference).toContain('Disaster Management Act');
      expect(report!.recommendedSite).not.toBeNull();
      expect(report!.recommendedSite?.site.id).toBe('SITE-WY-01');
      expect(report!.recommendedSite?.suitability.suitabilityBand).toBe('EXCELLENT');
      expect(report!.recommendedSite?.capacity.limitingFactorLabel).toBe('Emergency Shelter Structures');
      expect(report!.gisAppendix.candidateSiteFeatures.length).toBeGreaterThan(0);
    });

    it('returns null for non-existent habitation ID', async () => {
      const report = await buildRelocationJustificationReport('NON-EXISTENT-ID');
      expect(report).toBeNull();
    });
  });

  describe('CSV & JSON Machine-Readable Exports', () => {
    it('escapes CSV fields according to RFC 4180 rules', () => {
      expect(escapeCsvField('simple')).toBe('simple');
      expect(escapeCsvField('hello,world')).toBe('"hello,world"');
      expect(escapeCsvField('say "hello"')).toBe('"say ""hello"""');
      expect(escapeCsvField('line1\nline2')).toBe('"line1\nline2"');
      expect(escapeCsvField(null)).toBe('');
    });

    it('generates habitations prioritization CSV with all expected columns', async () => {
      const csv = await generateHabitationsPrioritizationCsv();

      expect(csv).toContain('habitation_id,habitation_name,district');
      expect(csv).toContain('Chooralmala Town Settlement');
      expect(csv).toContain('Sunil Ward Cluster');
      expect(csv).toContain('DEMO DATA');
    });

    it('generates candidate relocation allocations CSV', async () => {
      const csv = await generateRelocationAllocationsCsv();

      expect(csv).toContain('candidate_site_id,candidate_site_name,district');
      expect(csv).toContain('SITE-WY-01');
      expect(csv).toContain('Meppadi High Ridge Rehabilitation Complex');
    });

    it('generates machine-readable JSON envelope for executive summary', async () => {
      const json = await generateMachineReadableReportJson('executive_summary');

      expect(json).not.toBeNull();
      expect(json!.status).toBe('success');
      expect(json!.schemaVersion).toBe('1.0.0');
      expect(json!.reportType).toBe('executive_summary');
    });

    it('generates machine-readable JSON envelope for vulnerability dossier', async () => {
      const json = await generateMachineReadableReportJson('vulnerability_dossier', 'HAB-WY-01');

      expect(json).not.toBeNull();
      expect(json!.status).toBe('success');
      expect(json!.reportType).toBe('vulnerability_dossier');
    });
  });
});
