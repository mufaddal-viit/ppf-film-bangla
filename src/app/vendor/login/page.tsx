import { BadgeCheck, CarFront, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { vendorLogin } from '@/app/actions/vendor';
import { AdminForm } from '@/components/admin/admin-form';
import { LoginShell } from '@/components/admin/login-shell';
import { Field } from '@/components/admin/ui';
import { siteConfig } from '@/lib/config';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import { getVendorSession } from '@/lib/vendor/session';

export const metadata: Metadata = { title: 'Sign in' };

export default async function VendorLoginPage() {
  if (await getVendorSession()) redirect(VENDOR_ROUTES.dashboard);

  return (
    <LoginShell
      brand={siteConfig.business}
      eyebrow="Vendor portal"
      title="Sign in to the vendor portal"
      intro="Your shop, your customers and their warranties."
      help={`Forgot your password, or no sign-in yet? Ask ${siteConfig.business.name} to set one up for you.`}
      homeHref={`/${siteConfig.locale.defaultLocale}`}
      headline="Every installation, backed by a warranty."
      chips={[
        { icon: CarFront, label: 'Customers' },
        { icon: ShieldCheck, label: 'Warranties' },
        { icon: BadgeCheck, label: 'Genuine film' },
      ]}
    >
      <AdminForm action={vendorLogin} submitLabel="Sign in">
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
