import { csvHeaders } from '@/lib/admin/csv';
import { customersToCsv, parseCustomerFilter } from '@/lib/admin/customers';
import { getSession } from '@/lib/auth/session';
import { auditRepository } from '@/lib/db/repositories/audit.repository';
import { customerRepository } from '@/lib/db/repositories/customer.repository';

/** Upper bound for one file, so an export cannot exhaust the function's memory. */
const MAX_ROWS = 5000;

/** Downloads the customers matching the current list filters as a CSV file. */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return new Response('Sign in to export customers.', { status: 401 });

  const filter = parseCustomerFilter(Object.fromEntries(new URL(request.url).searchParams));
  const { items } = await customerRepository.list(filter, { skip: 0, limit: MAX_ROWS });
  await auditRepository.record(session, 'customer.exported', undefined, `${items.length} rows`);

  return new Response(customersToCsv(items), { headers: csvHeaders('customers') });
}
