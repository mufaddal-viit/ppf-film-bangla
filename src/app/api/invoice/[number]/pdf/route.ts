import { siteConfig } from '@/lib/config';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { invoiceRepository } from '@/lib/db/repositories/invoice.repository';
import { vendorRepository } from '@/lib/db/repositories/vendor.repository';
import { logger } from '@/lib/logger';
import { generateInvoicePdf } from '@/lib/pdf/invoice';
import { getLogoBytes } from '@/lib/pdf/logo';
import { getSession } from '@/lib/auth/session';
import { getVendorSession } from '@/lib/vendor/session';

/** Download an invoice PDF. Requires an admin session or a vendor session for the invoice's vendor. */
export async function GET(_request: Request, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;

  // Auth: admin or vendor.
  const [adminSession, vendorSession] = await Promise.all([getSession(), getVendorSession()]);
  if (!adminSession && !vendorSession) {
    return new Response('Sign in to download invoices.', { status: 401 });
  }

  const invoice = await invoiceRepository.findByNumber(number);
  if (!invoice) {
    return new Response('Invoice not found.', { status: 404 });
  }

  // Vendor can only download their own invoices.
  if (!adminSession && vendorSession && vendorSession.vendorId !== invoice.vendorId) {
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
      'Cache-Control': 'private, no-store',
    },
  });
}
