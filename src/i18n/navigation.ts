import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/** Locale-aware Link and hooks. Use these instead of next/link for internal routes. */
export const { Link, usePathname } = createNavigation(routing);
