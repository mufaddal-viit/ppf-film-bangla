const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  LevelFormat, PageBreak
} = require('docx');
const fs = require('fs');

const BLUE = "1F4E79";
const DARK = "1A1A1A";
const GREY = "595959";
const LIGHT = "EAF1F8";
const BORDER = "D0D7DE";

const FONT = "Calibri";

// ---------- helpers ----------
function h1(text) {
  return new Paragraph({
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 30, color: BLUE, font: FONT })],
  });
}
function h2(text) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: DARK, font: FONT })],
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text, size: 21, color: opts.color || DARK, font: FONT, italics: !!opts.italics })],
  });
}
function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text, size: 21, color: DARK, font: FONT })],
  });
}
function cell(text, { bold = false, color = DARK, bg, align = AlignmentType.LEFT, width } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: bg ? { type: ShadingType.CLEAR, fill: bg, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text, bold, size: 20, color, font: FONT })],
    })],
  });
}

// Feature table: Module | What it includes
function featureTable(rows) {
  const W1 = 2600, W2 = 6760, TOTAL = W1 + W2;
  const header = new TableRow({
    tableHeader: true,
    children: [
      cell("Module", { bold: true, color: "FFFFFF", bg: BLUE, width: W1 }),
      cell("What it includes", { bold: true, color: "FFFFFF", bg: BLUE, width: W2 }),
    ],
  });
  const dataRows = rows.map((r, i) =>
    new TableRow({
      children: [
        cell(r[0], { bold: true, bg: i % 2 ? "FFFFFF" : LIGHT, width: W1 }),
        cell(r[1], { bg: i % 2 ? "FFFFFF" : LIGHT, width: W2 }),
      ],
    })
  );
  return new Table({
    columnWidths: [W1, W2],
    width: { size: TOTAL, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: BORDER },
      left: { style: BorderStyle.SINGLE, size: 2, color: BORDER },
      right: { style: BorderStyle.SINGLE, size: 2, color: BORDER },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: BORDER },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: BORDER },
    },
    rows: [header, ...dataRows],
  });
}

function spacer() {
  return new Paragraph({ children: [new TextRun({ text: "", size: 12 })] });
}

// ---------- content ----------
const children = [];

// Title block
children.push(new Paragraph({
  spacing: { after: 40 },
  children: [new TextRun({ text: "PROJECT QUOTATION", bold: true, size: 40, color: BLUE, font: FONT })],
}));
children.push(new Paragraph({
  spacing: { after: 40 },
  children: [new TextRun({ text: "Car Care Marketing Website — Design, Development & Launch", size: 24, color: DARK, font: FONT })],
}));
children.push(new Paragraph({
  spacing: { after: 200 },
  children: [new TextRun({ text: "Market: United Arab Emirates  |  Platform: Next.js (web)", size: 20, color: GREY, font: FONT })],
}));
children.push(new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE } },
  children: [new TextRun({ text: "", size: 2 })],
}));

// Meta table
const metaW1 = 2400, metaW2 = 6960;
children.push(spacer());
children.push(new Table({
  columnWidths: [metaW1, metaW2],
  width: { size: metaW1 + metaW2, type: WidthType.DXA },
  borders: {
    top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
  },
  rows: [
    ["Prepared for", "[Client name]"],
    ["Prepared by", "[Your company name]"],
    ["Quotation no.", "[0000]"],
    ["Date", "2 October 2026"],
    ["Valid until", "[30 days from date]"],
  ].map(r => new TableRow({ children: [
    cell(r[0], { bold: true, color: GREY, width: metaW1 }),
    cell(r[1], { width: metaW2 }),
  ]})),
}));

// Overview
children.push(h1("1. Project overview"));
children.push(body(
  "Design and development of a production-grade marketing website for a UAE car care studio, built to generate leads through WhatsApp, calls and quote forms. The site is fully configurable, bilingual (English and Arabic with right-to-left support), search- and AI-optimised, and secure to industry standard. A customer login and account area is reserved as a second phase."
));

// Scope of work
children.push(h1("2. Scope of work"));

