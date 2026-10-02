import 'server-only';
import { Resend } from 'resend';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export type EmailMessage = { to: string[]; subject: string; text: string; html: string; replyTo?: string };

/** Transactional email behind one method, so the provider can change without touching callers. */
interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

function resendProvider(apiKey: string, from: string): EmailProvider {
  const client = new Resend(apiKey);
  return {
    async send(message) {
      const { error } = await client.emails.send({ from, ...message });
      if (error) throw new Error(`Resend: ${error.name}`);
    },
  };
}

/** Development only: confirms an email would be sent without printing personal data. */
const consoleProvider: EmailProvider = {
  async send(message) {
    logger.info('email.console', { subject: message.subject, recipients: message.to.length });
  },
};

export const emailProvider: EmailProvider =
  env.EMAIL_PROVIDER === 'resend' ? resendProvider(env.RESEND_API_KEY!, env.EMAIL_FROM!) : consoleProvider;
