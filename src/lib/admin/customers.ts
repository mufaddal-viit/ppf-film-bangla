import 'server-only';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { siteConfig } from '@/lib/config';
import { auditRepository } from '@/lib/db/repositories/audit.repository';
import { customerRepository, type Customer, type CustomerFilter } from '@/lib/db/repositories/customer.repository';
import { leadRepository } from '@/lib/db/repositories/lead.repository';
import { isDuplicateKeyError } from '@/lib/db/repositories/user.repository';
import { normalizePhone } from '@/lib/validation/lead';
import { ActionError, adminAction } from './action';
import { ADMIN_ROUTES, CUSTOMER_SEGMENTS } from './constants';
import { toCsv, type CsvColumn } from './csv';

const idSchema = z.string().regex(/^[0-9a-f]{24}$/);
const NOT_FOUND = 'That customer no longer exists.';
const DUPLICATE = 'A customer with that phone number already exists.';

const checkbox = z
  .string()
  .optional()
  .transform((value) => value === 'on');

const phoneSchema = z
  .string()
  .trim()
  .max(30)
  .transform((value, ctx) => {
    const e164 = normalizePhone(value, siteConfig.locale.phoneRegion);
    if (!e164) {
      ctx.addIssue({ code: 'custom', message: 'Enter a valid phone number, with the country code if it is abroad.' });
      return z.NEVER;
    }
    return e164;
  });