children.push(h2("2.1 Pages"));
featureAndPush([
  ["Homepage", "Modular, section-based layout that can be reordered or toggled from configuration."],
  ["Services", "Services listing page plus an individual page per service (PPF, ceramic coating, tinting, wrapping, detailing, etc.)."],
  ["Gallery", "Project showcase with image grid and video reels, filterable by service."],
  ["Prices / Packages", "Package and starting-price page in AED."],
  ["About", "Studio story, facility, team and credentials."],
  ["Contact", "Lead form, WhatsApp, call and map."],
  ["Blog", "Blog listing and article pages (structure and templates; content added later)."],
  ["Legal", "Privacy Policy and Terms pages."],
  ["System pages", "Custom 404 and error pages; account area reserved for Phase 2."],
]);

children.push(h2("2.2 Homepage sections"));
featureAndPush([
  ["Top bar", "Phone, WhatsApp, opening hours, area and language switch."],
  ["Header", "Logo, navigation with services menu, and a quote button."],
  ["Hero", "Headline, subheading, two calls to action, optional video/image, quick service chips."],
  ["Trust strip", "Google rating, warranty, jobs completed and partner-brand logos."],
  ["Services grid", "Service cards with a one-line description and a 'from' price."],
  ["UAE climate", "Why local heat, sand and UV make protection necessary."],
  ["Why choose us", "Key benefits backed by proof points."],
  ["Packages", "Pricing tiers with starting prices."],
  ["Portfolio", "Filterable project grid and video reels."],
  ["Facility", "Photos and animated statistic counters."],
  ["Process", "Numbered 'how it works' steps."],
  ["Reviews", "Testimonial carousel with rating summary."],
  ["FAQ", "Accordion of question-and-answer pairs."],
  ["Contact CTA", "Lead form, WhatsApp alternative and map."],
  ["Footer", "Links, contact, hours, payment icons and legal."],
  ["Floating actions", "Sticky mobile bar: Call, Map, WhatsApp."],
]);

children.push(h2("2.3 Core features"));
featureAndPush([
  ["Lead capture", "Quote, contact and callback forms with validation, spam protection and database storage; email notification to the business on every enquiry."],
  ["WhatsApp integration", "Click-to-chat links with per-page pre-filled messages."],
  ["Fully configurable content", "All text, services, prices, FAQs and testimonials managed from content files — no hardcoded values; nothing requires code changes to update copy."],
  ["Dynamic theming", "Colours, fonts and styling driven by a theme system; brand palette can be plugged in later without redevelopment."],
  ["Bilingual + RTL", "English and Arabic with full right-to-left layout and language switching."],
  ["Lead tracking", "Capture of marketing campaign data (UTM) and source page against each lead."],
  ["Analytics", "Google Tag Manager with consent gating and event tracking (form submits, WhatsApp/call/directions clicks)."],
]);

children.push(h2("2.4 SEO, AEO & GEO"));
featureAndPush([
  ["Technical SEO", "Per-page meta tags, canonical URLs, sitemap, robots, Open Graph/social cards, bilingual hreflang, fast static pages."],
  ["Structured data", "Rich-result schema: local business, services, FAQs, reviews and breadcrumbs."],
  ["Answer/AI optimisation", "Content structured for Google answers and AI assistants, consistent business facts, and an llms.txt file for AI crawlers."],
  ["Performance", "Optimised images and Core Web Vitals targets for strong mobile speed and ranking."],
]);

children.push(h2("2.5 Security & compliance"));
featureAndPush([
  ["Security hardening", "Security headers, server-side validation on all inputs, and secret protection."],
  ["Rate limiting", "Per-endpoint limits to prevent form abuse."],
  ["Bot protection", "Anti-bot challenge plus honeypot on all forms."],
  ["Privacy", "Consent capture on forms, cookie consent, and privacy/terms pages aligned with UAE PDPL principles."],
]);

children.push(h2("2.6 Quality & delivery"));
featureAndPush([
  ["Accessibility", "WCAG 2.2 AA: keyboard support, focus states, labels and contrast."],
  ["Testing & CI", "Automated checks and a continuous-integration pipeline on every change."],
  ["Documentation", "Setup guide covering theming, content editing, adding sections and deployment."],
  ["Handover", "Source code repository and deployment to the agreed hosting."],
]);

