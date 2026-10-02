import 'server-only';
import { fonts } from '@config/fonts';
import { siteConfig, themeConfig } from '@/lib/config';
import type { ColorTokens } from '@/lib/config/schema';

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function colorVars(tokens: ColorTokens): string {
  return Object.entries(tokens)
    .map(([key, value]) => `--${kebab(key)}:${value};`)
    .join('');
}

/**
 * CSS variables for every theme and mode, scoped by [data-theme][data-mode] on <html>.
 * globals.css maps Tailwind utilities (bg-primary, rounded-lg, ...) onto these variables.
 */
export function buildThemeCss(): string {
  const rtlSelectors = siteConfig.locale.rtlLocales.map((l) => `:root:lang(${l})`).join(',');
  return Object.entries(themeConfig.themes)
    .map(([name, t]) => {
      const scope = `[data-theme="${name}"]`;
      const base =
        `${scope}{` +
        `--ff-body:var(${fonts[t.fonts.body].cssVar});` +
        `--ff-heading:var(${fonts[t.fonts.heading].cssVar});` +
        `--radius:${t.radius};--space-unit:${t.spacingUnit};--container-width:${t.containerWidth};` +
        `--elevation-sm:${t.shadows.sm};--elevation-md:${t.shadows.md};--elevation-lg:${t.shadows.lg};}`;
      const rtl = rtlSelectors
        ? `${rtlSelectors.replaceAll(':root', `:root${scope}`)}{--ff-body:var(${fonts[t.fonts.arabic].cssVar});--ff-heading:var(${fonts[t.fonts.arabic].cssVar});}`
        : '';
      const modes = Object.entries(t.modes)
        .filter((entry): entry is [string, ColorTokens] => entry[1] !== undefined)
        .map(([mode, tokens]) => `${scope}[data-mode="${mode}"]{color-scheme:${mode};${colorVars(tokens)}}`)
        .join('');
      return base + rtl + modes;
    })
    .join('');
}

export function themeAttributes() {
  return {
    'data-theme': themeConfig.active,
    'data-mode': themeConfig.mode,
    className: Object.values(fonts)
      .map((f) => f.className)
      .join(' '),
  };
}

/** Used for <meta name="theme-color"> and the web manifest. */
export function themeBackground(): string {
  const active = themeConfig.themes[themeConfig.active]!;
  const tokens = themeConfig.mode === 'light' && active.modes.light ? active.modes.light : active.modes.dark;
  return tokens.background;
}
