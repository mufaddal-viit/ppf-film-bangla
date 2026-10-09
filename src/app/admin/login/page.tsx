import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { login } from '@/app/actions/admin';
import { AdminForm } from '@/components/admin/admin-form';
import { LoginShell } from '@/components/admin/login-shell';
import { Field } from '@/components/admin/ui';
import { ADMIN_ROUTES } from '@/lib/admin/constants';
import { getSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = { title: 'Sign in' };

export default async function AdminLoginPage() {
  if (await getSession()) redirect(ADMIN_ROUTES.dashboard);

  return (
    <LoginShell
      brand={siteConfig.business}
      eyebrow="Admin panel"
      title="Sign in to the admin panel"
      intro="Enquiries, customers and the blog in one place."
      help="Forgot your password? Ask the account owner to set a new one."
      homeHref={`/${siteConfig.locale.defaultLocale}`}
    >
      <AdminForm action={login} submitLabel="Sign in">
        <Field label="Email">
          <input className="c-input" type="email" name="email" autoComplete="username" required autoFocus />
        </Field>
        <Field label="Password">
          <input className="c-input" type="password" name="password" autoComplete="current-password" required />
        </Field>
      </AdminForm>
    </LoginShell>
  );
}