// Phase 2
children.push(h1("3. Phase 2 (reserved, quoted separately)"));
children.push(bullet("Customer registration, login and account area."));
children.push(bullet("Admin panel / CMS for non-developer content editing."));
children.push(bullet("CRM or WhatsApp Business API integration for leads."));
children.push(body("These are scoped and reserved in the architecture but not included in this quotation.", { italics: true, color: GREY }));

// Not included
children.push(h1("4. Not included"));
children.push(bullet("Logo design and brand identity."));
children.push(bullet("Photography, videography and copywriting (client to supply; assistance available on request)."));
children.push(bullet("Paid advertising, ongoing SEO campaigns and content marketing."));
children.push(bullet("Third-party licences, domain and hosting fees (billed at cost or by the client)."));
children.push(bullet("Ongoing maintenance after the warranty period (available as a separate retainer)."));

// Commercials
children.push(h1("5. Commercials"));
const cW1 = 5200, cW2 = 2080, cW3 = 2080, cTotal = cW1 + cW2 + cW3;
children.push(new Table({
  columnWidths: [cW1, cW2, cW3],
  width: { size: cTotal, type: WidthType.DXA },
  borders: {
    top: { style: BorderStyle.SINGLE, size: 2, color: BORDER },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: BORDER },
    left: { style: BorderStyle.SINGLE, size: 2, color: BORDER },
    right: { style: BorderStyle.SINGLE, size: 2, color: BORDER },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: BORDER },
    insideVertical: { style: BorderStyle.SINGLE, size: 2, color: BORDER },
  },
  rows: [
    new TableRow({ tableHeader: true, children: [
      cell("Item", { bold: true, color: "FFFFFF", bg: BLUE, width: cW1 }),
      cell("Timeline", { bold: true, color: "FFFFFF", bg: BLUE, width: cW2, align: AlignmentType.CENTER }),
      cell("Price (AED)", { bold: true, color: "FFFFFF", bg: BLUE, width: cW3, align: AlignmentType.CENTER }),
    ]}),
    new TableRow({ children: [
      cell("Phase 1 — Full website as scoped above", { bg: LIGHT, width: cW1 }),
      cell("[ ] weeks", { bg: LIGHT, width: cW2, align: AlignmentType.CENTER }),
      cell("[ amount ]", { bg: LIGHT, width: cW3, align: AlignmentType.CENTER }),
    ]}),
    new TableRow({ children: [
      cell("Total (excl. VAT)", { bold: true, width: cW1 }),
      cell("", { width: cW2 }),
      cell("[ amount ]", { bold: true, width: cW3, align: AlignmentType.CENTER }),
    ]}),
  ],
}));
children.push(spacer());
children.push(body("Prices are in AED and exclusive of 5% VAT. A 50% advance is payable on commencement and the balance on delivery, unless agreed otherwise.", { color: GREY }));

// Terms
children.push(h1("6. Terms"));
children.push(bullet("This quotation is valid for 30 days from the date above."));
children.push(bullet("Timeline assumes content and brand assets are provided on time; delays may shift the schedule."));
children.push(bullet("Scope changes are quoted separately before work begins."));
children.push(bullet("A defect-fix warranty of [30] days applies after launch."));

children.push(spacer());
children.push(spacer());
children.push(new Paragraph({
  border: { top: { style: BorderStyle.SINGLE, size: 4, color: BORDER } },
  spacing: { before: 200, after: 120 },
  children: [new TextRun({ text: "Acceptance", bold: true, size: 22, color: DARK, font: FONT })],
}));
children.push(body("Signature: ____________________________        Date: ____________________"));
children.push(body("Name & title: ____________________________________________________"));

// ---------- helper that builds + pushes a feature table ----------
function featureAndPush(rows) {
  children.push(featureTable(rows));
  children.push(spacer());
}

// ---------- document ----------
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { run: { color: BLUE }, paragraph: { indent: { left: 360, hanging: 260 } } },
      }],
    }],
  },
  sections: [{
    properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('Quotation_Car_Care_Website.docx', buf);
  console.log('written', buf.length);
});
