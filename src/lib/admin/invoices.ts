import 'server-only';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { INVOICE_STATUSES, type InvoiceLineItem } from '@/lib/db/collections';
import { auditRepository } from '@/lib/db/repositories/audit.repository';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { installationRepository } from '@/lib/db/repositories/installation.repository';
import { invoiceRepository } from '@/lib/db/repositories/invoice.repository';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { vendorRepository } from '@/lib/db/repositories/vendor.repository';
import { siteConfig } from '@/lib/config';
import { ActionError, adminAction } from './action';
import { ADMIN_ROUTES } from './constants';

const idSchema = z.string().regex(/^[0-9a-f]{24}$/);

function refresh() {
  revalidatePath(ADMIN_ROUTES.invoices);
}

const lineItemSchema = z.object({
  description: z.string().trim().min(1).max(200),
  quantity: z.coerce.number().min(0.01).max(99999),
  unitPrice: z.coerce.number().min(0).max(999999),
  amount: z.coerce.number().min(0).max(99999999),
});

/** Compute totals from line items and VAT rate. */
function computeTotals(lineItems: InvoiceLineItem[], vatRate: number) {
  const subtotal = Math.round(lineItems.reduce((sum, li) => sum + li.amount, 0) * 100) / 100;
  const vatAmount = Math.round(subtotal * vatRate * 100) / 100;
  const total = Math.round((subtotal + vatAmount) * 100) / 100;
  return { subtotal, vatAmount, total };
}

/** Create an invoice from an installation, auto-populating the first line item. */
export const createInvoice = adminAction({
  name: 'invoice.create',
  role: 'owner',
  schema: z.object({
    installationId: idSchema,
    unitPrice: z.coerce.number('Enter the price.').min(0).max(999999),
    vatRate: z.coerce.number().min(0).max(1).default(0),
    notes: z.string().trim().max(1000).optional(),
  }),
  async handler(input, session) {
    const installation = await installationRepository.findById(input.installationId);
    if (!installation) throw new ActionError('That installation does not exist.');
    if (installation.voidedAt) throw new ActionError('Cannot invoice a voided installation.');

    const [customer, product, vendor] = await Promise.all([
      customerRepository.findById(installation.customerId),
      productRepository.findById(installation.productId),
      vendorRepository.findById(installation.vendorId),
    ]);
    if (!customer) throw new ActionError('Customer not found.');
    if (!vendor) throw new ActionError('Vendor not found.');

    const description = product
      ? `${product.name} (${product.finish}) — ${installation.area}, ${installation.metresUsed} m`
      : `Installation ${installation.warrantyNumber}`;
    const amount = Math.round(input.unitPrice * installation.metresUsed * 100) / 100;
    const lineItems: InvoiceLineItem[] = [
      { description, quantity: installation.metresUsed, unitPrice: input.unitPrice, amount },
    ];
    const { subtotal, vatAmount, total } = computeTotals(lineItems, input.vatRate);

    const { invoiceNumber } = await invoiceRepository.create({
      customerId: customer.id,
      vendorId: vendor.id,
      installationIds: [installation.id],
      lineItems,
      subtotal,
      vatRate: input.vatRate,
      vatAmount,
      total,
      currency: siteConfig.locale.currency,
      notes: input.notes,
    });

    await auditRepository.record(
      session,
      'invoice.created',
      invoiceNumber,
      `${siteConfig.locale.currency} ${total} for ${customer.name}`,
    );
    refresh();
    return `Invoice ${invoiceNumber} created as draft.`;
  },
});

/** Update line items on a draft invoice. */
export const updateInvoice = adminAction({
  name: 'invoice.update',
  role: 'owner',
  schema: z.object({
    id: idSchema,
    lineItems: z.preprocess(
      (val) => (typeof val === 'string' ? JSON.parse(val) : val),
      z.array(lineItemSchema).min(1, 'At least one line item is required.'),
    ),
    vatRate: z.coerce.number().min(0).max(1),
    notes: z.string().trim().max(1000).optional(),
  }),
  async handler(input, session) {
    const { subtotal, vatAmount, total } = computeTotals(input.lineItems, input.vatRate);
    const updated = await invoiceRepository.update(input.id, {
      lineItems: input.lineItems,
      subtotal,
      vatRate: input.vatRate,
      vatAmount,
      total,
      notes: input.notes,
    });
    if (!updated) throw new ActionError('Only draft invoices can be edited, or the invoice no longer exists.');
    const invoice = await invoiceRepository.findById(input.id);
    await auditRepository.record(session, 'invoice.updated', invoice?.invoiceNumber ?? input.id);
    refresh();
    return 'Invoice updated.';
  },
});

/** Change invoice status (issue, mark paid, cancel). */
export const setInvoiceStatus = adminAction({
  name: 'invoice.status',
  role: 'owner',
  schema: z.object({
    id: idSchema,
    status: z.enum(INVOICE_STATUSES),
  }),
  async handler(input, session) {
    const invoice = await invoiceRepository.setStatus(input.id, input.status);
    if (!invoice) throw new ActionError('That invoice does not exist.');
    await auditRepository.record(session, `invoice.${input.status}`, invoice.invoiceNumber);
    refresh();
    const labels: Record<string, string> = {
      issued: 'issued',
      paid: 'marked as paid',
      cancelled: 'cancelled',
      draft: 'reverted to draft',
    };
    return `Invoice ${invoice.invoiceNumber} ${labels[input.status] ?? input.status}.`;
  },
});
