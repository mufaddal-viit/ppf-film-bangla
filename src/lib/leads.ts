import 'server-only';
import { after } from 'next/server';
import { catalogConfig, formsConfig, securityConfig, siteConfig } from '@/lib/config';
import type { LeadType } from '@/lib/config/schema';
import { leadRepository, type NewLead } from '@/lib/db/repositories/lead.repository';
import { emailProvider } from '@/lib/email';
import { leadNotificationEmail } from '@/lib/email/lead-notification';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { buildLeadSchema, leadContextSchema, type LeadContext, type ParsedLeadValues } from '@/lib/validation/lead';
import { defineAction } from './actions/define';

function leadSchema(type: LeadType) {
  return buildLeadSchema({
    fields: formsConfig.variants[type].fields,
    phoneRegion: siteConfig.locale.phoneRegion,
    serviceSlugs: catalogConfig.services.map((s) => s.slug),
  }).extend({ context: leadContextSchema });
}

function toNewLead(type: LeadType, values: ParsedLeadValues, context: LeadContext): NewLead {
  const { vehicleMake: make, vehicleModel: model, vehicleYear: year } = values;
  return {
    type,
    name: values.name ?? '',
    phone: values.phone ?? '',
    ...(values.email && { email: values.email }),
    ...((make || model || year) && { vehicle: { make, model, year } }),
    ...(values.service && { service: values.service }),
    ...(values.preferredTime && { preferredTime: values.preferredTime }),
    ...(values.message && { message: values.message }),
    locale: context.locale,
    sourcePage: context.sourcePage,
    ...(context.landingPage && { landingPage: context.landingPage }),
    ...(context.referrer && { referrer: context.referrer }),
    ...(context.utm && { utm: context.utm }),
    consent: { given: true, at: new Date(), policyVersion: formsConfig.privacyPolicyVersion },
  };
}

/** Builds the server action for one lead form variant. */
export function leadAction(type: LeadType) {
  return defineAction({
    name: `lead:${type}`,
    rateLimit: securityConfig.rateLimits[type],
    schema: leadSchema(type),
    decoy: null,
    async handler({ context, ...values }) {
      // The schema shape comes from config, so its output is typed loosely; fields match ParsedLeadValues.
      const lead = toNewLead(type, values as ParsedLeadValues, context);
      const { id } = await leadRepository.create(lead);
      logger.info('lead.created', { leadId: id, type, locale: lead.locale, service: lead.service });

      // Send the notification after the response so the visitor never waits on email.
      after(async () => {
        try {
          await emailProvider.send(leadNotificationEmail(lead, id, env.LEAD_NOTIFICATION_TO, siteConfig.business.name));
        } catch (error) {
          logger.error('lead.notification_failed', { leadId: id }, error);
        }
      });
      return null;
    },
  });
}
