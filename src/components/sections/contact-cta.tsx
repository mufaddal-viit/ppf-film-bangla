import { getTranslations } from 'next-intl/server';
import { LazyLeadForm } from '@/components/forms/lazy-lead-form';
import { WhatsAppIcon } from '@/components/icons/brand';
import { Section } from '@/components/ui/section';
import { TrackedLink } from '@/components/ui/tracked-link';
import type { SectionProps } from './types';

export async function ContactCta({ section, data }: SectionProps<'contactCta'>) {
  const t = await getTranslations({ locale: data.locale, namespace: 'contact' });
  const tForm = await getTranslations({ locale: data.locale, namespace: 'form' });
  const { site } = data;

  return (
    <Section
      id={section.id}
      name="contactCta"
      heading={section.heading}
      intro={section.intro}
      className="c-contact-cta"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="c-card">
          <LazyLeadForm {...data.leadForms[section.formVariant]} />
        </div>

        <div className="c-contact-details space-y-6">
          <div>
            <p className="mb-2 font-medium">{tForm('orWhatsapp')}</p>
            <TrackedLink
              href={data.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="c-button"
              event={{ name: 'whatsapp_click', location: 'contact-section' }}
            >
              <WhatsAppIcon className="size-5" />
              {t('whatsapp')}
            </TrackedLink>
          </div>

          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-muted-foreground">{t('call')}</dt>
              <dd>
                <TrackedLink
                  href={`tel:${site.phone.e164}`}
                  dir="ltr"
                  event={{ name: 'call_click', location: 'contact-section' }}
                >
                  {site.phone.display}
                </TrackedLink>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t('address')}</dt>
              <dd>
                <address className="not-italic">
                  {site.name}
                  {site.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <TrackedLink
                  href={site.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  event={{ name: 'directions_click', location: 'contact-section' }}
                >
                  {t('directions')}
                </TrackedLink>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t('hours')}</dt>
              <dd>
                <ul>
                  {site.hours.map((h) => (
                    <li key={h.days}>
                      {h.days}: <span dir="ltr">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>

          {section.showMap && site.mapEmbedUrl && (
            <iframe
              src={site.mapEmbedUrl}
              title={t('mapTitle')}
              className="c-map aspect-video w-full rounded-lg border border-border"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
        </div>
      </div>
    </Section>
  );
}
