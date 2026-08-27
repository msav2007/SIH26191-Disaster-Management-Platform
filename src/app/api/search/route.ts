import { NextResponse } from 'next/server';

import {
  searchAuthorityEntities,
  type SearchCategory,
} from '@/server/search/search-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  const category = (searchParams.get('category') as SearchCategory | null) ?? undefined;

  const validCategories = [
    'habitation',
    'red_zone',
    'relocation_site',
    'infrastructure',
    'district',
  ];

  if (category && !validCategories.includes(category)) {
    return NextResponse.json(
      {
        status: 'error',
        message: `Invalid category '${category}'. Valid categories: ${validCategories.join(', ')}`,
      },
      { status: 400 },
    );
  }

  const results = await searchAuthorityEntities(q, category);

  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    query: q,
    count: results.length,
    data: results,
  });
}
