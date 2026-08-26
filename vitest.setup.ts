import '@testing-library/jest-dom/vitest';

function setEnv(key: string, value: string) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

setEnv('APP_ENV', 'development');
setEnv('NEXT_PUBLIC_APP_URL', 'http://127.0.0.1:3000');
setEnv(
  'DATABASE_URL',
  'postgresql://disaster_admin:disaster_admin@127.0.0.1:5432/disaster_management',
);
setEnv('AUTH_SECRET', 'phase0-development-secret-01234567890123456789');
setEnv('AI_PROVIDER', 'disabled');
setEnv('AI_MODEL', 'disabled');
setEnv('AI_API_KEY', '');
setEnv('DATABASE_HEALTHCHECK_TIMEOUT_MS', '50');
