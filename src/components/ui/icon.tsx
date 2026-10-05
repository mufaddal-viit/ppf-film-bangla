import {
  BadgeCheck,
  Clock,
  Palette,
  Route,
  Shield,
  ShieldCheck,
  Sparkles,
  SprayCan,
  Star,
  Sun,
  Tag,
  Warehouse,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import type { IconName } from '@/lib/icons';

const ICONS = {
  shield: Shield,
  'shield-check': ShieldCheck,
  sparkles: Sparkles,
  sun: Sun,
  palette: Palette,
  'spray-can': SprayCan,
  wind: Wind,
  road: Route,
  'badge-check': BadgeCheck,
  warehouse: Warehouse,
  clock: Clock,
  star: Star,
  tag: Tag,
} satisfies Record<IconName, LucideIcon>;

/** Decorative icon referenced by name from config or content. Hidden from screen readers. */
export function Icon({ name, className }: { name: IconName; className?: string }) {
  const Component = ICONS[name];
  return <Component aria-hidden="true" focusable="false" className={className ?? 'size-6'} />;
}
