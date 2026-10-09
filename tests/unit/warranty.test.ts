import { describe, expect, it, vi } from 'vitest';
import { generateTempPassword, hashPassword, verifyPassword } from '@/lib/auth/password';

// products.ts and vendors.ts wire real infrastructure at import; only their pure helpers are under test here.
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn(), unstable_rethrow: vi.fn() }));
vi.mock('@/lib/auth/session', () => ({ requireSession: vi.fn() }));
vi.mock('@/lib/security/request', () => ({ getRequestMeta: vi.fn(), isAllowedOrigin: vi.fn() }));
vi.mock('@/lib/db/repositories/audit.repository', () => ({ auditRepository: {} }));
vi.mock('@/lib/db/repositories/product.repository', () => ({ productRepository: {} }));
vi.mock('@/lib/db/repositories/vendor.repository', () => ({ vendorRepository: {} }));
vi.mock('@/lib/db/repositories/portal-user.repository', () => ({ portalUserRepository: {} }));
vi.mock('@/lib/db/repositories/session.repository', () => ({ sessionRepository: {} }));
vi.mock('@/lib/db/repositories/user.repository', () => ({ isDuplicateKeyError: vi.fn() }));

const { productFormSchema } = await import('@/lib/admin/products');
const { parseInstallers, vendorFormSchema } = await import('@/lib/admin/vendors');

describe('temporary passwords', () => {
  it('are long, grouped for reading aloud and free of look-alike characters', () => {
    const password = generateTempPassword();
    expect(password).toMatch(/^[A-HJ-NP-Za-hjkmnp-z2-9]{4}-[A-HJ-NP-Za-hjkmnp-z2-9]{5}-[A-HJ-NP-Za-hjkmnp-z2-9]{5}$/);
    expect(password).not.toMatch(/[0O1lIio]/);
  });

  it('differ every time and work as a real password', async () => {
    const passwords = new Set(Array.from({ length: 50 }, generateTempPassword));
    expect(passwords.size).toBe(50);
    const [first] = passwords;
    expect(await verifyPassword(first!, await hashPassword(first!))).toBe(true);
  });
});

describe('product form', () => {
  const base = { name: ' Apex Clear ', finish: 'Gloss', warrantyYears: '10', description: '' };

  it('trims text and reads the warranty as whole years', () => {
    expect(productFormSchema.parse(base)).toEqual({
      name: 'Apex Clear',
      finish: 'Gloss',
      warrantyYears: 10,
      description: '',
    });
  });

  it('rejects a missing name and a warranty that is zero, fractional or too long', () => {
    expect(productFormSchema.safeParse({ ...base, name: ' ' }).success).toBe(false);
    for (const warrantyYears of ['0', '2.5', '26', 'ten', '']) {
      expect(productFormSchema.safeParse({ ...base, warrantyYears }).success).toBe(false);
    }
  });
});

describe('vendor form', () => {
  const base = {
    shopName: 'Desert Shield Auto',
    contactName: 'Sara Haddad',
    email: 'shop@example.com',
    phone: '+971 52 365 6678',
    address: 'Unit 4, 12th Street, Al Quoz, Dubai',
    installers: 'Omar Khan\n  omar   khan \n\nLayla Aziz\n',
  };

  it('normalises the phone and the installer list', () => {
    const vendor = vendorFormSchema.parse(base);
    expect(vendor.phone).toBe('+971523656678');
    expect(vendor.installers).toEqual(['omar khan', 'Layla Aziz']);
  });

  it('keeps one name per line and drops blanks and repeats', () => {
    expect(parseInstallers('')).toEqual([]);
    expect(parseInstallers('A One\r\nB Two\r\na one')).toEqual(['a one', 'B Two']);
  });

  it('rejects a bad phone, a bad email and too many installers', () => {
    expect(vendorFormSchema.safeParse({ ...base, phone: '12345' }).success).toBe(false);
    expect(vendorFormSchema.safeParse({ ...base, email: 'not-an-email' }).success).toBe(false);
    const many = Array.from({ length: 31 }, (_, index) => `Installer ${index}`).join('\n');
    expect(vendorFormSchema.safeParse({ ...base, installers: many }).success).toBe(false);
  });
});