/** "PPF, Fleet " -> ["ppf", "fleet"]. */
export function parseTags(input: string): string[] {
  return [
    ...new Set(
      input
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ].slice(0, 10);
}

const detailsSchema = z.object({
  name: z.string().trim().min(2, 'Enter the customer name.').max(100),
  phone: phoneSchema,
  email: z.union([z.literal(''), z.email('Enter a valid email address.').max(254)]),
  tags: z.string().max(200).transform(parseTags),
  marketingOptIn: checkbox,
});

const maxYear = new Date().getFullYear() + 1;
const vehicleSchema = z.object({
  make: z.string().trim().min(1, 'Enter the make, for example Toyota.').max(40),
  model: z.string().trim().min(1, 'Enter the model.').max(40),
  year: z.union([z.literal(''), z.coerce.number().int().min(1950).max(maxYear, 'Enter a valid year.')]),
  plate: z.string().trim().max(20),
});

function refresh(id?: string) {
  revalidatePath(ADMIN_ROUTES.customers);
  revalidatePath(ADMIN_ROUTES.dashboard);
  if (id) revalidatePath(`${ADMIN_ROUTES.customers}/${id}`);
}

export const createCustomer = adminAction({
  name: 'customer.create',
  schema: detailsSchema,
  async handler({ email, ...details }, session) {
    let id: string;
    try {
      ({ id } = await customerRepository.create({ ...details, ...(email && { email }) }));
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new ActionError(DUPLICATE);
      throw error;
    }
    await auditRepository.record(session, 'customer.created', id);
    refresh();
    redirect(`${ADMIN_ROUTES.customers}/${id}`);
  },
});

export const updateCustomer = adminAction({
  name: 'customer.update',
  schema: detailsSchema.extend({ id: idSchema }),
  async handler({ id, email, ...details }, session) {
    try {
      const found = await customerRepository.updateDetails({ ...details, ...(email && { email }) }, id);
      if (!found) throw new ActionError(NOT_FOUND);
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new ActionError(DUPLICATE);
      throw error;
    }
    await auditRepository.record(session, 'customer.updated', id);
    refresh(id);
    return 'Saved.';
  },
});

export const addCustomerVehicle = adminAction({
  name: 'customer.add_vehicle',
  schema: vehicleSchema.extend({ id: idSchema }),
  async handler({ id, make, model, year, plate }, session) {
    const vehicle = { make, model, ...(year !== '' && { year }), ...(plate && { plate }) };
    if (!(await customerRepository.addVehicle(id, vehicle))) throw new ActionError(NOT_FOUND);
    await auditRepository.record(session, 'customer.vehicle_added', id, `${make} ${model}`);
    refresh(id);
    return 'Vehicle added.';
  },
});

export const removeCustomerVehicle = adminAction({
  name: 'customer.remove_vehicle',
  schema: z.object({ id: idSchema, vehicleId: z.uuid() }),
  async handler({ id, vehicleId }, session) {
    if (!(await customerRepository.removeVehicle(id, vehicleId))) throw new ActionError(NOT_FOUND);
    await auditRepository.record(session, 'customer.vehicle_removed', id);
    refresh(id);
    return 'Vehicle removed.';
  },
});

export const addCustomerNote = adminAction({
  name: 'customer.add_note',
  schema: z.object({ id: idSchema, text: z.string().trim().min(1, 'Write a note first.').max(2000) }),
  async handler({ id, text }, session) {
    if (!(await customerRepository.addNote(id, { text, authorName: session.name }))) throw new ActionError(NOT_FOUND);
    await auditRepository.record(session, 'customer.note_added', id);
    refresh(id);
    return 'Note added.';
  },
});

export const markCustomerContacted = adminAction({
  name: 'customer.mark_contacted',
  schema: z.object({ id: idSchema }),
  async handler({ id }, session) {
    if (!(await customerRepository.markContacted(id))) throw new ActionError(NOT_FOUND);
    await auditRepository.record(session, 'customer.contacted', id);
    refresh(id);
    return 'Marked as contacted today.';
  },
});

/** Turns an enquiry into a customer, or opens the existing customer with the same phone number. */
export const convertLeadToCustomer = adminAction({
  name: 'lead.convert',
  schema: z.object({ leadId: idSchema }),
  async handler({ leadId }, session) {
    const lead = await leadRepository.findById(leadId);
    if (!lead) throw new ActionError('That enquiry no longer exists.');

    let id = (await customerRepository.findByPhone(lead.phone))?.id;
    if (!id) {
      const { make, model, year } = lead.vehicle ?? {};
      ({ id } = await customerRepository.create({
        name: lead.name,
        phone: lead.phone,
        ...(lead.email && { email: lead.email }),
        tags: lead.service ? [lead.service] : [],
        // An enquiry is not agreement to receive offers; staff tick this after asking the customer.
        marketingOptIn: false,
        vehicles: make && model ? [{ make, model, ...(year && { year }) }] : [],
        leadId,
      }));
      await auditRepository.record(session, 'customer.created_from_lead', id, leadId);
    }
    if (lead.status !== 'won') {
      await leadRepository.setStatus(leadId, 'won');
      await auditRepository.record(session, 'lead.status_changed', leadId, 'won');
    }
    refresh();
    revalidatePath(ADMIN_ROUTES.leads);
    revalidatePath(`${ADMIN_ROUTES.leads}/${leadId}`);
    redirect(`${ADMIN_ROUTES.customers}/${id}`);
  },
});

/** Reads list filters from the URL. Unknown values are ignored instead of failing the page. */
export function parseCustomerFilter(params: Record<string, string | string[] | undefined>): CustomerFilter {
  const first = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
  };
  const segment = z.enum(CUSTOMER_SEGMENTS).safeParse(first('segment'));
  return {
    ...(segment.success && segment.data !== 'all' && { segment: segment.data }),
    ...(first('tag') && { tag: first('tag')!.slice(0, 40).toLowerCase() }),
    ...(first('q') && { q: first('q')!.slice(0, 100) }),
  };
}

const CSV_COLUMNS: Array<CsvColumn<Customer>> = [
  { header: 'Name', value: (c) => c.name },
  { header: 'Phone', value: (c) => c.phone, phone: true },
  { header: 'Email', value: (c) => c.email },
  { header: 'Agreed to offers', value: (c) => (c.marketingOptIn ? 'Yes' : 'No') },
  { header: 'Tags', value: (c) => c.tags.join('; ') },
  {
    header: 'Vehicles',
    value: (c) => c.vehicles.map((v) => [v.make, v.model, v.year].filter(Boolean).join(' ')).join('; '),
  },
  { header: 'Last contacted', value: (c) => c.lastContactedAt?.toISOString().slice(0, 10) },
  { header: 'Customer since', value: (c) => c.createdAt.toISOString().slice(0, 10) },
];

export function customersToCsv(customers: Customer[]): string {
  return toCsv(CSV_COLUMNS, customers);
}
