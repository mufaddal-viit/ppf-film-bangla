import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState, PageHead, StatusBadge } from '@/components/admin/ui';
import { ADMIN_ROUTES, LEAD_STATUSES, LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from '@/lib/admin/constants';
import { adminDates, humanize } from '@/lib/admin/format';
import { parseLeadFilter } from '@/lib/admin/leads';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import { leadRepository } from '@/lib/db/repositories/lead.repository';

export const metadata: Metadata = { title: 'Leads' };

const PAGE_SIZE = 25;

export default async function AdminLeadsPage({ searchParams }: PageProps<'/admin/leads'>) {
  await requireSession();
  const params = await searchParams;
  const filter = parseLeadFilter(params);
  const page = Math.max(1, Number.parseInt(String(params.page ?? '1'), 10) || 1);
  const { items, total } = await leadRepository.list(filter, { skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const format = adminDates(siteConfig.locale.timezone);

  const query = new URLSearchParams(filter as Record<string, string>);
  const pageHref = (target: number) => {
    const next = new URLSearchParams(query);
    if (target > 1) next.set('page', String(target));
    return `${ADMIN_ROUTES.leads}${next.size ? `?${next}` : ''}`;
  };
  const filtered = query.size > 0;

  return (
    <>
      <PageHead title="Leads" intro={`${total} ${total === 1 ? 'enquiry' : 'enquiries'}${filtered ? ' match' : ''}`}>
        <a className="c-button" href={`${ADMIN_ROUTES.leadsExport}${filtered ? `?${query}` : ''}`}>
          Export CSV
        </a>
      </PageHead>

      <form className="c-admin-filters" method="get" action={ADMIN_ROUTES.leads}>
        <label className="c-admin-field">
          <span>Search</span>
          <input
            className="c-input"
            type="search"
            name="q"
            defaultValue={filter.q}
            placeholder="Name, phone or email"
          />
        </label>
        <label className="c-admin-field">
          <span>Status</span>
          <select className="c-input" name="status" defaultValue={filter.status ?? ''}>
            <option value="">All statuses</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {LEAD_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="c-admin-field">
          <span>Type</span>
          <select className="c-input" name="type" defaultValue={filter.type ?? ''}>
            <option value="">All types</option>
            {Object.entries(LEAD_TYPE_LABELS).map(([type, label]) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="c-button" data-variant="primary">
          Apply
        </button>
        {filtered && (
          <Link href={ADMIN_ROUTES.leads} className="c-admin-more">
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <EmptyState>
          {filtered
            ? 'No enquiries match these filters.'
            : 'No enquiries yet. They appear here when a form is submitted.'}
        </EmptyState>
      ) : (
        <div className="c-admin-table">
          <table>
            <thead>
              <tr>
                <th>Received</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Product</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((lead) => (
                <tr key={lead.id}>
                  <td>{format.dateTime(lead.createdAt)}</td>
                  <td>
                    <Link href={`${ADMIN_ROUTES.leads}/${lead.id}`}>{lead.name}</Link>
                  </td>
                  <td dir="ltr">{lead.phone}</td>
                  <td>{LEAD_TYPE_LABELS[lead.type]}</td>
                  <td>{lead.service ? humanize(lead.service) : '–'}</td>
                  <td>
                    <StatusBadge status={lead.status} />
                  </td>
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
