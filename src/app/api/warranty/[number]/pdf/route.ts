import { headers } from 'next/headers';
import { siteConfig } from '@/lib/config';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { installationRepository } from '@/lib/db/repositories/installation.repository';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { rollRepository } from '@/lib/db/repositories/roll.repository';
import { vendorRepository } from '@/lib/db/repositories/vendor.repository';
import { logger } from '@/lib/logger';
import { generateWarrantyCardPdf } from '@/lib/pdf/warranty-card';
import { rateLimit } from '@/lib/security/rate-limit';

const RATE_RULE = { requests: 20, windowSeconds: 60 };

/** Download a warranty card PDF. The warranty number acts as the access token — no auth needed. */
export async function GET(_request: Request, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;

  // Rate limit by IP.
  const h = await headers();
  const ip = h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const { success } = await rateLimit('warranty-pdf', ip, RATE_RULE);
  if (!success) {
    return new Response('Too many requests. Try again in a minute.', { status: 429 });
  }

  const installation = await installationRepository.findByWarrantyNumber(number);
  if (!installation) {
    return new Response('Warranty not found.', { status: 404 });
  }

  const [customer, product, vendor, roll] = await Promise.all([
    customerRepository.findById(installation.customerId),
    productRepository.findById(installation.productId),
    vendorRepository.findById(installation.vendorId),
    rollRepository.findById(installation.rollId),
  ]);

  if (!customer || !product || !vendor) {
    logger.error('warranty_pdf.missing_data', { warrantyNumber: number });
    return new Response('Warranty data is incomplete.', { status: 500 });
  }

  const vehicle = customer.vehicles.find((v) => v.id === installation.vehicleId) ?? null;
  const { contact, business } = siteConfig;
  const address = [contact.address.street, contact.address.area, contact.address.city, contact.address.emirate]
    .filter(Boolean)
    .join(', ');

  const pdfBytes = await generateWarrantyCardPdf({
    installation,
    businessName: business.name,
    businessPhone: contact.phone,
    businessAddress: address,
    customerName: customer.name,
    customerPhone: customer.phone,
    vehicle,
    productName: product.name,
    productFinish: product.finish,
    warrantyYears: product.warrantyYears,
    vendorShopName: vendor.shopName,
    lotNumber: roll?.lotNumber ?? 'Unknown',
  });

  return new Response(new Uint8Array(pdfBytes) as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${installation.warrantyNumber}.pdf"`,
      'Cache-Control': 'private, max-age=60',
    },
  });
}
