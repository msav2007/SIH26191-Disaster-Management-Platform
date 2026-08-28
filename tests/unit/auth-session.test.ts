import { describe, expect, it, beforeEach } from 'vitest';
import {
  DEFAULT_ROLE,
  getActiveRole,
  setActiveRole,
} from '@/lib/auth/session';

describe('Auth Role Session Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default SDMA Admin role when storage is empty', () => {
    const role = getActiveRole();
    expect(role.id).toBe(DEFAULT_ROLE.id);
    expect(role.title).toBe('SDMA Admin');
  });

  it('persists and retrieves district collector role', () => {
    setActiveRole('district_collector');
    const role = getActiveRole();
    expect(role.id).toBe('district_collector');
    expect(role.title).toBe('District Collector');
    expect(role.badge).toBe('DISTRICT GOVERNANCE');
  });

  it('persists and retrieves geotechnical surveyor role', () => {
    setActiveRole('geotech_surveyor');
    const role = getActiveRole();
    expect(role.id).toBe('geotech_surveyor');
    expect(role.title).toBe('Field Geotechnical Surveyor');
    expect(role.badge).toBe('FIELD AUDIT');
  });

  it('falls back to default role on unrecognized role ID', () => {
    setActiveRole('non_existent_role');
    const role = getActiveRole();
    expect(role.id).toBe(DEFAULT_ROLE.id);
  });
});
