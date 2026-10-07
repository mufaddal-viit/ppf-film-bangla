import { leadsToCsv, parseLeadFilter } from '@/lib/admin/leads';
import { getSession } from '@/lib/auth/session';
import { auditRepository } from '@/lib/db/repositories/audit.repository';
import { leadRepository } from '@/lib/db/repositories/lead.repository';

/** Upper bound for one file, so an export cannot exhaust the function's memory. */
const MAX_ROWS = 5000;

/** Downloads the leads matching the current list filters as a CSV file. */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return new Response('Sign in to export leads.', { status: 401 });

  const filter = parseLeadFilter(Object.fromEntries(new URL(request.url).searchParams));
  const { items } = await leadRepository.list(filter, { skip: 0, limit: MAX_ROWS });
  await auditRepository.record(session, 'lead.exported', undefined, `${items.length} rows`);

  return new Response(leadsToCsv(items), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
