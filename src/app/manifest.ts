import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config';
import { themeBackground } from '@/lib/theme';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.business.name,
    short_name: siteConfig.business.name,
    start_url: `/${siteConfig.locale.defaultLocale}`,
    display: 'standalone',
    background_color: themeBackground(),
    theme_color: themeBackground(),
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
