import type { Metadata } from 'next';
import { EmptyState, PageHead } from '@/components/admin/ui';
import { adminDates } from '@/lib/admin/format';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import { auditRepository } from '@/lib/db/repositories/audit.repository';

export const metadata: Metadata = { title: 'Activity' };

const ACTION_LABELS: Record<string, string> = {
  'auth.signed_in': 'Signed in',
  'auth.signed_out': 'Signed out',
  'account.password_changed': 'Changed own password',
  'user.created': 'Added a user',
  'user.updated': 'Updated a user',
  'user.password_reset': 'Reset a password',
  'lead.status_changed': 'Changed lead status',
  'lead.follow_up_set': 'Set a follow-up',
  'lead.note_added': 'Added a lead note',
  'lead.exported': 'Exported leads',
};

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
                  <td>{format.dateTime(entry.at)}</td>
                  <td>{entry.actorEmail}</td>
                  <td>{ACTION_LABELS[entry.action] ?? entry.action}</td>
                  <td>{[entry.target, entry.detail].filter(Boolean).join(' · ') || '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
