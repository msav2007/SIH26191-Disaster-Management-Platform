import 'server-only';

import { env } from '@/lib/env/server';

export function getAiProviderStatus() {
  if (env.AI_PROVIDER === 'disabled') {
    return {
      provider: 'disabled',
      status: 'inactive',
      note: 'AI decision support is intentionally deferred until Phase 8.',
    } as const;
  }

  return {
    provider: env.AI_PROVIDER,
    status: 'configured',
    note: `Provider placeholder configured for model ${env.AI_MODEL}.`,
  } as const;
}

