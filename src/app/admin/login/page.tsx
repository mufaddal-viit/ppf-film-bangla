import { ContactRound, Inbox, Newspaper } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { login } from '@/app/actions/admin';
import { AdminForm } from '@/components/admin/admin-form';
import { Field } from '@/components/admin/ui';
import { ADMIN_ROUTES } from '@/lib/admin/constants';
import { getSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = { title: 'Sign in' };

/** Photos on the tilted wall beside the form, in reading order. The shape sets the tile height. */
const WALL: Array<{ src: string; shape?: 'tall' | 'short' | 'long' }> = [
  { src: '/images/showcase/1.jpg' },
  { src: '/images/showcase/2.jpg', shape: 'long' },
  { src: '/images/facility/3.jpg' },
  { src: '/images/showcase/4.jpg', shape: 'short' },
  { src: '/images/showcase/3.jpg', shape: 'tall' },
];

export default async function AdminLoginPage() {
  if (await getSession()) redirect(ADMIN_ROUTES.dashboard);
  const { name, logo } = siteConfig.business;

  return (
    <main className="c-admin-login">
      <section className="c-admin-login-panel">
        <Image className="c-admin-logo" src={logo.src} alt={name} width={logo.width} height={logo.height} priority />
        <div className="c-admin-login-card">
          <p className="c-admin-eyebrow">Admin panel</p>
          <h1>Sign in to the admin panel</h1>
          <p className="c-admin-muted">Enquiries, customers and the blog in one place.</p>
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
        <a className="c-admin-back" href={`/${siteConfig.locale.defaultLocale}`}>
          Back to the website
        </a>
      </section>

      {/* Decoration only: the photos and the short lines over them add nothing a screen reader user needs. */}
      <aside className="c-admin-login-art" aria-hidden="true">
        <div className="c-admin-login-wall">
          <div className="c-admin-login-mosaic">
            {WALL.map((photo, index) => (
              <div key={photo.src} data-shape={photo.shape}>
                <Image src={photo.src} alt="" fill sizes="(min-width: 64rem) 22vw, 45vw" priority={index === 0} />
              </div>
            ))}
          </div>
        </div>
        <div className="c-admin-login-caption">
          <p>Protect every car. Follow up every lead.</p>
          <ul>
            <li>
              <Inbox focusable="false" />
              Leads
            </li>
            <li>
              <ContactRound focusable="false" />
              Customers
            </li>
            <li>
              <Newspaper focusable="false" />
              Blog
            </li>
          </ul>
        </div>
        <Image
          className="c-admin-login-car"
          src="/images/hero/car-blue.webp"
          alt=""
          width={2049}
          height={606}
          sizes="(min-width: 64rem) 60vw, 100vw"
          priority
        />
      </aside>
    </main>
  );
}
