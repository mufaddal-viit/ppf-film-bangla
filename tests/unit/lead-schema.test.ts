import { describe, expect, it } from 'vitest';
import { buildLeadSchema, normalizePhone, toFieldErrors, type ParsedLeadValues } from '@/lib/validation/lead';

const schema = buildLeadSchema({
  fields: [
    { name: 'name', required: true },
    { name: 'phone', required: true },
    { name: 'email', required: false },
    { name: 'service', required: true },
    { name: 'vehicleYear', required: false },
    { name: 'message', required: false },
  ],
  phoneRegion: 'AE',
  serviceSlugs: ['ceramic-coating'],
});

const valid = { name: 'Sara Ahmed', phone: '050 123 4567', service: 'ceramic-coating', consent: true };

describe('normalizePhone', () => {
  it.each([
    ['050 123 4567', '+971501234567'],
    ['+971 50 123 4567', '+971501234567'],
    ['00971501234567', '+971501234567'],
    ['04 200 0000', '+97142000000'],
  ])('normalises %s to E.164', (input, expected) => {
    expect(normalizePhone(input, 'AE')).toBe(expected);
  });

  it('rejects invalid numbers', () => {
    expect(normalizePhone('12345', 'AE')).toBeNull();
  });
});

describe('lead schema', () => {
  it('accepts a valid lead and outputs E.164', () => {
    const result = schema.parse(valid) as ParsedLeadValues;
    expect(result.phone).toBe('+971501234567');
  });

  it('treats empty optional fields as absent', () => {
    const result = schema.parse({ ...valid, email: '', vehicleYear: '', message: '   ' }) as ParsedLeadValues;
    expect(result).not.toHaveProperty('email', '');
    expect(result.email).toBeUndefined();
  });

  it('returns stable error codes per field', () => {
    const result = schema.safeParse({ name: '', phone: '123', email: 'nope', service: 'other', consent: false });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(toFieldErrors(result.error)).toEqual({
      name: 'required',
      phone: 'invalid_phone',
      email: 'invalid_email',
      service: 'invalid_option',
      consent: 'consent_required',
    });
  });

  it('enforces length limits', () => {
    const result = schema.safeParse({ ...valid, message: 'x'.repeat(2001) });
    expect(result.success).toBe(false);
  });

  it('rejects implausible vehicle years', () => {
    expect(schema.safeParse({ ...valid, vehicleYear: '1800' }).success).toBe(false);
    expect((schema.parse({ ...valid, vehicleYear: '2024' }) as ParsedLeadValues).vehicleYear).toBe(2024);
  });
});
