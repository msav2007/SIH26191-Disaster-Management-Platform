import 'server-only';

import { sql } from 'drizzle-orm';

import { siteConfig } from '@/config/app/site';
import { env } from '@/lib/env/server';
import { createLogger } from '@/lib/logging/logger';
import { db } from '@/server/db/client';

const logger = createLogger('health');

type DatabaseHealth =
  | {
      status: 'connected';
      latencyMs: number;
    }
  | {
      status: 'unavailable';
      error: string;
    };

async function getDatabaseHealth(): Promise<DatabaseHealth> {
  const startedAt = Date.now();
  let timeoutHandle: NodeJS.Timeout | undefined;

  try {
    await Promise.race([
      db.execute(sql`select 1`),
      new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error('Database health check timed out.'));
        }, env.DATABASE_HEALTHCHECK_TIMEOUT_MS);
      }),
    ]);

    return {
      status: 'connected',
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';

    logger.warn('Database health check failed.', {
      error: message,
    });

    return {
      status: 'unavailable',
      error: message,
    };
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}

export async function getHealthStatus() {
  const database = await getDatabaseHealth();

  return {
    status: database.status === 'connected' ? 'ok' : 'degraded',
    service: siteConfig.shortName,
    environment: env.APP_ENV,
    timestamp: new Date().toISOString(),
    database,
  } as const;
}
