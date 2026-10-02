/** Inserts sample leads for local development: `pnpm db:seed` (with `pnpm dev` running). */
import { loadEnv } from './load-env.mts';

loadEnv();

if (process.env.VERCEL_ENV === 'production') {
  console.error('Refusing to seed a production database.');
  process.exit(1);
}

const { closeDb } = await import('../src/lib/db/client');
const { leadRepository } = await import('../src/lib/db/repositories/lead.repository');

const consent = { given: true as const, at: new Date(), policyVersion: 'seed' };
const leads = [
  {
    type: 'quote' as const,
    name: 'Sample Quote',
    phone: '+971500000001',
    service: 'paint-protection-film',
    vehicle: { make: 'Toyota', model: 'Land Cruiser', year: 2024 },
    locale: 'en',
    sourcePage: '/en/contact',
    utm: { source: 'google', medium: 'cpc', campaign: 'ppf-dubai' },
    consent,
  },
  {
    type: 'contact' as const,
    name: 'Sample Contact',
    phone: '+971500000002',
    message: 'Do you open on Fridays?',
    locale: 'ar',
    sourcePage: '/ar/contact',
    consent,
  },
  {
    type: 'callback' as const,
    name: 'Sample Callback',
    phone: '+971500000003',
    preferredTime: 'After 6pm',
    locale: 'en',
    sourcePage: '/en',
    consent,
  },
];

for (const lead of leads) {
  const { id } = await leadRepository.create(lead);
  console.log(`Inserted ${lead.type} lead ${id}`);
}
await closeDb();
