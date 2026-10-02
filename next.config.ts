import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { parseEnv } from './src/lib/env.schema';
import { securityHeaders } from './src/lib/security/headers';

// Fail `next dev` and `next build` early on missing or invalid environment variables.
const env = parseEnv(process.env);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders({
          isDev: env.NODE_ENV === 'development',
          https: env.NEXT_PUBLIC_SITE_URL.startsWith('https://'),
        }),
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const withMDX = createMDX();

export default withNextIntl(withMDX(nextConfig));
