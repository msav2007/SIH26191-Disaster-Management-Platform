// @vitest-environment node

import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('returns a structured health response', async () => {
    const response = await GET();
    const body = (await response.json()) as {
      environment: string;
      service: string;
      status: string;
    };

    expect(['ok', 'degraded']).toContain(body.status);
    expect(body.service).toContain('Command Center');
    expect(body.environment).toBeDefined();
  });
});

