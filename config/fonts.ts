import { Archivo, IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';
import type { FontKey } from '../src/lib/config/schema';

/**
 * next/font only accepts literal options, so font loaders live here and themes
 * reference them by key. To add a font: add a loader, add its key to FONT_KEYS
 * in src/lib/config/schema.ts, then reference it from config/theme.ts.
 */
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
// Variable width axis: headings use the normal width, the hero wordmark stretches it to 125%.
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' });
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-ibm-plex-arabic',
  // Not preloaded (it would load on English pages too). 'optional' means it never swaps in late,
  // so Arabic pages have no layout shift; it is used from cache on later page views.
  display: 'optional',
  preload: false,
});

export const fonts: Record<FontKey, { className: string; cssVar: string }> = {
  inter: { className: inter.variable, cssVar: '--font-inter' },
  archivo: { className: archivo.variable, cssVar: '--font-archivo' },
  ibmPlexArabic: { className: ibmPlexArabic.variable, cssVar: '--font-ibm-plex-arabic' },
};
