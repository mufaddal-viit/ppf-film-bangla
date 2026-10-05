/**
 * Icon names that config and content may reference. Each maps to a lucide-react icon in
 * src/components/ui/icon.tsx. Add a name here and there to make a new icon available.
 */
export const ICON_NAMES = [
  'shield',
  'shield-check',
  'sparkles',
  'sun',
  'palette',
  'spray-can',
  'wind',
  'road',
  'badge-check',
  'warehouse',
  'clock',
  'star',
  'tag',
] as const;
export type IconName = (typeof ICON_NAMES)[number];
