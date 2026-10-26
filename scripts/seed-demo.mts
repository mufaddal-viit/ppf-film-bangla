/**
 * Seeds a full demo dataset: admin user, products, vendor with login, customers with vehicles,
 * rolls allocated to the vendor, and sample leads.
 *
 *   pnpm tsx --conditions=react-server scripts/seed-demo.mts
 *
 * Run while `pnpm dev` is running (it uses the local MongoDB).
 */
import { loadEnv } from './load-env.mts';

loadEnv();

if (process.env.VERCEL_ENV === 'production') {
  console.error('Refusing to seed a production database.');
  process.exit(1);
}

const { getDb, closeDb } = await import('../src/lib/db/client');
const { ensureSchema } = await import('../src/lib/db/collections');
const { hashPassword } = await import('../src/lib/auth/password');
const { userRepository } = await import('../src/lib/db/repositories/user.repository');
const { productRepository } = await import('../src/lib/db/repositories/product.repository');
const { vendorRepository } = await import('../src/lib/db/repositories/vendor.repository');
const { portalUserRepository } = await import('../src/lib/db/repositories/portal-user.repository');
const { rollRepository } = await import('../src/lib/db/repositories/roll.repository');
const { customerRepository } = await import('../src/lib/db/repositories/customer.repository');
const { leadRepository } = await import('../src/lib/db/repositories/lead.repository');

await ensureSchema(await getDb());

const PASSWORD = 'demo123456';
const passwordHash = await hashPassword(PASSWORD);

// ── Admin user ──────────────────────────────────────────────────────
const adminEmail = 'admin@demo.com';
const existingAdmin = await userRepository.findByEmailWithHash(adminEmail);
if (!existingAdmin) {
  await userRepository.create({ email: adminEmail, name: 'Demo Owner', role: 'owner', passwordHash });
  console.log(`✓ Admin created: ${adminEmail}`);
} else {
  await userRepository.update(existingAdmin.id, { passwordHash, role: 'owner', active: true });
  console.log(`✓ Admin reset: ${adminEmail}`);
}

// ── Products ────────────────────────────────────────────────────────
const products = [
  {
    name: 'Phantom Shield Pro',
    finish: 'Gloss',
    warrantyYears: 10,
    description: 'Premium self-healing PPF',
    active: true,
  },
  {
    name: 'Phantom Shield Matte',
    finish: 'Matte',
    warrantyYears: 7,
    description: 'Satin-finish protection film',
    active: true,
  },
  { name: 'Phantom Tint Ceramic', finish: 'N/A', warrantyYears: 5, description: 'Ceramic window tint', active: true },
];
const productIds: string[] = [];
for (const p of products) {
  try {
    const { id } = await productRepository.create(p);
    productIds.push(id);
    console.log(`✓ Product: ${p.name} (${id})`);
  } catch {
    // Duplicate name — fetch existing
    const all = await productRepository.list();
    const existing = all.find((x) => x.name === p.name);
    if (existing) productIds.push(existing.id);
    console.log(`  Product already exists: ${p.name}`);
  }
}

// ── Vendor ──────────────────────────────────────────────────────────
let vendorId: string;
const existingVendors = await vendorRepository.list();
const demoVendor = existingVendors.find((v) => v.email === 'vendor@demo.com');
if (demoVendor) {
  vendorId = demoVendor.id;
  console.log(`  Vendor already exists: ${demoVendor.shopName}`);
} else {
  const { id } = await vendorRepository.create({
    shopName: 'AutoShield Dubai',
    contactName: 'Ali Hassan',
    email: 'vendor@demo.com',
    phone: '+971501234567',
    address: 'Al Quoz Industrial Area 3, Dubai',
    installers: ['Mohammed Khalid', 'Ahmed Salim', 'Youssef Noor'],
  });
  vendorId = id;
  console.log(`✓ Vendor: AutoShield Dubai (${id})`);
}

// ── Vendor portal login ─────────────────────────────────────────────
const vendorEmail = 'ali@autoshield.com';
const existingLogin = await portalUserRepository.findByEmailWithHash(vendorEmail);
if (!existingLogin) {
  await portalUserRepository.create({
    vendorId,
    email: vendorEmail,
    name: 'Ali Hassan',
    passwordHash,
  });
  console.log(`✓ Vendor login: ${vendorEmail} (temporary password, must change on first login)`);
} else {
  console.log(`  Vendor login already exists: ${vendorEmail}`);
}

