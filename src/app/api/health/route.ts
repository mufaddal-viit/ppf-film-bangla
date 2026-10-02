import { getDb } from '@/lib/db/client';
import { logger } from '@/lib/logger';

/** Liveness and database check for uptime monitoring. Reveals no internal details. */
export async function GET() {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    await (await getDb()).command({ ping: 1 });
    return Response.json({ status: 'ok', database: 'ok' }, { headers });
  } catch (error) {
    logger.error('health.database_unreachable', {}, error);
    return Response.json({ status: 'degraded', database: 'unreachable' }, { status: 503, headers });
  }
}
