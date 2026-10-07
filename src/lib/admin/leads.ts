import 'server-only';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { leadTypeSchema } from '@/lib/config/schema';
import { auditRepository } from '@/lib/db/repositories/audit.repository';
import { leadRepository, type Lead, type LeadFilter } from '@/lib/db/repositories/lead.repository';
import { ActionError, adminAction } from './action';
import { ADMIN_ROUTES, LEAD_STATUSES, LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from './constants';

const idSchema = z.string().regex(/^[0-9a-f]{24}$/);
const NOT_FOUND = 'That enquiry no longer exists.';

function refresh(id: string) {
  revalidatePath(ADMIN_ROUTES.leads);
  revalidatePath(`${ADMIN_ROUTES.leads}/${id}`);
  revalidatePath(ADMIN_ROUTES.dashboard);
}

export const updateLeadStatus = adminAction({
  name: 'lead.set_status',
  schema: z.object({ id: idSchema, status: z.enum(LEAD_STATUSES) }),
  async handler({ id, status }, session) {
    if (!(await leadRepository.setStatus(id, status))) throw new ActionError(NOT_FOUND);
    await auditRepository.record(session, 'lead.status_changed', id, status);
    refresh(id);
    return `Status set to ${LEAD_STATUS_LABELS[status]}.`;
  },
});

export const updateLeadFollowUp = adminAction({
  name: 'lead.set_follow_up',
  schema: z.object({
    id: idSchema,
    // <input type="date"> value; empty clears the follow-up.
    followUpAt: z.union([z.literal(''), z.iso.date('Choose a valid date.')]),
  }),
  async handler({ id, followUpAt }, session) {
    // Stored as midday UTC so the date reads the same in every Gulf and European timezone.
    const at = followUpAt ? new Date(`${followUpAt}T12:00:00.000Z`) : null;
    if (!(await leadRepository.setFollowUp(id, at))) throw new ActionError(NOT_FOUND);
    await auditRepository.record(session, 'lead.follow_up_set', id, followUpAt || 'cleared');
    refresh(id);
    return at ? 'Follow-up date saved.' : 'Follow-up cleared.';
  },
});

export const addLeadNote = adminAction({
  name: 'lead.add_note',
  schema: z.object({ id: idSchema, text: z.string().trim().min(1, 'Write a note first.').max(2000) }),
  async handler({ id, text }, session) {
    if (!(await leadRepository.addNote(id, { text, authorName: session.name }))) throw new ActionError(NOT_FOUND);
    await auditRepository.record(session, 'lead.note_added', id);
    refresh(id);
    return 'Note added.';
  },
});

/** Reads list filters from the URL. Unknown values are ignored instead of failing the page. */
export function parseLeadFilter(params: Record<string, string | string[] | undefined>): LeadFilter {
  const first = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
  };
  const status = z.enum(LEAD_STATUSES).safeParse(first('status'));
  const type = leadTypeSchema.safeParse(first('type'));
  return {
    ...(status.success && { status: status.data }),
    ...(type.success && { type: type.data }),
    ...(first('q') && { q: first('q')!.slice(0, 100) }),
  };
}

// ---------------------------------------------------------------- CSV export

const CSV_COLUMNS: Array<[header: string, value: (lead: Lead) => string | number | undefined]> = [
  ['Received', (l) => l.createdAt.toISOString()],
  ['Status', (l) => LEAD_STATUS_LABELS[l.status]],
  ['Type', (l) => LEAD_TYPE_LABELS[l.type]],
  ['Name', (l) => l.name],
  ['Phone', (l) => l.phone],
  ['Email', (l) => l.email],
  ['Product', (l) => l.service],
  ['Vehicle', (l) => [l.vehicle?.make, l.vehicle?.model, l.vehicle?.year].filter(Boolean).join(' ')],
  ['Preferred time', (l) => l.preferredTime],
  ['Message', (l) => l.message],
  ['Follow-up', (l) => l.followUpAt?.toISOString().slice(0, 10)],
  ['Language', (l) => l.locale],
  ['Page', (l) => l.sourcePage],
  ['Source', (l) => l.utm?.source],
  ['Medium', (l) => l.utm?.medium],
  ['Campaign', (l) => l.utm?.campaign],
];

/**
 * Visitors type these values, so a cell starting with = + - @ could run as a formula when
 * the file is opened in Excel. Such cells get a leading apostrophe; phone numbers keep their +.
 */
function csvCell(value: string | number | undefined, isPhone = false): string {
  let text = value === undefined ? '' : String(value);
  if (!isPhone && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function leadsToCsv(leads: Lead[]): string {
  const rows = [
    CSV_COLUMNS.map(([header]) => header).join(','),
    ...leads.map((lead) => CSV_COLUMNS.map(([header, value]) => csvCell(value(lead), header === 'Phone')).join(',')),
  ];
  // The BOM makes Excel read the file as UTF-8, which Arabic names need.
  return `﻿${rows.join('\r\n')}\r\n`;
}
