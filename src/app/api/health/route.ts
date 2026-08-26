import { getHealthStatus } from '@/server/services/health';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await getHealthStatus();
  const httpStatus = status.status === 'ok' ? 200 : 503;

  return Response.json(status, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

