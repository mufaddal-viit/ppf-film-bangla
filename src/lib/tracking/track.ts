import 'client-only';
import type { LeadType } from '@/lib/config/schema';
import { getConsent } from './consent';

export type TrackEvent =
  | { name: 'form_submit'; form: LeadType }
  | { name: 'whatsapp_click'; location: string }
  | { name: 'call_click'; location: string }
  | { name: 'directions_click'; location: string };

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

/** Pushes an event to the GTM data layer, only when the visitor has accepted analytics. */
export function track({ name, ...params }: TrackEvent): void {
  if (getConsent() !== 'granted') return;
  window.dataLayer ??= [];
  window.dataLayer.push({ event: name, ...params });
}
