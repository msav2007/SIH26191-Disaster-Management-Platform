import { defaultCapacityModel } from '@/config/capacity/default-model';
import { defaultRiskModel } from '@/config/risk/default-model';
import { ModulePlaceholder } from '@/components/status/module-placeholder';
import { Card } from '@/components/ui/card';
import { getAiProviderStatus } from '@/server/ai/provider-registry';

export function AdministrationModulePlaceholder() {
  const aiStatus = getAiProviderStatus();

  return (
    <div className="space-y-6">
      <ModulePlaceholder
        currentScope="Administration currently exposes the configuration and diagnostics surfaces that later phases will harden with proper authentication, role scoping, and audit visibility."
        deliveryPhase="Phase 0"
        description="This module is where environment posture, platform status, and future governance controls will live."
        nextMilestones={[
          'Introduce role-aware access control around sensitive routes.',
          'Add audit-event exploration and configuration editing workflows.',
          'Connect system-health and ingestion diagnostics to real backend jobs.',
        ]}
        responsibilities={[
          'Surface configuration foundations without exposing secrets.',
          'Document deferred AI and engine modules honestly.',
          'Prepare a stable route for later operational controls.',
        ]}
        title="Administration"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-3 p-6">
          <h2 className="text-lg font-semibold text-[var(--text)]">Risk model config</h2>
          <p className="text-sm leading-6 text-[var(--text-muted)]">{defaultRiskModel.note}</p>
        </Card>
        <Card className="space-y-3 p-6">
          <h2 className="text-lg font-semibold text-[var(--text)]">Capacity model config</h2>
          <p className="text-sm leading-6 text-[var(--text-muted)]">
            {defaultCapacityModel.note}
          </p>
        </Card>
        <Card className="space-y-3 p-6">
          <h2 className="text-lg font-semibold text-[var(--text)]">AI provider posture</h2>
          <p className="text-sm leading-6 text-[var(--text-muted)]">{aiStatus.note}</p>
        </Card>
      </div>
    </div>
  );
}

