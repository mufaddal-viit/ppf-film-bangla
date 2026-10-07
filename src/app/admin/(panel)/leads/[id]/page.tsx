import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addLeadNote, convertLeadToCustomer, updateLeadFollowUp, updateLeadStatus } from '@/app/actions/admin';
import { AdminForm } from '@/components/admin/admin-form';
import { EmptyState, Field, PageHead, Panel, StatusBadge } from '@/components/admin/ui';
import { ADMIN_ROUTES, LEAD_STATUSES, LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from '@/lib/admin/constants';
import { adminDates, humanize } from '@/lib/admin/format';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { leadRepository } from '@/lib/db/repositories/lead.repository';

export const metadata: Metadata = { title: 'Lead' };

export default async function AdminLeadPage({ params }: PageProps<'/admin/leads/[id]'>) {
  await requireSession();
  const { id } = await params;
  const lead = await leadRepository.findById(id);
  if (!lead) notFound();
  const customer = await customerRepository.findByPhone(lead.phone);

  const format = adminDates(siteConfig.locale.timezone);
  const vehicle = [lead.vehicle?.make, lead.vehicle?.model, lead.vehicle?.year].filter(Boolean).join(' ');
  const source = [lead.utm?.source, lead.utm?.medium, lead.utm?.campaign].filter(Boolean).join(' / ');
  const details: Array<[label: string, value: string | undefined]> = [
    ['Received', format.dateTime(lead.createdAt)],
    ['Type', LEAD_TYPE_LABELS[lead.type]],
    ['Product', lead.service && humanize(lead.service)],
    ['Vehicle', vehicle],
    ['Preferred time', lead.preferredTime],
    ['Language', lead.locale === 'ar' ? 'Arabic' : 'English'],
    ['Submitted from', lead.sourcePage],
    ['First page visited', lead.landingPage],
    ['Came from', lead.referrer],
    ['Campaign', source],
  ];

  return (
    <>
      <Link href={ADMIN_ROUTES.leads} className="c-admin-back">
        All leads
      </Link>
      <PageHead title={lead.name}>
        <StatusBadge status={lead.status} />
      </PageHead>

      <div className="c-admin-columns" data-layout="detail">
        <div className="c-admin-stack">
          <Panel title="Contact">
            <div className="c-admin-contact">
              <a className="c-button" data-variant="primary" href={`tel:${lead.phone}`}>
                Call <span dir="ltr">{lead.phone}</span>
              </a>
              <a
                className="c-button"
                href={`https://wa.me/${lead.phone.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
              {lead.email && (
                <a className="c-button" href={`mailto:${lead.email}`}>
                  {lead.email}
                </a>
              )}
            </div>
            {lead.message && <blockquote className="c-admin-message">{lead.message}</blockquote>}
            <dl className="c-admin-details">
              {details.map(([label, value]) =>
                value ? (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ) : null,
              )}
            </dl>
          </Panel>

          <Panel title="Notes">
            {lead.notes.length === 0 ? (
              <EmptyState>No notes yet. Record calls and what was agreed here.</EmptyState>
            ) : (
              <ul className="c-admin-notes">
                {lead.notes.map((note) => (
                  <li key={note.id}>
                    <p>{note.text}</p>
                    <small>
                      {note.authorName} · {format.dateTime(note.at)}
                    </small>
                  </li>
                ))}
              </ul>
            )}
            <AdminForm action={addLeadNote} submitLabel="Add note" resetOnSuccess quiet>
              <input type="hidden" name="id" value={lead.id} />
              <Field label="New note">
                <textarea className="c-input" name="text" rows={3} maxLength={2000} required />
              </Field>
            </AdminForm>
          </Panel>
        </div>

        <div className="c-admin-stack">
          <Panel title="Status">
            <AdminForm action={updateLeadStatus} submitLabel="Save status">
              <input type="hidden" name="id" value={lead.id} />
              <Field label="Where this enquiry stands">
                <select className="c-input" name="status" defaultValue={lead.status}>
                  {LEAD_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {LEAD_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </Field>
            </AdminForm>
          </Panel>

          <Panel title="Customer">
            {customer ? (
              <>
                <p className="c-admin-muted">This phone number belongs to a customer.</p>
                <Link href={`${ADMIN_ROUTES.customers}/${customer.id}`} className="c-button">
                  Open {customer.name}
                </Link>
              </>
            ) : (
              <>
                <p className="c-admin-muted">
                  When the job is agreed, save this person as a customer. The enquiry is marked as Won.
                </p>
                <AdminForm action={convertLeadToCustomer} submitLabel="Convert to customer" quiet>
                  <input type="hidden" name="leadId" value={lead.id} />
                </AdminForm>
              </>
            )}
          </Panel>

          <Panel title="Follow-up">
            <AdminForm action={updateLeadFollowUp} submitLabel="Save date" quiet>
              <input type="hidden" name="id" value={lead.id} />
              <Field label="Contact again on" hint="Leave empty to clear. Due dates show on the dashboard.">
                <input
                  className="c-input"
                  type="date"
                  name="followUpAt"
                  defaultValue={lead.followUpAt?.toISOString().slice(0, 10) ?? ''}
                />
              </Field>
            </AdminForm>
          </Panel>

          <Panel title="Consent">
            <p className="c-admin-muted">
              Agreed to the privacy policy (version {lead.consent.policyVersion}) on {format.dateTime(lead.consent.at)}.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}
