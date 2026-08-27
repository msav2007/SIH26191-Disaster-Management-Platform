import { searchAuthorityEntities } from '@/server/search/search-service';

describe('Global Authority Search Engine (Phase 9)', () => {
  it('finds habitations by name, ID, and district', async () => {
    const resByName = await searchAuthorityEntities('Chooralmala');
    expect(resByName.length).toBeGreaterThan(0);
    expect(resByName[0]!.title).toContain('Chooralmala');
    expect(resByName[0]!.category).toBe('habitation');
    expect(resByName[0]!.href).toContain('/habitations?selected=HAB-WY-01');

    const resById = await searchAuthorityEntities('HAB-CH-01');
    expect(resById.length).toBeGreaterThan(0);
    expect(resById[0]!.id).toBe('HAB-CH-01');
  });

  it('finds relocation sites by code and land classification', async () => {
    const res = await searchAuthorityEntities('SITE-WY-01');
    expect(res.length).toBeGreaterThan(0);
    expect(res[0]!.category).toBe('relocation_site');
    expect(res[0]!.href).toContain('/relocation?selectedSiteId=SITE-WY-01');
  });

  it('finds districts and reports settlement count', async () => {
    const res = await searchAuthorityEntities('Wayanad', 'district');
    expect(res.length).toBeGreaterThan(0);
    expect(res[0]!.title).toContain('Wayanad District');
    expect(res[0]!.href).toContain('/habitations?district=Wayanad');
  });

  it('filters results by category', async () => {
    const res = await searchAuthorityEntities('Wayanad', 'habitation');
    expect(res.every((r) => r.category === 'habitation')).toBe(true);
  });

  it('returns empty array for empty or whitespace query', async () => {
    const res1 = await searchAuthorityEntities('');
    const res2 = await searchAuthorityEntities('   ');
    expect(res1).toEqual([]);
    expect(res2).toEqual([]);
  });
});
