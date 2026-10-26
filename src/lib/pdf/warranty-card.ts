import 'server-only';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Installation } from '@/lib/db/repositories/installation.repository';

type WarrantyCardData = {
  installation: Installation;
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  /** PNG bytes of the business logo. */
  logoBytes?: Uint8Array;
  customerName: string;
  customerPhone: string;
  vehicle: { make: string; model: string; year?: number; plate?: string } | null;
  productName: string;
  productFinish: string;
  warrantyYears: number;
  vendorShopName: string;
  lotNumber: string;
};

const FORMAT_DATE = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' });

/**
 * Generates a warranty card PDF (A4 landscape, single page).
 * Returns the PDF as a Uint8Array.
 */
export async function generateWarrantyCardPdf(data: WarrantyCardData): Promise<Uint8Array> {
  const { installation: inst } = data;
  const pdf = await PDFDocument.create();
  // A4 landscape: 841.89 x 595.28 points
  const page = pdf.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);

  const dark = rgb(0.1, 0.1, 0.1);
  const muted = rgb(0.35, 0.35, 0.35);
  const accent = rgb(0.08, 0.45, 0.72);
  const border = rgb(0.82, 0.82, 0.82);

  const margin = 50;
  let y = height - margin;

  // --- Border ---
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: border,
    borderWidth: 1.5,
  });

  // --- Header with logo ---
  let headerTextX = margin;
  if (data.logoBytes) {
    try {
      const logoImage = await pdf.embedPng(data.logoBytes);
      const logoH = 32;
      const logoW = (logoImage.width / logoImage.height) * logoH;
      page.drawImage(logoImage, { x: margin, y: y - logoH + 8, width: logoW, height: logoH });
      headerTextX = margin + logoW + 10;
    } catch {
      // Logo embed failed — fall back to text only.
    }
  }
  page.drawText(data.businessName.toUpperCase(), {
    x: headerTextX,
    y,
    size: 22,
    font: bold,
    color: accent,
  });
  y -= 28;

  page.drawText('WARRANTY CERTIFICATE', {
    x: margin,
    y,
    size: 16,
    font: bold,
    color: dark,
  });

  // Warranty number top-right
  const wnText = inst.warrantyNumber;
  const wnWidth = bold.widthOfTextAtSize(wnText, 14);
  page.drawText(wnText, {
    x: width - margin - wnWidth,
    y: height - margin,
    size: 14,
    font: bold,
    color: accent,
  });

  // Status top-right below warranty number
  const now = new Date();
  const isVoided = !!inst.voidedAt;
  const isExpired = !isVoided && inst.warrantyExpiresAt < now;
  const statusText = isVoided ? 'VOIDED' : isExpired ? 'EXPIRED' : 'VALID';
  const statusColor = isVoided ? rgb(0.6, 0.1, 0.1) : isExpired ? rgb(0.7, 0.5, 0.0) : rgb(0.1, 0.55, 0.2);
  const stWidth = bold.widthOfTextAtSize(statusText, 12);
  page.drawText(statusText, {
    x: width - margin - stWidth,
    y: height - margin - 22,
    size: 12,
    font: bold,
    color: statusColor,
  });

  y -= 16;

  // --- Divider ---
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: border,
  });
  y -= 30;

  // --- Two-column layout ---
  const col1x = margin;
  const col2x = width / 2 + 20;
  const labelSize = 9;
  const valueSize = 11;
  const lineHeight = 18;

  function drawField(label: string, value: string, x: number, currentY: number): number {
    page.drawText(label.toUpperCase(), { x, y: currentY, size: labelSize, font: bold, color: muted });
    page.drawText(value || '—', { x, y: currentY - 14, size: valueSize, font: regular, color: dark });
    return currentY - lineHeight - 18;
  }

  // Left column
  let leftY = y;
  leftY = drawField('Customer', data.customerName, col1x, leftY);
  leftY = drawField('Phone', data.customerPhone, col1x, leftY);
  if (data.vehicle) {
    const vehicleStr = [data.vehicle.make, data.vehicle.model, data.vehicle.year].filter(Boolean).join(' ');
    leftY = drawField('Vehicle', vehicleStr, col1x, leftY);
    if (data.vehicle.plate) {
      leftY = drawField('Plate number', data.vehicle.plate, col1x, leftY);
    }
  }
  leftY = drawField('Area protected', inst.area, col1x, leftY);
  drawField('Film used', `${inst.metresUsed} metres`, col1x, leftY);

  // Right column
  let rightY = y;
  rightY = drawField('Product', `${data.productName} (${data.productFinish})`, col2x, rightY);
  rightY = drawField(
    'Warranty period',
    `${data.warrantyYears} ${data.warrantyYears === 1 ? 'year' : 'years'}`,
    col2x,
    rightY,
  );
  rightY = drawField('Installation date', FORMAT_DATE.format(inst.installedAt), col2x, rightY);
  rightY = drawField('Warranty expires', FORMAT_DATE.format(inst.warrantyExpiresAt), col2x, rightY);
  rightY = drawField('Installer', inst.installer, col2x, rightY);
  rightY = drawField('Installation shop', data.vendorShopName, col2x, rightY);
  drawField('Roll LOT number', data.lotNumber, col2x, rightY);

  // --- Footer ---
  const footerY = 50;
  page.drawLine({
    start: { x: margin, y: footerY + 20 },
    end: { x: width - margin, y: footerY + 20 },
    thickness: 0.5,
    color: border,
  });

  page.drawText(`${data.businessName} · ${data.businessPhone} · ${data.businessAddress}`, {
    x: margin,
    y: footerY,
    size: 8,
    font: regular,
    color: muted,
  });

  const verifyText = `Verify at: warranty lookup using number ${inst.warrantyNumber}`;
  page.drawText(verifyText, {
    x: margin,
    y: footerY - 12,
    size: 8,
    font: regular,
    color: muted,
  });

  return pdf.save();
}
