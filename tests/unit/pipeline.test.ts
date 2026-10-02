import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { createActionPipeline, type PipelineDeps } from '@/lib/actions/pipeline';
import { memoryLimiter } from '@/lib/security/rate-limit';

const meta = { ip: '203.0.113.7', origin: 'https://www.example.ae', host: 'www.example.ae' };

function setup(overrides: Partial<PipelineDeps> = {}) {
  const handler = vi.fn(async (data: { name: string }) => ({ greeting: `hi ${data.name}` }));
  const deps: PipelineDeps = {
    getRequestMeta: async () => meta,
    isAllowedOrigin: () => true,
    rateLimit: memoryLimiter(),
    verifyTurnstile: async (token) => token === 'good-token',
    ...overrides,
  };
  const action = createActionPipeline(deps)({
    name: 'test',
    rateLimit: { requests: 2, windowSeconds: 60 },
    schema: z.object({ name: z.string().min(2, 'too_short') }),
    handler,
    decoy: { greeting: 'decoy' },
  });
  return { action, handler };
}

const envelope = (payload: unknown, security: Record<string, string> = { turnstileToken: 'good-token' }) => ({
  payload,
  security,
});

describe('action pipeline', () => {
  it('runs the handler and returns typed data on success', async () => {
    const { action, handler } = setup();
    await expect(action(envelope({ name: 'Sara' }))).resolves.toEqual({ ok: true, data: { greeting: 'hi Sara' } });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('rejects requests from foreign origins before anything else', async () => {
    const { action, handler } = setup({ isAllowedOrigin: () => false });
    await expect(action(envelope({ name: 'Sara' }))).resolves.toEqual({ ok: false, code: 'FORBIDDEN' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('rate limits per IP', async () => {
    const { action } = setup();
    await action(envelope({ name: 'Sara' }));
    await action(envelope({ name: 'Sara' }));
    await expect(action(envelope({ name: 'Sara' }))).resolves.toEqual({ ok: false, code: 'RATE_LIMITED' });
  });

  it('silently returns the decoy when the honeypot is filled', async () => {
    const { action, handler } = setup();
    const result = await action(envelope({ name: 'Bot' }, { turnstileToken: 'good-token', honeypot: 'http://spam' }));
    expect(result).toEqual({ ok: true, data: { greeting: 'decoy' } });
    expect(handler).not.toHaveBeenCalled();
  });

  it('fails the bot check without a valid Turnstile token', async () => {
    const { action } = setup();
    await expect(action(envelope({ name: 'Sara' }, {}))).resolves.toEqual({ ok: false, code: 'BOT_CHECK_FAILED' });
  });

  it('skips Turnstile when it is disabled in config', async () => {
    const { action } = setup({ verifyTurnstile: null });
    await expect(action(envelope({ name: 'Sara' }, {}))).resolves.toMatchObject({ ok: true });
  });

  it('returns field errors from validation', async () => {
    const { action } = setup();
    await expect(action(envelope({ name: 'S' }))).resolves.toEqual({
      ok: false,
      code: 'VALIDATION_FAILED',
      fieldErrors: { name: 'too_short' },
    });
  });

  it('rejects malformed envelopes', async () => {
    const { action } = setup();
    await expect(action('not an object')).resolves.toEqual({ ok: false, code: 'VALIDATION_FAILED' });
  });

  it('hides internal errors behind a stable code', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { action } = setup({
      getRequestMeta: async () => {
        throw new Error('db password leaked in message');
      },
    });
    const result = await action(envelope({ name: 'Sara' }));
    expect(result).toEqual({ ok: false, code: 'INTERNAL' });
    expect(JSON.stringify(result)).not.toContain('password');
    consoleError.mockRestore();
  });
});
