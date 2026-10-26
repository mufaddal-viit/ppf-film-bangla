import { headers } from 'next/headers';
import { siteConfig } from '@/lib/config';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { invoiceRepository } from '@/lib/db/repositories/invoice.repository';
import { vendorRepository } from '@/lib/db/repositories/vendor.repository';
import { logger } from '@/lib/logger';
import { generateInvoicePdf } from '@/lib/pdf/invoice';
import { getLogoBytes } from '@/lib/pdf/logo';
import { rateLimit } from '@/lib/security/rate-limit';

const RATE_RULE = { requests: 20, windowSeconds: 60 };

/**
 * Download an invoice PDF. The invoice number acts as the access token (same as warranty PDFs).
 * Rate-limited to prevent enumeration.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;

  const h = await headers();
  const ip = h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const { success } = await rateLimit('invoice-pdf', ip, RATE_RULE);
  if (!success) {
    return new Response('Too many requests. Try again in a minute.', { status: 429 });
  }

  const invoice = await invoiceRepository.findByNumber(number);
  if (!invoice) {
    return new Response('Invoice not found.', { status: 404 });
  }

  const [customer, vendor] = await Promise.all([
    customerRepository.findById(invoice.customerId),
    vendorRepository.findById(invoice.vendorId),
  ]);

  if (!customer || !vendor) {
    logger.error('invoice_pdf.missing_data', { invoiceNumber: number });
    return new Response('Invoice data is incomplete.', { status: 500 });
  }

  const { contact, business } = siteConfig;
  const address = [contact.address.street, contact.address.area, contact.address.city, contact.address.emirate]
    .filter(Boolean)
    .join(', ');

  const logoBytes = await getLogoBytes();
  const pdfBytes = await generateInvoicePdf({
    invoice,
    businessName: business.name,
    businessPhone: contact.phone,
    businessAddress: address,
    businessEmail: contact.email,
    logoBytes,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerEmail: customer.email,
    vendorShopName: vendor.shopName,
  });

  return new Response(new Uint8Array(pdfBytes) as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.invoiceNumber}.pdf"`,
      'Cache-Control': 'private, max-age=60',
    },
  });
}
