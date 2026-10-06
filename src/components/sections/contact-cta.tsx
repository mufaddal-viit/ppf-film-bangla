import { ArrowUpRight, Clock, MapPin, Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { LazyLeadForm } from '@/components/forms/lazy-lead-form';
import { WhatsAppIcon } from '@/components/icons/brand';
import { Section } from '@/components/ui/section';
import { TrackedLink } from '@/components/ui/tracked-link';
import type { SectionProps } from './types';

/**
 * Contact stage: the map fills a large rounded stage; the form floats over it as a white card
 * and the contact details as a dark glass card. On small screens the three stack.
 */
export async function ContactCta({ section, data }: SectionProps<'contactCta'>) {
  const t = await getTranslations({ locale: data.locale, namespace: 'contact' });
  const tForm = await getTranslations({ locale: data.locale, namespace: 'form' });
  const { site } = data;
  const hasMap = section.showMap && site.mapEmbedUrl !== null;

  return (
    <Section
      id={section.id}
      name="contactCta"
      heading={section.heading}
      intro={section.intro}
      className="c-contact-cta"
    >
      <div className="c-contact-stage" data-map={hasMap || undefined}>
        {hasMap && site.mapEmbedUrl && (
          <div className="c-contact-map">
            <iframe
              src={site.mapEmbedUrl}
              title={t('mapTitle')}
              className="c-map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}

        <div className="c-contact-details" data-tone="inverse">
          <dl className="c-contact-list">
            <div>
              <dt>
                <Phone aria-hidden="true" className="size-4" />
                {t('call')}
              </dt>
              <dd>
                <TrackedLink
                  href={`tel:${site.phone.e164}`}
                  dir="ltr"
                  className="c-contact-phone"
                  event={{ name: 'call_click', location: 'contact-section' }}
                >
                  {site.phone.display}
                </TrackedLink>
              </dd>
            </div>
            <div>
              <dt>
                <MapPin aria-hidden="true" className="size-4" />
                {t('address')}
              </dt>
              <dd>
                <address className="not-italic">
                  {site.name}
                  {site.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </dd>
            </div>
            {site.hours.length > 0 && (
              <div>
                <dt>
                  <Clock aria-hidden="true" className="size-4" />
                  {t('hours')}
                </dt>
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
            )}
          </dl>

          <div className="c-contact-actions">
            <TrackedLink
              href={site.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="c-contact-link"
              event={{ name: 'directions_click', location: 'contact-section' }}
            >
              {t('directions')}
              <ArrowUpRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            </TrackedLink>
            {site.whatsapp.enabled && (
              <TrackedLink
                href={data.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="c-contact-link"
                aria-label={tForm('orWhatsapp')}
                event={{ name: 'whatsapp_click', location: 'contact-section' }}
              >
                <WhatsAppIcon className="size-4" />
                {t('whatsapp')}
              </TrackedLink>
            )}
          </div>
        </div>

        <div className="c-contact-form">
          <LazyLeadForm {...data.leadForms[section.formVariant]} />
        </div>
      </div>
    </Section>
  );
}
