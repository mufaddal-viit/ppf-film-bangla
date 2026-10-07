/**
 * Creates the first admin user, or resets an existing user's password and makes them an owner.
 *   pnpm admin:create --email owner@example.com --name "Owner Name"
 * The password is read from ADMIN_PASSWORD, or typed at the prompt, so it stays out of shell history.
 */
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { loadEnv } from './load-env.mts';

loadEnv();

const { values } = parseArgs({ options: { email: { type: 'string' }, name: { type: 'string' } } });
const email = values.email?.trim().toLowerCase();
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('Usage: pnpm admin:create --email owner@example.com --name "Owner Name"');
  process.exit(1);
}

const { PASSWORD_MIN_LENGTH } = await import('../src/lib/admin/constants');

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  password = await prompt.question(`Password for ${email} (at least ${PASSWORD_MIN_LENGTH} characters): `);
  prompt.close();
}
if (password.length < PASSWORD_MIN_LENGTH) {
  console.error(`The password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  process.exit(1);
}

const { getDb, closeDb } = await import('../src/lib/db/client');
const { ensureSchema } = await import('../src/lib/db/collections');
const { hashPassword } = await import('../src/lib/auth/password');
const { userRepository } = await import('../src/lib/db/repositories/user.repository');

await ensureSchema(await getDb());
const passwordHash = await hashPassword(password);
const existing = await userRepository.findByEmailWithHash(email);
if (existing) {
  await userRepository.update(existing.id, {
    passwordHash,
    role: 'owner',
    active: true,
    ...(values.name && { name: values.name }),
  });
  console.log(`Updated ${email}: password reset, role set to owner.`);
} else {
  await userRepository.create({ email, name: values.name ?? email.split('@')[0]!, role: 'owner', passwordHash });
  console.log(`Created owner ${email}. Sign in at /admin/login.`);
}
await closeDb();
