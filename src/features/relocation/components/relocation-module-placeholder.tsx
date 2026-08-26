import { ModulePlaceholder } from '@/components/status/module-placeholder';

export function RelocationModulePlaceholder() {
  return (
    <ModulePlaceholder
      currentScope="This route exists so the relocation workflow has a stable place in the product architecture before the actual prioritization, site filtering, and carrying-capacity engines are implemented."
      deliveryPhase="Phase 6"
      description="Future relocation planning will rank vulnerable habitations and compare safer sites with explicit tradeoffs."
      nextMilestones={[
        'Add candidate site entities and deterministic ranking scaffolding.',
        'Connect future capacity calculations as limiting factors.',
        'Support evidence-based recommendation review instead of decorative output.',
      ]}
      responsibilities={[
        'Reserve the navigation surface for relocation planning.',
        'Avoid pretending that recommendations already exist.',
        'Prepare for later workflow components and comparison tables.',
      ]}
      title="Relocation Planning"
    />
  );
}

