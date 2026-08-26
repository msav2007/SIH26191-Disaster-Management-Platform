import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';

import { validateServerEnv } from './src/lib/env/schema';

loadEnvConfig(process.cwd());

const env = validateServerEnv(process.env);

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/server/db/schema/index.ts',
  out: './drizzle/migrations',
  strict: true,
  verbose: true,
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});

