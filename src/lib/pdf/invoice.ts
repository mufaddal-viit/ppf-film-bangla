import 'server-only';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Invoice } from '@/lib/db/repositories/invoice.repository';

type InvoiceCardData = {
  invoice: Invoice;
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  businessEmail: string;
  /** PNG bytes of the business logo. */
  logoBytes?: Uint8Array;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  vendorShopName: string;
};

const FORMAT_DATE = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' });

function money(amount: number, currency: string): string {
  return `${currency} ${amount.toFixed(2)}`;
}

/** Generates an invoice PDF (A4 portrait). Returns a Uint8Array. */
export async function generateInvoicePdf(data: InvoiceCardData): Promise<Uint8Array> {
  const { invoice } = data;
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4 portrait
  const { width, height } = page.getSize();

  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);

  const dark = rgb(0.1, 0.1, 0.1);
  const muted = rgb(0.35, 0.35, 0.35);
  const accent = rgb(0.08, 0.45, 0.72);
  const border = rgb(0.82, 0.82, 0.82);
  const lightBg = rgb(0.96, 0.96, 0.96);

  const margin = 50;
  let y = height - margin;

  // --- Header with logo ---
  let headerTextX = margin;
  if (data.logoBytes) {
    try {
      const logoImage = await pdf.embedPng(data.logoBytes);
      const logoH = 28;
      const logoW = (logoImage.width / logoImage.height) * logoH;
      page.drawImage(logoImage, { x: margin, y: y - logoH + 8, width: logoW, height: logoH });
      headerTextX = margin + logoW + 10;
    } catch {
      // Logo embed failed — fall back to text only.
    }
  }
  page.drawText(data.businessName.toUpperCase(), { x: headerTextX, y, size: 18, font: bold, color: accent });
  y -= 16;
  page.drawText(data.businessAddress, { x: margin, y, size: 8, font: regular, color: muted });
  y -= 11;
  page.drawText(`${data.businessPhone} · ${data.businessEmail}`, {
    x: margin,
    y,
    size: 8,
    font: regular,
    color: muted,
  });

  // Invoice number top-right
  const invText = invoice.invoiceNumber;
  const invWidth = bold.widthOfTextAtSize(invText, 14);
  page.drawText(invText, { x: width - margin - invWidth, y: height - margin, size: 14, font: bold, color: accent });

  const statusText = invoice.status.toUpperCase();
  const stWidth = bold.widthOfTextAtSize(statusText, 10);
  const statusColor =
    invoice.status === 'paid' ? rgb(0.1, 0.55, 0.2) : invoice.status === 'cancelled' ? rgb(0.6, 0.1, 0.1) : muted;
  page.drawText(statusText, {
    x: width - margin - stWidth,
    y: height - margin - 18,
    size: 10,
    font: bold,
    color: statusColor,
  });

  y -= 20;
  page.drawText('INVOICE', { x: margin, y, size: 14, font: bold, color: dark });
  y -= 20;

  // --- Divider ---
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: border });
  y -= 25;

  // --- Bill to / Invoice details ---
  const col2x = width / 2 + 20;
  const labelSize = 8;
  const valueSize = 10;

  page.drawText('BILL TO', { x: margin, y, size: labelSize, font: bold, color: muted });
  page.drawText('INVOICE DETAILS', { x: col2x, y, size: labelSize, font: bold, color: muted });
  y -= 14;

  page.drawText(data.customerName, { x: margin, y, size: valueSize, font: bold, color: dark });
  page.drawText(`Date: ${FORMAT_DATE.format(invoice.createdAt)}`, {
    x: col2x,
    y,
    size: valueSize,
    font: regular,
    color: dark,
  });
  y -= 13;
  page.drawText(data.customerPhone, { x: margin, y, size: valueSize, font: regular, color: dark });
  if (invoice.issuedAt) {
    page.drawText(`Issued: ${FORMAT_DATE.format(invoice.issuedAt)}`, {
      x: col2x,
      y,
      size: valueSize,
      font: regular,
      color: dark,
    });
  }
  y -= 13;
  if (data.customerEmail) {
    page.drawText(data.customerEmail, { x: margin, y, size: valueSize, font: regular, color: dark });
  }
  page.drawText(`Vendor: ${data.vendorShopName}`, { x: col2x, y, size: valueSize, font: regular, color: dark });
  y -= 30;

  // --- Line items table ---
  const tableX = margin;
  const tableW = width - 2 * margin;
  const colDesc = tableX;
  const colQty = tableX + tableW * 0.55;
  const colUnit = tableX + tableW * 0.7;
  const colAmount = tableX + tableW * 0.85;
  const rowH = 18;

  // Header row
  page.drawRectangle({ x: tableX, y: y - rowH + 4, width: tableW, height: rowH, color: lightBg });
  page.drawText('Description', { x: colDesc + 4, y: y - 8, size: 8, font: bold, color: muted });
  page.drawText('Qty', { x: colQty, y: y - 8, size: 8, font: bold, color: muted });
  page.drawText('Unit Price', { x: colUnit, y: y - 8, size: 8, font: bold, color: muted });
  page.drawText('Amount', { x: colAmount, y: y - 8, size: 8, font: bold, color: muted });
  y -= rowH;

  // Item rows
  for (const item of invoice.lineItems) {
    page.drawLine({
      start: { x: tableX, y: y + 4 },
      end: { x: tableX + tableW, y: y + 4 },
      thickness: 0.5,
      color: border,
    });
    // Truncate long descriptions
    const desc = item.description.length > 50 ? item.description.slice(0, 47) + '...' : item.description;
    page.drawText(desc, { x: colDesc + 4, y: y - 8, size: 9, font: regular, color: dark });
    page.drawText(String(item.quantity), { x: colQty, y: y - 8, size: 9, font: regular, color: dark });
    page.drawText(item.unitPrice.toFixed(2), { x: colUnit, y: y - 8, size: 9, font: regular, color: dark });
    page.drawText(item.amount.toFixed(2), { x: colAmount, y: y - 8, size: 9, font: regular, color: dark });
    y -= rowH;
  }

  // Bottom line
  page.drawLine({ start: { x: tableX, y: y + 4 }, end: { x: tableX + tableW, y: y + 4 }, thickness: 1, color: border });
  y -= 20;

  // --- Totals ---
  const totalsX = colUnit;
  const totalsValX = colAmount;

  page.drawText('Subtotal', { x: totalsX, y, size: 9, font: regular, color: muted });
  page.drawText(money(invoice.subtotal, invoice.currency), { x: totalsValX, y, size: 9, font: regular, color: dark });
  y -= 15;

  if (invoice.vatRate > 0) {
    page.drawText(`VAT (${(invoice.vatRate * 100).toFixed(0)}%)`, {
      x: totalsX,
      y,
      size: 9,
      font: regular,
      color: muted,
    });
    page.drawText(money(invoice.vatAmount, invoice.currency), {
      x: totalsValX,
      y,
      size: 9,
      font: regular,
      color: dark,
    });
    y -= 15;
  }

  page.drawText('Total', { x: totalsX, y, size: 11, font: bold, color: dark });
  page.drawText(money(invoice.total, invoice.currency), { x: totalsValX, y, size: 11, font: bold, color: accent });
  y -= 25;

  if (invoice.status === 'paid' && invoice.paidAt) {
    page.drawText(`PAID ${FORMAT_DATE.format(invoice.paidAt)}`, {
      x: totalsX,
      y,
      size: 10,
      font: bold,
      color: rgb(0.1, 0.55, 0.2),
    });
    y -= 20;
  }

  // --- Notes ---
  if (invoice.notes) {
    y -= 10;
    page.drawText('Notes', { x: margin, y, size: 8, font: bold, color: muted });
    y -= 13;
    page.drawText(invoice.notes.slice(0, 300), { x: margin, y, size: 9, font: regular, color: dark, maxWidth: tableW });
  }

  // --- Footer ---
  const footerY = 40;
  page.drawLine({
    start: { x: margin, y: footerY + 15 },
    end: { x: width - margin, y: footerY + 15 },
    thickness: 0.5,
    color: border,
  });
  page.drawText(`${data.businessName} · ${data.businessPhone} · ${data.businessAddress}`, {
    x: margin,
    y: footerY,
    size: 7,
    font: regular,
    color: muted,
  });

  return pdf.save();
}
