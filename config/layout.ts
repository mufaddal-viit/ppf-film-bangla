import type { LayoutConfig } from '../src/lib/config/schema';

/** Site-wide chrome rendered on every page. */
export const layout = {
  topBar: { enabled: true },
  header: { enabled: true, showQuoteButton: true },
  footer: { enabled: true },
  floatingActions: { enabled: true, actions: ['call', 'map', 'whatsapp'] },
} satisfies LayoutConfig;
