import type { NavigationConfig } from '../src/lib/config/schema';

/** Labels are keys into content/{locale}/messages.json under "nav". */
export const navigation = {
  header: [
    { labelKey: 'services', href: { servicesMenu: true } },
    { labelKey: 'about', href: { route: '/about' } },
    { labelKey: 'contact', href: { route: '/contact' } },
  ],
  footer: [
    {
      titleKey: 'clearPpf',
      links: [
        { labelKey: 'apex', href: { service: 'apex' } },
        { labelKey: 'sapphire', href: { service: 'sapphire' } },
        { labelKey: 'opal', href: { service: 'opal' } },
        { labelKey: 'stealth', href: { service: 'stealth' } },
        { labelKey: 'frozen', href: { service: 'frozen' } },
      ],
    },
    {
      titleKey: 'windowFilm',
      links: [
        { labelKey: 'solaris', href: { service: 'solaris' } },
        { labelKey: 'luminox', href: { service: 'luminox' } },
      ],
    },
    {
      titleKey: 'company',
      links: [
        { labelKey: 'about', href: { route: '/about' } },
        { labelKey: 'allServices', href: { route: '/services' } },
        { labelKey: 'contact', href: { route: '/contact' } },
      ],
    },
  ],
  legal: [
    { labelKey: 'privacy', href: { route: '/privacy-policy' } },
    { labelKey: 'terms', href: { route: '/terms' } },
  ],
} satisfies NavigationConfig;
