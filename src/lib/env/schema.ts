import { z } from 'zod';

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required.'),
  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET must be at least 32 characters long.'),
  AI_PROVIDER: z.string().default('disabled'),
  AI_MODEL: z.string().default('disabled'),
  AI_API_KEY: z.string().default(''),
  DATABASE_HEALTHCHECK_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(1500),
});

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;

function formatIssues(issues: z.ZodIssue[]): string {
  return issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
}

export function validateServerEnv(input: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(input);

  if (!result.success) {
    throw new Error(`Invalid server environment configuration:\n${formatIssues(result.error.issues)}`);
  }

  return result.data;
}

export function validatePublicEnv(input: Record<string, string | undefined>): PublicEnv {
  const result = publicEnvSchema.safeParse(input);

  if (!result.success) {
    throw new Error(`Invalid public environment configuration:\n${formatIssues(result.error.issues)}`);
  }

  return result.data;
}

