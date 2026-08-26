import { ModulePlaceholder } from '@/components/status/module-placeholder';

export function ReportsModulePlaceholder() {
  return (
    <ModulePlaceholder
      currentScope="The reports section currently documents intent only. Later phases will turn deterministic assessments into authority-ready exports with clear data disclaimers."
      deliveryPhase="Phase 10"
      description="Future report generation will export evidence-backed action plans, site comparisons, and limitations."
      nextMilestones={[
        'Add printable report templates tied to saved assessments.',
        'Include source provenance, freshness, and simulation disclaimers.',
        'Generate export artifacts from the same backend evidence shown in the UI.',
      ]}
      responsibilities={[
        'Keep report expectations honest during the foundation phase.',
        'Reserve a route for export workflows and report metadata.',
        'Align later reporting with deterministic evidence, not generated fiction.',
      ]}
      title="Reports"
    />
  );
}

