import type { ThemeConfig } from '../src/lib/config/schema';

/**
 * Design tokens. Changing the look of the site means editing only this file
 * (plus config/fonts.ts if you add a new font family).
 * "midnight": ink-black neutrals with the blue from the Phantom PPF logo. The site runs in its light mode.
 */
export const theme = {
  active: 'midnight',
  mode: 'light',
  themes: {
    midnight: {
      fonts: { body: 'inter', heading: 'archivo', arabic: 'ibmPlexArabic', display: 'archivo' },
      radius: '0.5rem',
      spacingUnit: '0.25rem',
      containerWidth: '80rem',
      shadows: {
        sm: '0 1px 2px rgb(0 0 0 / 0.4)',
        md: '0 4px 12px rgb(0 0 0 / 0.45)',
        lg: '0 12px 32px rgb(0 0 0 / 0.5)',
      },
      modes: {
        dark: {
          background: 'oklch(0.145 0.004 260)',
          surface: 'oklch(0.195 0.006 260)',
          foreground: 'oklch(0.97 0.003 260)',
          muted: 'oklch(0.25 0.008 260)',
          mutedForeground: 'oklch(0.74 0.01 260)',
          primary: 'oklch(0.64 0.16 254)',
          primaryForeground: 'oklch(0.99 0 0)',
          accent: 'oklch(0.3 0.03 255)',
          accentForeground: 'oklch(0.97 0.003 260)',
          border: 'oklch(0.3 0.008 260)',
          ring: 'oklch(0.72 0.14 254)',
          success: 'oklch(0.72 0.17 150)',
          warning: 'oklch(0.8 0.15 80)',
          danger: 'oklch(0.68 0.2 25)',
        },
        light: {
          background: 'oklch(0.99 0.002 260)',
          surface: 'oklch(0.965 0.004 260)',
          foreground: 'oklch(0.18 0.006 260)',
          muted: 'oklch(0.93 0.006 260)',
          mutedForeground: 'oklch(0.45 0.01 260)',
          primary: 'oklch(0.52 0.16 254)',
          primaryForeground: 'oklch(0.99 0 0)',
          accent: 'oklch(0.94 0.02 255)',
          accentForeground: 'oklch(0.2 0.02 260)',
          border: 'oklch(0.88 0.006 260)',
          ring: 'oklch(0.52 0.16 254)',
          success: 'oklch(0.5 0.15 150)',
          warning: 'oklch(0.6 0.14 70)',
          danger: 'oklch(0.55 0.22 27)',
        },
      },
    },
  },
} satisfies ThemeConfig;
