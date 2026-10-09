import { ContactRound, Inbox, Newspaper, type LucideIcon } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';

/** Photos on the tilted wall beside the form, in reading order. The shape sets the tile height. */
const WALL: Array<{ src: string; shape?: 'tall' | 'short' | 'long' }> = [
  { src: '/images/showcase/1.jpg' },
  { src: '/images/showcase/2.jpg', shape: 'long' },
  { src: '/images/facility/3.jpg' },
  { src: '/images/showcase/4.jpg', shape: 'short' },
  { src: '/images/showcase/3.jpg', shape: 'tall' },
];

const DEFAULT_CHIPS: Array<{ icon: LucideIcon; label: string }> = [
  { icon: Inbox, label: 'Leads' },
  { icon: ContactRound, label: 'Customers' },
  { icon: Newspaper, label: 'Blog' },
];

type LoginShellProps = {
  brand: { name: string; logo: { src: string; width: number; height: number } };
  eyebrow: string;
  title: string;
  intro: string;
  help: string;
  /** Where "Back to the website" goes. */
  homeHref: string;
  /** The line and the chips over the photos. */
  headline?: string;
  chips?: Array<{ icon: LucideIcon; label: string }>;
  /** The sign-in form. */
  children: ReactNode;
};

/** Sign-in page layout shared by the admin panel and the vendor portal: form on the left, photo wall on the right. */
export function LoginShell({
  brand,
  eyebrow,
  title,
  intro,
  help,
  homeHref,
  headline = 'Protect every car. Follow up every lead.',
  chips = DEFAULT_CHIPS,
  children,
}: LoginShellProps) {
  return (
    <main className="c-admin-login">
      <section className="c-admin-login-panel">
        <Image
          className="c-admin-logo"
          src={brand.logo.src}
          alt={brand.name}
          width={brand.logo.width}
          height={brand.logo.height}
          priority
        />
        <div className="c-admin-login-card">
          <p className="c-admin-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="c-admin-muted">{intro}</p>
          {children}
          <p className="c-admin-login-help">{help}</p>
        </div>
        <a className="c-admin-back" href={homeHref}>
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
          <p>{headline}</p>
          <ul>
            {chips.map(({ icon: Icon, label }) => (
              <li key={label}>
                <Icon focusable="false" />
                {label}
              </li>
            ))}
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
