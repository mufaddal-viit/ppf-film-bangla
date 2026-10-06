import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/layout/footer';
import { FloatingActions } from '@/components/layout/floating-actions';
import { Header } from '@/components/layout/header';
import { TopBar } from '@/components/layout/top-bar';
import { Providers } from '@/components/providers';
import { JsonLd } from '@/components/seo/json-ld';
import { Analytics } from '@/components/tracking/analytics';
import { routing } from '@/i18n/routing';
import { integrationsConfig, layoutConfig, seoConfig, siteConfig } from '@/lib/config';
import { getNavigation, getSite, getWhatsAppUrl, ROUTES } from '@/lib/content';
import { localBusinessJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, localePath, SITE_URL } from '@/lib/seo/metadata';
import { buildThemeCss, themeAttributes, themeBackground } from '@/lib/theme';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const site = await getSite(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: { template: seoConfig.titleTemplate, default: site.name },
    description: site.description,
    applicationName: site.name,
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: themeBackground(),
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [site, navigation, whatsappUrl, t] = await Promise.all([
    getSite(locale),
    getNavigation(locale),
    getWhatsAppUrl(locale),
    getTranslations({ locale }),
  ]);
  const locales = siteConfig.locale.locales.map((code) => ({
    code,
    label: t(`locale.${code}` as 'locale.en'),
  }));
  const logo = absoluteUrl(site.logo.src);

  return (
    <html lang={locale} dir={site.dir} suppressHydrationWarning {...themeAttributes()}>
      <head>
        {/* Generated from config/theme.ts. */}
        <style href="theme-tokens" precedence="high">
          {buildThemeCss()}
        </style>
      </head>
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <Providers>
            <a
              href="#main"
              className="c-skip-link c-button sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50"
            >
              {t('a11y.skipToContent')}
            </a>
            {layoutConfig.topBar.enabled && (
              <TopBar
                site={site}
                whatsappUrl={whatsappUrl}
                locales={locales}
                labels={{
                  whatsapp: t('contact.whatsapp'),
                  areaServed: t('contact.areaServed', { areas: site.areaServed }),
                  language: t('locale.switchLabel'),
                }}
              />
            )}
            {layoutConfig.header.enabled && (
              <Header
                site={site}
                items={navigation.header}
                showQuoteButton={layoutConfig.header.showQuoteButton}
                whatsappUrl={whatsappUrl}
                labels={{
                  nav: t('a11y.mainNav'),
                  open: t('a11y.openMenu'),
                  close: t('a11y.closeMenu'),
                  quote: t('contact.getQuote'),
                  home: t('nav.home'),
                }}
              />
            )}
            <main id="main" tabIndex={-1}>
              {children}
            </main>
            {layoutConfig.footer.enabled && (
              <Footer
                site={site}
                navigation={navigation}
                labels={{
                  nav: t('a11y.footerNav'),
                  contact: t('nav.contact'),
                  hours: t('contact.hours'),
                  follow: t('footer.follow'),
                  payments: t('footer.payments'),
                  rights: t('footer.rights', { year: new Date().getFullYear(), name: site.legalName }),
                  newTab: t('a11y.opensInNewTab'),
                }}
              />
            )}
            {layoutConfig.floatingActions.enabled && (
              <FloatingActions
                site={site}
                whatsappUrl={whatsappUrl}
                actions={layoutConfig.floatingActions.actions}
                labels={{
                  call: t('contact.call'),
                  map: t('contact.directions'),
                  whatsapp: t('contact.whatsapp'),
                  region: t('a11y.quickActions'),
                }}
              />
            )}
            {integrationsConfig.gtm.enabled && (
              <Analytics
                gtmId={integrationsConfig.gtm.containerId}
                privacyHref={ROUTES.privacyPolicy}
                labels={{
                  message: t('consent.message'),
                  accept: t('consent.accept'),
                  reject: t('consent.reject'),
                  learnMore: t('consent.learnMore'),
                  region: t('a11y.cookiePreferences'),
                }}
              />
            )}
          </Providers>
        </NextIntlClientProvider>
        <JsonLd data={organizationJsonLd(site, { siteUrl: SITE_URL, logo })} />
        <JsonLd data={websiteJsonLd(site, { siteUrl: SITE_URL, locale })} />
        <JsonLd
          data={localBusinessJsonLd(site, {
            siteUrl: SITE_URL,
            pageUrl: absoluteUrl(localePath(locale, '/')),
            image: absoluteUrl(seoConfig.defaultOgImage.src),
            logo,
            reviews: null,
          })}
        />
      </body>
    </html>
  );
}
