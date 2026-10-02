import 'server-only';
import type { NewLead } from '@/lib/db/repositories/lead.repository';
import type { EmailMessage } from './index';

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Internal email to the business. Always in English: it is read by staff, not the customer. */
export function leadNotificationEmail(lead: NewLead, id: string, to: string[], businessName: string): EmailMessage {
  const vehicle = [lead.vehicle?.make, lead.vehicle?.model, lead.vehicle?.year].filter(Boolean).join(' ');
  const utm = lead.utm
    ? Object.entries(lead.utm)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ')
    : '';
  const rows: Array<[string, string | undefined]> = [
    ['Type', lead.type],
    ['Name', lead.name],
    ['Phone', lead.phone],
    ['Email', lead.email],
    ['Service', lead.service],
    ['Vehicle', vehicle || undefined],
    ['Best time to call', lead.preferredTime],
    ['Message', lead.message],
    ['Language', lead.locale],
    ['Page', lead.sourcePage],
    ['Landing page', lead.landingPage],
    ['Referrer', lead.referrer],
    ['UTM', utm || undefined],
    ['Lead ID', id],
  ];
  const present = rows.filter((row): row is [string, string] => Boolean(row[1]));

  return {
    to,
    subject: `New ${lead.type} request from ${lead.name} | ${businessName}`,
    replyTo: lead.email,
    text: present.map(([label, value]) => `${label}: ${value}`).join('\n'),
    html: `<table>${present
      .map(([label, value]) => `<tr><th align="left">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`)
      .join('')}</table>`,
  };
}
