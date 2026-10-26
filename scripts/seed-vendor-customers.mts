/** Seed vendor-scoped customers for the demo vendor. Run against production or local. */
import { loadEnv } from './load-env.mts';
loadEnv();

const { getDb, closeDb } = await import('../src/lib/db/client');
const { ensureSchema } = await import('../src/lib/db/collections');
const { customerRepository } = await import('../src/lib/db/repositories/customer.repository');
const { vendorRepository } = await import('../src/lib/db/repositories/vendor.repository');

await ensureSchema(await getDb());

// Find the demo vendor.
const vendors = await vendorRepository.list();
const vendor = vendors.find((v) => v.email === 'vendor@demo.com');
if (!vendor) {
  console.error('Demo vendor not found. Run seed-demo.mts first.');
  process.exit(1);
}

const customers = [
  {
    name: 'Khalid Al Maktoum',
    phone: '+971561111111',
    email: 'khalid.m@example.com',
    vehicles: [
      { make: 'Mercedes', model: 'G63 AMG', year: 2024, plate: 'D 12345' },
      { make: 'Porsche', model: 'Cayenne', year: 2023 },
    ],
  },
  {
    name: 'Sara Al Mansoori',
    phone: '+971562222222',
    vehicles: [{ make: 'BMW', model: 'X5', year: 2024, plate: 'AD 67890' }],
  },
  {
    name: 'Omar Rashid',
    phone: '+971563333333',
    vehicles: [{ make: 'Toyota', model: 'Land Cruiser', year: 2025, plate: 'SHJ 11111' }],
  },
  {
    name: 'Fatima Ahmed',
    phone: '+971564444444',
    email: 'fatima.a@example.com',
    vehicles: [
      { make: 'Range Rover', model: 'Sport', year: 2024, plate: 'D 99999' },
      { make: 'Audi', model: 'Q8', year: 2023, plate: 'D 88888' },
    ],
  },
  {
    name: 'Ahmed Hassan',
    phone: '+971565555555',
    vehicles: [{ make: 'Lamborghini', model: 'Urus', year: 2024, plate: 'D 77777' }],
  },
  {
    name: 'Noura Bin Saeed',
    phone: '+971566666666',
    email: 'noura@example.com',
    vehicles: [{ make: 'Rolls-Royce', model: 'Cullinan', year: 2025, plate: 'D 55555' }],
  },
];

for (const c of customers) {
  try {
    const { id } = await customerRepository.create({
      name: c.name,
      phone: c.phone,
      email: c.email,
      tags: [],
      marketingOptIn: false,
      vehicles: c.vehicles,
      vendorId: vendor.id,
    });
    console.log(`✓ ${c.name} (${id})`);
  } catch {
    console.log(`  Already exists: ${c.name}`);
  }
}

console.log(`\nDone. ${customers.length} customers seeded for vendor "${vendor.shopName}".`);
await closeDb();
