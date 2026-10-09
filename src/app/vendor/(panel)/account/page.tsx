import type { Metadata } from 'next';
import { vendorChangePassword } from '@/app/actions/vendor';
import { AdminForm } from '@/components/admin/admin-form';
import { Field, PageHead, Panel } from '@/components/admin/ui';
import { PASSWORD_MIN_LENGTH } from '@/lib/admin/constants';
import { requireVendorSession } from '@/lib/vendor/session';

export const metadata: Metadata = { title: 'Your account' };

export default async function VendorAccountPage() {
  const session = await requireVendorSession({ allowTemporaryPassword: true });
  const temporary = session.mustChangePassword;

  return (
    <>
      <PageHead title="Your account" intro={`${session.email} · ${session.vendor.shopName}`} />
      {temporary && (
        <p className="c-admin-notice">
          You signed in with a temporary password. Choose your own password to open the rest of the portal.
        </p>
      )}
      <Panel title={temporary ? 'Choose your password' : 'Change password'} className="c-admin-narrow">
        <AdminForm action={vendorChangePassword} submitLabel={temporary ? 'Save password' : 'Change password'}>
          <Field label={temporary ? 'Temporary password' : 'Current password'}>
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
