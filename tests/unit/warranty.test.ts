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
vi.mock('@/lib/db/repositories/roll.repository', () => ({ rollRepository: {} }));
vi.mock('@/lib/db/repositories/portal-user.repository', () => ({ portalUserRepository: {} }));
vi.mock('@/lib/db/repositories/session.repository', () => ({ sessionRepository: {} }));
vi.mock('@/lib/db/repositories/user.repository', () => ({ isDuplicateKeyError: vi.fn() }));

const { productFormSchema } = await import('@/lib/admin/products');
const { parseInstallers, vendorFormSchema } = await import('@/lib/admin/vendors');
const { rollFormSchema } = await import('@/lib/admin/stock');
const { rollRemaining, rollSize } = await import('@/lib/admin/format');
const { stockTotals, toRollRows } = await import('@/lib/admin/roll-rows');

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

describe('roll form', () => {
  const base = {
    vendorId: 'a'.repeat(24),
    productId: 'b'.repeat(24),
    lotNumber: '  ph-2610   a7 ',
    widthCm: '152',
    lengthM: '15',
  };

  it('tidies the LOT number and reads the size as numbers', () => {
    expect(rollFormSchema.parse(base)).toEqual({
      vendorId: 'a'.repeat(24),
      productId: 'b'.repeat(24),
      lotNumber: 'ph-2610 a7',
      widthCm: 152,
      lengthM: 15,
    });
    expect(rollFormSchema.parse({ ...base, widthCm: '152.4', lengthM: '12.75' })).toMatchObject({
      widthCm: 152.4,
      lengthM: 12.75,
    });
  });

  it('rejects a bad LOT number, a bad id and a size that is missing, too fine or out of range', () => {
    for (const lotNumber of ['', 'ab', '-lot', 'lot<script>', 'x'.repeat(41)]) {
      expect(rollFormSchema.safeParse({ ...base, lotNumber }).success).toBe(false);
    }
    expect(rollFormSchema.safeParse({ ...base, vendorId: 'not-an-id' }).success).toBe(false);
    for (const widthCm of ['', '0', '9', '201', '152.45', 'wide']) {
      expect(rollFormSchema.safeParse({ ...base, widthCm }).success).toBe(false);
    }
    for (const lengthM of ['', '0', '0.4', '101', '15.123', '-15']) {
      expect(rollFormSchema.safeParse({ ...base, lengthM }).success).toBe(false);
    }
  });
});

describe('stock figures', () => {
  const rolls = [
    { id: '1', vendorId: 'v1', productId: 'p1', lotNumber: 'A1', widthCm: 152, lengthM: 15, usedM: 0.1 },
    { id: '2', vendorId: 'v1', productId: 'p9', lotNumber: 'A2', widthCm: 61.5, lengthM: 7.5, usedM: 7.5 },
  ].map((roll) => ({ ...roll, createdAt: new Date('2026-10-01T10:00:00Z') }));

  it('formats a roll and never reports less than nothing left', () => {
    expect(rollSize(rolls[0]!)).toBe('152 cm × 15 m');
    expect(rollSize(rolls[1]!)).toBe('61.5 cm × 7.5 m');
    expect(rollRemaining({ lengthM: 15, usedM: 0.1 + 0.2 })).toBe(14.7);
    expect(rollRemaining({ lengthM: 5, usedM: 6 })).toBe(0);
  });

  it('adds up rolls, metres allocated and metres left', () => {
    expect(stockTotals(rolls)).toEqual({ rolls: 2, allocatedM: 22.5, leftM: 14.9 });
    expect(stockTotals([])).toEqual({ rolls: 0, allocatedM: 0, leftM: 0 });
  });

  it('names the product and links the shop only when vendors are given', () => {
    const products = [{ id: 'p1', name: 'Apex Clear' }];
    const date = () => '1 Oct 2026';
    const forVendor = toRollRows(rolls, { products, date });
    expect(forVendor.map((row) => row.product)).toEqual(['Apex Clear', 'Removed product']);
    expect(forVendor[0]).not.toHaveProperty('vendor');
    expect(forVendor[0]).not.toHaveProperty('vendorId');
    const forAdmin = toRollRows(rolls, { products, vendors: [{ id: 'v1', shopName: 'Desert Shield' }], date });
    expect(forAdmin[0]!.vendor).toEqual({ name: 'Desert Shield', href: '/admin/vendors/v1' });
  });
});
