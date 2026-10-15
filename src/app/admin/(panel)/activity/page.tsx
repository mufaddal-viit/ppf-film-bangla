import type { Metadata } from 'next';
import { EmptyState, PageHead } from '@/components/admin/ui';
import { AUDIT_ACTION_LABELS } from '@/lib/admin/constants';
import { adminDates } from '@/lib/admin/format';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import { auditRepository } from '@/lib/db/repositories/audit.repository';

export const metadata: Metadata = { title: 'Activity' };

const LIMIT = 200;

export default async function AdminActivityPage() {
  await requireSession('owner');
  const entries = await auditRepository.recent(LIMIT);
  const format = adminDates(siteConfig.locale.timezone);

  return (
    <>
      <PageHead title="Activity" intro={`The last ${LIMIT} changes made in the admin panel.`} />
      {entries.length === 0 ? (
        <EmptyState>Nothing recorded yet.</EmptyState>
      ) : (
        <div className="c-admin-table">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Who</th>
                <th>What</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td data-label="When">{format.dateTime(entry.at)}</td>
                  <td data-label="Who">{entry.actorEmail}</td>
                  <td data-cell="title">{AUDIT_ACTION_LABELS[entry.action] ?? entry.action}</td>
                  <td data-label="Detail">{[entry.target, entry.detail].filter(Boolean).join(' · ') || '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
