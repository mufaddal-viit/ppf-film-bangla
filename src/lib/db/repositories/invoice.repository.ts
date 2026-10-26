import 'server-only';
import { ObjectId, type Filter, type WithId } from 'mongodb';
import {
  countersCollection,
  invoicesCollection,
  type InvoiceDocument,
  type InvoiceLineItem,
  type InvoiceStatus,
} from '../collections';

export type Invoice = Omit<InvoiceDocument, '_id' | 'customerId' | 'vendorId' | 'installationIds'> & {
  id: string;
  customerId: string;
  vendorId: string;
  installationIds: string[];
};

export type InvoiceInput = {
  customerId: string;
  vendorId: string;
  installationIds: string[];
  lineItems: InvoiceLineItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  currency: string;
  notes?: string;
};

export type InvoiceFilter = {
  status?: InvoiceStatus;
  vendorId?: string;
  customerId?: string;
  q?: string;
};

function toInvoice(doc: WithId<InvoiceDocument>): Invoice {
  return {
    id: doc._id.toHexString(),
    invoiceNumber: doc.invoiceNumber,
    customerId: doc.customerId.toHexString(),
    vendorId: doc.vendorId.toHexString(),
    installationIds: doc.installationIds.map((id) => id.toHexString()),
    lineItems: doc.lineItems,
    subtotal: doc.subtotal,
    vatRate: doc.vatRate,
    vatAmount: doc.vatAmount,
    total: doc.total,
    currency: doc.currency,
    status: doc.status,
    notes: doc.notes,
    issuedAt: doc.issuedAt,
    paidAt: doc.paidAt,
    cancelledAt: doc.cancelledAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const counterId = `invoice-${year}`;
  const counters = await countersCollection();
  const result = await counters.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' },
  );
  return `INV-${year}-${String(result!.seq).padStart(5, '0')}`;
}

const escapeRegex = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function toQuery({ status, vendorId, customerId, q }: InvoiceFilter): Filter<InvoiceDocument> {
  const query: Filter<InvoiceDocument> = {};
  if (status) query.status = status;
  if (vendorId && ObjectId.isValid(vendorId)) query.vendorId = new ObjectId(vendorId);
  if (customerId && ObjectId.isValid(customerId)) query.customerId = new ObjectId(customerId);
  if (q) {
    query.$or = [{ invoiceNumber: { $regex: escapeRegex(q), $options: 'i' } }];
  }
  return query;
}

export const invoiceRepository = {
  async create(input: InvoiceInput): Promise<{ id: string; invoiceNumber: string }> {
    const invoiceNumber = await nextInvoiceNumber();
    const now = new Date();
    const result = await (
      await invoicesCollection()
    ).insertOne({
      invoiceNumber,
      customerId: new ObjectId(input.customerId),
      vendorId: new ObjectId(input.vendorId),
      installationIds: input.installationIds.map((id) => new ObjectId(id)),
      lineItems: input.lineItems,
      subtotal: input.subtotal,
      vatRate: input.vatRate,
      vatAmount: input.vatAmount,
      total: input.total,
      currency: input.currency,
      status: 'draft',
      ...(input.notes && { notes: input.notes }),
      createdAt: now,
      updatedAt: now,
    });
    return { id: result.insertedId.toHexString(), invoiceNumber };
  },

  async findById(id: string): Promise<Invoice | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await (await invoicesCollection()).findOne({ _id: new ObjectId(id) });
    return doc ? toInvoice(doc) : null;
  },

  async findByNumber(invoiceNumber: string): Promise<Invoice | null> {
    const doc = await (await invoicesCollection()).findOne({ invoiceNumber });
    return doc ? toInvoice(doc) : null;
  },

  async list(
    filter: InvoiceFilter,
    { skip, limit }: { skip: number; limit: number },
  ): Promise<{ items: Invoice[]; total: number }> {
    const collection = await invoicesCollection();
    const query = toQuery(filter);
    const [docs, total] = await Promise.all([
      collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);
    return { items: docs.map(toInvoice), total };
  },

  async listForVendor(vendorId: string): Promise<Invoice[]> {
    if (!ObjectId.isValid(vendorId)) return [];
    const docs = await (
      await invoicesCollection()
    )
      .find({ vendorId: new ObjectId(vendorId) })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map(toInvoice);
  },

  /** Update line items and totals. Only drafts can be edited. */
  async update(
    id: string,
    patch: {
      lineItems: InvoiceLineItem[];
      subtotal: number;
      vatRate: number;
      vatAmount: number;
      total: number;
      notes?: string;
    },
  ): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await (
      await invoicesCollection()
    ).updateOne(
      { _id: new ObjectId(id), status: 'draft' },
      {
        $set: {
          lineItems: patch.lineItems,
          subtotal: patch.subtotal,
          vatRate: patch.vatRate,
          vatAmount: patch.vatAmount,
          total: patch.total,
          ...(patch.notes ? { notes: patch.notes } : {}),
          updatedAt: new Date(),
        },
        ...(!patch.notes && { $unset: { notes: '' } }),
      },
    );
    return result.modifiedCount === 1;
  },

  /** Transition status. Returns false if the invoice doesn't exist or the transition is invalid. */
  async setStatus(id: string, status: InvoiceStatus): Promise<Invoice | null> {
    if (!ObjectId.isValid(id)) return null;
    const now = new Date();
    const dateField =
      status === 'issued'
        ? { issuedAt: now }
        : status === 'paid'
          ? { paidAt: now }
          : status === 'cancelled'
            ? { cancelledAt: now }
            : {};
    const doc = await (
      await invoicesCollection()
    ).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status, ...dateField, updatedAt: now } },
      { returnDocument: 'after' },
    );
    return doc ? toInvoice(doc) : null;
  },
};
