import { describe, expect, it, vi } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

// leads.ts wires real infrastructure at import; only its pure helpers are under test here.
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/auth/session', () => ({ requireSession: vi.fn() }));
vi.mock('@/lib/security/request', () => ({ getRequestMeta: vi.fn(), isAllowedOrigin: vi.fn() }));
vi.mock('@/lib/db/repositories/audit.repository', () => ({ auditRepository: {} }));
vi.mock('@/lib/db/repositories/lead.repository', () => ({ leadRepository: {} }));

const { leadsToCsv, parseLeadFilter } = await import('@/lib/admin/leads');

describe('password hashing', () => {
  it('verifies the right password and rejects a wrong one', async () => {
    const hash = await hashPassword('correct horse battery');
    expect(hash).toMatch(/^scrypt\$15\$8\$1\$/);
    await expect(verifyPassword('correct horse battery', hash)).resolves.toBe(true);
    await expect(verifyPassword('correct horse batterx', hash)).resolves.toBe(false);
  });

  it('salts every hash', async () => {
    expect(await hashPassword('same password')).not.toBe(await hashPassword('same password'));
  });

  it('returns false for a malformed stored hash instead of throwing', async () => {
    for (const stored of [
      '',
      'plaintext',
      'scrypt$15$8$1$salt',
      'bcrypt$15$8$1$c2FsdA$aGFzaA',
      'scrypt$99$8$1$c2FsdA$aGFzaA',
    ]) {
      await expect(verifyPassword('anything', stored)).resolves.toBe(false);
    }
  });
});

describe('lead list filters', () => {
  it('keeps known values and drops unknown ones', () => {
    expect(parseLeadFilter({ status: 'won', type: 'quote', q: ' sara ' })).toEqual({
      status: 'won',
      type: 'quote',
      q: 'sara',
    });
    expect(parseLeadFilter({ status: 'deleted', type: ['callback', 'quote'], q: '' })).toEqual({ type: 'callback' });
  });
});

describe('lead CSV export', () => {
  const lead = {
    id: '65f000000000000000000001',
    type: 'quote' as const,
    status: 'new' as const,
    name: '=HYPERLINK("http://evil.example","Click")',
    phone: '+971500000001',
    message: 'Line one\nLine "two", with a comma',
    locale: 'en',
    sourcePage: '/en/contact',
    consent: { given: true as const, at: new Date('2026-10-01T08:00:00Z'), policyVersion: '1' },
    notes: [],
    createdAt: new Date('2026-10-01T08:00:00Z'),
    updatedAt: new Date('2026-10-01T08:00:00Z'),
  };
  const [header, ...rows] = leadsToCsv([lead]).replace('﻿', '').trimEnd().split('\r\n');

  it('starts with a header row', () => {
    expect(header).toContain('Received,Status,Type,Name,Phone');
  });

  it('neutralises spreadsheet formulas typed by visitors', () => {
    expect(rows.join('\n')).toContain(`"'=HYPERLINK(""http://evil.example"",""Click"")"`);
  });

  it('keeps the plus on phone numbers and quotes multi-line text', () => {
    const body = rows.join('\n');
    expect(body).toContain(',+971500000001,');
    expect(body).toContain('"Line one\nLine ""two"", with a comma"');
  });
});

describe('admin action guard', async () => {
  const { requireSession } = await import('@/lib/auth/session');
  const { isAllowedOrigin } = await import('@/lib/security/request');
  const { ActionError, adminAction } = await import('@/lib/admin/action');
  const { z } = await import('zod');

  const staff = { userId: 'u1', email: 'staff@example.ae', name: 'Staff', role: 'staff' as const };
  const form = (values: Record<string, string>) => {
    const data = new FormData();
    for (const [key, value] of Object.entries(values)) data.set(key, value);
    return data;
  };

  function setup(options: { role?: 'owner'; originAllowed?: boolean } = {}) {
    vi.mocked(requireSession).mockResolvedValue(staff);
    vi.mocked(isAllowedOrigin).mockReturnValue(options.originAllowed ?? true);
    const handler = vi.fn(async (data: { name: string }) => {
      if (data.name === 'taken') throw new ActionError('That name is taken.');
      return `Saved ${data.name}.`;
    });
    const action = adminAction({
      name: 'test',
      role: options.role,
      schema: z.object({ name: z.string().min(2, 'Enter a name.') }),
      handler,
    });
    return { action, handler };
  }

  it('runs the handler and returns its message', async () => {
    const { action } = setup();
    await expect(action(null, form({ name: 'Sara' }))).resolves.toEqual({ ok: true, message: 'Saved Sara.' });
  });

  it('refuses staff on owner-only actions before the handler runs', async () => {
    const { action, handler } = setup({ role: 'owner' });
    await expect(action(null, form({ name: 'Sara' }))).resolves.toMatchObject({ ok: false });
    expect(handler).not.toHaveBeenCalled();
  });

  it('refuses requests from another origin', async () => {
    const { action, handler } = setup({ originAllowed: false });
    await expect(action(null, form({ name: 'Sara' }))).resolves.toMatchObject({ ok: false });
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns field errors for invalid input', async () => {
    const { action, handler } = setup();
    await expect(action(null, form({ name: 'S' }))).resolves.toMatchObject({
      ok: false,
      fieldErrors: { name: 'Enter a name.' },
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('shows handler errors meant for the user and hides unexpected ones', async () => {
    const { action, handler } = setup();
    await expect(action(null, form({ name: 'taken' }))).resolves.toEqual({ ok: false, message: 'That name is taken.' });
    handler.mockRejectedValueOnce(new Error('connection string leaked'));
    await expect(action(null, form({ name: 'Sara' }))).resolves.toEqual({
      ok: false,
      message: 'Something went wrong. Try again.',
    });
  });
});

describe('dashboard trend chart', () => {
  it('fills every day in the business timezone, oldest first', async () => {
    const { fillDays } = await import('@/lib/admin/chart');
    // 21:30 UTC on 7 Oct is already 8 Oct in Dubai.
    const points = fillDays({ '2026-10-08': 3, '2026-10-06': 1 }, 3, 'Asia/Dubai', new Date('2026-10-07T21:30:00Z'));
    expect(points.map((point) => [point.key, point.value])).toEqual([
      ['2026-10-06', 1],
      ['2026-10-07', 0],
      ['2026-10-08', 3],
    ]);
    expect(points[2]?.label).toBe('8 Oct');
  });

  it('draws a line that stays inside the box and closes the area', async () => {
    const { trendPaths } = await import('@/lib/admin/chart');
    const { line, area } = trendPaths([0, 4, 2], 100, 50);
    expect(line.startsWith('M0,50')).toBe(true);
    expect(line).toContain('50,6');
    expect(line.endsWith('100,28')).toBe(true);
    expect(area.endsWith('L100,50 L0,50 Z')).toBe(true);
    expect(trendPaths([5], 100, 50)).toEqual({ line: '', area: '' });
  });
});
