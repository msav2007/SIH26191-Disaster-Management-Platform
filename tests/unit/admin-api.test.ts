import { describe, expect, it } from 'vitest';
import { GET as verifyGet } from '@/app/api/admin/verify/route';
import { GET as backupGet } from '@/app/api/admin/backup/route';

describe('Admin API Endpoints', () => {
  it('verifies seed fixtures against strict domain schemas', async () => {
    const res = await verifyGet();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('success');
    expect(json.data.verified).toBe(true);
    expect(json.data.counts.habitations).toBe(7);
    expect(json.data.counts.relocationSites).toBe(7);
    expect(json.data.counts.redZones).toBe(6);
  });

  it('exports master DB consolidated backup snapshot', async () => {
    const res = await backupGet();
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/json');

    const json = await res.json();
    expect(json.metadata.format).toBe('SIH26191_MASTER_DB_BACKUP');
    expect(json.metadata.schemaVersion).toBe('1.0.0');
    expect(json.registries.habitations).toHaveLength(7);
    expect(json.registries.relocationSites).toHaveLength(7);
    expect(json.registries.redZones).toHaveLength(6);
  });
});
