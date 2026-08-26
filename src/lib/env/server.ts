import 'server-only';

import { validateServerEnv } from '@/lib/env/schema';

export const env = validateServerEnv(process.env);

