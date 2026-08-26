import { siteConfig } from '@/config/app/site';

describe('siteConfig', () => {
  it('describes the approved Phase 0 foundation', () => {
    expect(siteConfig.problemCode).toBe('SIH26191 [SW]');
    expect(siteConfig.phaseLabel).toContain('Phase 0');
  });
});

