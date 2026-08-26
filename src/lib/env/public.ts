import { validatePublicEnv } from '@/lib/env/schema';

export const publicEnv = validatePublicEnv(process.env);

