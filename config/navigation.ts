import type { NavigationConfig } from '../src/lib/config/schema';

/** Labels are keys into content/{locale}/messages.json under "nav". */
export const navigation = {
  header: [
    { labelKey: 'services', href: { servicesMenu: true } },
    { labelKey: 'prices', href: { route: '/prices' } },
    { labelKey: 'gallery', href: { route: '/gallery' } },
    { labelKey: 'about', href: { route: '/about' } },
    { labelKey: 'blog', href: { route: '/blog' } },
    { labelKey: 'contact', href: { route: '/contact' } },
  ],
  footer: [
    {
      titleKey: 'services',
      links: [
        { labelKey: 'ppf', href: { service: 'paint-protection-film' } },
        { labelKey: 'ceramic', href: { service: 'ceramic-coating' } },
        { labelKey: 'tint', href: { service: 'window-tinting' } },
        { labelKey: 'wrap', href: { service: 'car-wrapping' } },
        { labelKey: 'detailing', href: { service: 'detailing' } },
      ],
    },
    {
      titleKey: 'company',
      links: [
        { labelKey: 'about', href: { route: '/about' } },
        { labelKey: 'gallery', href: { route: '/gallery' } },
        { labelKey: 'prices', href: { route: '/prices' } },
        { labelKey: 'blog', href: { route: '/blog' } },
        { labelKey: 'contact', href: { route: '/contact' } },
      ],
    },
  ],
  legal: [
    { labelKey: 'privacy', href: { route: '/privacy-policy' } },
    { labelKey: 'terms', href: { route: '/terms' } },
  ],
} satisfies NavigationConfig;
