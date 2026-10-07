import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { login } from '@/app/actions/admin';
import { AdminForm } from '@/components/admin/admin-form';
import { Field } from '@/components/admin/ui';
import { ADMIN_ROUTES } from '@/lib/admin/constants';
import { getSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = { title: 'Sign in' };

export default async function AdminLoginPage() {
  if (await getSession()) redirect(ADMIN_ROUTES.dashboard);
  return (
    <main className="c-admin-login">
      <div className="c-admin-login-card">
        <p className="c-admin-brand">{siteConfig.business.shortName}</p>
        <h1>Sign in to the admin panel</h1>
        <AdminForm action={login} submitLabel="Sign in">
          <Field label="Email">
            <input className="c-input" type="email" name="email" autoComplete="username" required autoFocus />
          </Field>
          <Field label="Password">
            <input className="c-input" type="password" name="password" autoComplete="current-password" required />
          </Field>
        </AdminForm>
        <p className="c-admin-login-help">Forgot your password? Ask the account owner to set a new one.</p>
      </div>
    </main>
  );
}
