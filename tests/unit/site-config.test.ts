import { siteConfig } from '@/config/app/site';

describe('siteConfig', () => {
  it('describes the approved platform configuration', () => {
    expect(siteConfig.problemCode).toBe('SIH26191 [SW]');
    expect(siteConfig.phaseLabel).toContain('Production Decision Support');
  });
});

