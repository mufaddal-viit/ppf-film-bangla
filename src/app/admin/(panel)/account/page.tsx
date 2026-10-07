import type { Metadata } from 'next';
import { changePassword } from '@/app/actions/admin';
import { AdminForm } from '@/components/admin/admin-form';
import { Field, PageHead, Panel } from '@/components/admin/ui';
import { PASSWORD_MIN_LENGTH, ROLE_LABELS } from '@/lib/admin/constants';
import { requireSession } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'Your account' };

export default async function AdminAccountPage() {
  const session = await requireSession();
  return (
    <>
      <PageHead title="Your account" intro={`${session.email} · ${ROLE_LABELS[session.role]}`} />
      <Panel title="Change password" className="c-admin-narrow">
        <AdminForm action={changePassword} submitLabel="Change password" resetOnSuccess>
          <Field label="Current password">
            <input
              className="c-input"
              type="password"
              name="currentPassword"
              autoComplete="current-password"
              required
            />
          </Field>
          <Field
            label="New password"
            hint={`At least ${PASSWORD_MIN_LENGTH} characters. Other devices are signed out.`}
          >
            <input className="c-input" type="password" name="newPassword" autoComplete="new-password" required />
          </Field>
        </AdminForm>
      </Panel>
    </>
  );
}