// ── Customers ───────────────────────────────────────────────────────
const customersData = [
  {
    name: 'Khalid Al Maktoum',
    phone: '+971551111111',
    email: 'khalid@example.com',
    tags: ['VIP'],
    marketingOptIn: true,
    vehicles: [
      { make: 'Mercedes', model: 'G63 AMG', year: 2024, plate: 'D 12345' },
      { make: 'Porsche', model: 'Cayenne', year: 2023 },
    ],
  },
  {
    name: 'Sara Al Mansoori',
    phone: '+971552222222',
    tags: ['Repeat'],
    marketingOptIn: true,
    vehicles: [{ make: 'BMW', model: 'X5', year: 2024, plate: 'AD 67890' }],
  },
  {
    name: 'Omar Rashid',
    phone: '+971553333333',
    tags: [],
    marketingOptIn: false,
    vehicles: [{ make: 'Toyota', model: 'Land Cruiser', year: 2025, plate: 'SHJ 11111' }],
  },
  {
    name: 'Fatima Ahmed',
    phone: '+971554444444',
    email: 'fatima@example.com',
    tags: ['Corporate'],
    marketingOptIn: true,
    vehicles: [
      { make: 'Range Rover', model: 'Sport', year: 2024, plate: 'D 99999' },
      { make: 'Audi', model: 'Q8', year: 2023, plate: 'D 88888' },
    ],
  },
];

const customerIds: string[] = [];
for (const c of customersData) {
  try {
    const { id } = await customerRepository.create(c);
    customerIds.push(id);
    console.log(`✓ Customer: ${c.name} (${id})`);
  } catch {
    const existing = await customerRepository.findByPhone(c.phone);
    if (existing) customerIds.push(existing.id);
    console.log(`  Customer already exists: ${c.name}`);
  }
}

// ── Rolls ───────────────────────────────────────────────────────────
const rollsData = [
  { vendorId, productId: productIds[0]!, lotNumber: 'PSP-2024-A001', widthCm: 152, lengthM: 15 },
  { vendorId, productId: productIds[0]!, lotNumber: 'PSP-2024-A002', widthCm: 152, lengthM: 15 },
  { vendorId, productId: productIds[1]!, lotNumber: 'PSM-2024-B001', widthCm: 152, lengthM: 15 },
  { vendorId, productId: productIds[2]!, lotNumber: 'PTC-2024-C001', widthCm: 76, lengthM: 30 },
];

for (const r of rollsData) {
  try {
    const { id } = await rollRepository.create(r);
    console.log(`✓ Roll: LOT ${r.lotNumber} (${id})`);
  } catch {
    console.log(`  Roll already exists: LOT ${r.lotNumber}`);
  }
}

// ── Sample leads ────────────────────────────────────────────────────
const consent = { given: true as const, at: new Date(), policyVersion: 'seed' };
const leadsData = [
  {
    type: 'quote' as const,
    name: 'Ahmed Bin Rashid',
    phone: '+971559999001',
    service: 'paint-protection-film',
    vehicle: { make: 'Lamborghini', model: 'Urus', year: 2024 },
    locale: 'en',
    sourcePage: '/en/contact',
    consent,
  },
  {
    type: 'contact' as const,
    name: 'Noor Al Suwaidi',
    phone: '+971559999002',
    message: 'What PPF brands do you carry?',
    locale: 'ar',
    sourcePage: '/ar/contact',
    consent,
  },
  {
    type: 'callback' as const,
    name: 'Reem Hassan',
    phone: '+971559999003',
    preferredTime: 'After 5pm please',
    locale: 'en',
    sourcePage: '/en',
    consent,
  },
];
for (const lead of leadsData) {
  const { id } = await leadRepository.create(lead);
  console.log(`✓ Lead: ${lead.name} (${id})`);
}

// ── Summary ─────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════');
console.log('  DEMO CREDENTIALS');
console.log('══════════════════════════════════════════════════');
console.log(`  Admin panel:   /admin/login`);
console.log(`    Email:       ${adminEmail}`);
console.log(`    Password:    ${PASSWORD}`);
console.log('');
console.log(`  Vendor portal: /vendor/login`);
console.log(`    Email:       ${vendorEmail}`);
console.log(`    Password:    ${PASSWORD}`);
console.log(`    (first login will ask you to change it)`);
console.log('══════════════════════════════════════════════════');

await closeDb();
