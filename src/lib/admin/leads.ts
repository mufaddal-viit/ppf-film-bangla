import 'server-only';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { leadTypeSchema } from '@/lib/config/schema';
import { auditRepository } from '@/lib/db/repositories/audit.repository';
import { leadRepository, type Lead, type LeadFilter } from '@/lib/db/repositories/lead.repository';
import { ActionError, adminAction } from './action';
import { ADMIN_ROUTES, LEAD_STATUSES, LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from './constants';
import { toCsv, type CsvColumn } from './csv';

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

const CSV_COLUMNS: Array<CsvColumn<Lead>> = [
  { header: 'Received', value: (l) => l.createdAt.toISOString() },
  { header: 'Status', value: (l) => LEAD_STATUS_LABELS[l.status] },
  { header: 'Type', value: (l) => LEAD_TYPE_LABELS[l.type] },
  { header: 'Name', value: (l) => l.name },
  { header: 'Phone', value: (l) => l.phone, phone: true },
  { header: 'Email', value: (l) => l.email },
  { header: 'Product', value: (l) => l.service },
  { header: 'Vehicle', value: (l) => [l.vehicle?.make, l.vehicle?.model, l.vehicle?.year].filter(Boolean).join(' ') },
  { header: 'Preferred time', value: (l) => l.preferredTime },
  { header: 'Message', value: (l) => l.message },
  { header: 'Follow-up', value: (l) => l.followUpAt?.toISOString().slice(0, 10) },
  { header: 'Language', value: (l) => l.locale },
  { header: 'Page', value: (l) => l.sourcePage },
  { header: 'Source', value: (l) => l.utm?.source },
  { header: 'Medium', value: (l) => l.utm?.medium },
  { header: 'Campaign', value: (l) => l.utm?.campaign },
];

export function leadsToCsv(leads: Lead[]): string {
  return toCsv(CSV_COLUMNS, leads);
}
