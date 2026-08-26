import 'server-only';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { env } from '@/lib/env/server';
import * as schema from '@/server/db/schema';

export const sqlClient = postgres(env.DATABASE_URL, {
  connect_timeout: 2,
  idle_timeout: 5,
  max: 1,
  prepare: false,
});

export const db = drizzle({
  client: sqlClient,
  schema,
});

