/** Builds a wa.me click-to-chat link from an E.164 number and an optional prefilled message. */
export function buildWhatsAppUrl(e164: string, message?: string): string {
  const url = new URL(`https://wa.me/${e164.replace(/\D/g, '')}`);
  if (message) url.searchParams.set('text', message);
  return url.toString();
}
