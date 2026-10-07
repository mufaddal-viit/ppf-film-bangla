import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState, PageHead, Pill } from '@/components/admin/ui';
import { ADMIN_ROUTES, CUSTOMER_SEGMENTS, CUSTOMER_SEGMENT_LABELS, RETARGET_AFTER_DAYS } from '@/lib/admin/constants';
import { parseCustomerFilter } from '@/lib/admin/customers';
import { adminDates } from '@/lib/admin/format';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import { customerRepository } from '@/lib/db/repositories/customer.repository';

export const metadata: Metadata = { title: 'Customers' };

const PAGE_SIZE = 25;

export default async function AdminCustomersPage({ searchParams }: PageProps<'/admin/customers'>) {
  await requireSession();
  const params = await searchParams;
  const filter = parseCustomerFilter(params);
  const page = Math.max(1, Number.parseInt(String(params.page ?? '1'), 10) || 1);
  const [{ items, total }, stats, tags] = await Promise.all([
    customerRepository.list(filter, { skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE }),
    customerRepository.stats(),
    customerRepository.tags(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const format = adminDates(siteConfig.locale.timezone);

  const query = new URLSearchParams(filter as Record<string, string>);
  const pageHref = (target: number) => {
    const next = new URLSearchParams(query);
    if (target > 1) next.set('page', String(target));
    return `${ADMIN_ROUTES.customers}${next.size ? `?${next}` : ''}`;
  };
  const filtered = query.size > 0;
  const segmentCounts = { all: stats.total, 'opted-in': stats.optedIn, due: stats.due };

  return (
    <>
      <PageHead
        title="Customers"
        intro={`${total} ${total === 1 ? 'customer' : 'customers'}${filtered ? ' match' : ''}`}
      >
        <a className="c-button" href={`${ADMIN_ROUTES.customersExport}${filtered ? `?${query}` : ''}`}>
          Export CSV
        </a>
        <Link className="c-button" data-variant="primary" href={ADMIN_ROUTES.customersNew}>
          Add customer
        </Link>
      </PageHead>

      <nav className="c-admin-tabs" aria-label="Customer groups">
        {CUSTOMER_SEGMENTS.map((segment) => (
          <Link
            key={segment}
            href={segment === 'all' ? ADMIN_ROUTES.customers : `${ADMIN_ROUTES.customers}?segment=${segment}`}
            aria-current={(filter.segment ?? 'all') === segment ? 'page' : undefined}
          >
            {CUSTOMER_SEGMENT_LABELS[segment]}
            <span>{segmentCounts[segment]}</span>
          </Link>
        ))}
      </nav>

      <form className="c-admin-filters" method="get" action={ADMIN_ROUTES.customers}>
        {filter.segment && <input type="hidden" name="segment" value={filter.segment} />}
        <label className="c-admin-field">
          <span>Search</span>
          <input
            className="c-input"
            type="search"
            name="q"
            defaultValue={filter.q}
            placeholder="Name, phone, email, car or plate"
          />
        </label>
        <label className="c-admin-field">
          <span>Tag</span>
          <select className="c-input" name="tag" defaultValue={filter.tag ?? ''}>
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="c-button" data-variant="primary">
          Apply
        </button>
        {filtered && (
          <Link href={ADMIN_ROUTES.customers} className="c-admin-more">
            Clear
          </Link>
        )}
      </form>

      {filter.segment === 'due' && (
        <p className="c-admin-notice">
          These customers agreed to receive offers and nobody has contacted them for {RETARGET_AFTER_DAYS} days. Message
          them, then press “Mark as contacted” on their page so they leave this list.
        </p>
      )}

      {items.length === 0 ? (
        <EmptyState>
          {filtered
            ? 'No customers match these filters.'
            : 'No customers yet. Add one here, or press “Convert to customer” on a won lead.'}
        </EmptyState>
      ) : (
        <div className="c-admin-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Vehicles</th>
                <th>Tags</th>
                <th>Offers</th>
                <th>Last contacted</th>
              </tr>
            </thead>
            <tbody>
              {items.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <Link href={`${ADMIN_ROUTES.customers}/${customer.id}`}>{customer.name}</Link>
                    {customer.email && <small>{customer.email}</small>}
                  </td>
                  <td dir="ltr">{customer.phone}</td>
                  <td>{customer.vehicles.map((v) => `${v.make} ${v.model}`).join(', ') || '–'}</td>
                  <td>{customer.tags.join(', ') || '–'}</td>
                  <td>
                    <Pill tone={customer.marketingOptIn ? 'success' : 'muted'}>
                      {customer.marketingOptIn ? 'Agreed' : 'Not agreed'}
                    </Pill>
                  </td>
                  <td>{customer.lastContactedAt ? format.date(customer.lastContactedAt) : 'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav className="c-admin-pager" aria-label="Pages">
          {page > 1 ? <Link href={pageHref(page - 1)}>Previous</Link> : <span>Previous</span>}
          <span>
            Page {page} of {pages}
          </span>
          {page < pages ? <Link href={pageHref(page + 1)}>Next</Link> : <span>Next</span>}
        </nav>
      )}
    </>
  );
}
