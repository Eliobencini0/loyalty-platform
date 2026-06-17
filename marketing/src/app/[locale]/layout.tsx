import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import NewsletterSignup from '@/components/NewsletterSignup';
import { FOOTER_EMAIL, FOOTER_PHONE, FOOTER_LOCATION } from '@/lib/contact';
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const ogLocaleMap: Record<string, string> = { en: 'en_US', it: 'it_IT', es: 'es_ES' };

  return {
    title: {
      default: t('title'),
      template: t('titleTemplate'),
    },
    description: t('description'),
    authors: [{ name: "Loyali", url: "https://loyali.online" }],
    creator: "Loyali",
    publisher: "Loyali",
    applicationName: "Loyali",
    referrer: "origin-when-cross-origin",
    category: "Business Software",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
      apple: '/favicon.svg',
      shortcut: '/favicon.svg',
    },
    manifest: '/manifest.json',
    openGraph: {
      type: 'website',
      locale: ogLocaleMap[locale] ?? 'en_US',
      alternateLocale: Object.values(ogLocaleMap).filter((l) => l !== ogLocaleMap[locale]),
      url: `https://loyali.online/${locale}`,
      siteName: 'Loyali',
      title: t('title'),
      description: t('shortDescription'),
      images: [
        {
          url: 'https://loyali.online/og-image.png',
          width: 1200,
          height: 630,
          alt: t('ogImageAlt'),
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@loyali',
      creator: '@loyali',
      title: t('title'),
      description: t('twitterDescription'),
      images: [{ url: 'https://loyali.online/og-image.png', alt: t('ogImageAlt') }],
    },
    alternates: {
      canonical: `https://loyali.online/${locale}`,
      languages: {
        en: 'https://loyali.online/en',
        it: 'https://loyali.online/it',
        es: 'https://loyali.online/es',
        'x-default': 'https://loyali.online/en',
      },
    },
    metadataBase: new URL('https://loyali.online'),
    formatDetection: { email: false, address: false, telephone: false },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  interactiveWidget: 'resizes-content',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7750e7' },
    { media: '(prefers-color-scheme: dark)', color: '#4F46E5' },
  ],
  colorScheme: 'light',
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Loyali",
    "inLanguage": locale,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "EUR",
      "lowPrice": "9",
      "highPrice": "12",
      "offerCount": "2",
    },
    "description": t('metadata.description'),
    "url": `https://loyali.online/${locale}`,
    "availableLanguage": ["en", "it", "es"],
    "provider": {
      "@type": "Organization",
      "name": "Loyali",
      "url": "https://loyali.online",
      "logo": "https://loyali.online/favicon.svg",
      "availableLanguage": ["en", "it", "es"],
      "areaServed": ["IT", "ES", "EU"],
    },
    // aggregateRating intentionally omitted while pre-launch — Google
    // penalizes fabricated review counts and we're at 0 customers.
    // Re-add (with real numbers) once we collect verified reviews.
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Loyali",
    "inLanguage": locale,
    "description": t('metadata.description'),
    "brand": { "@type": "Brand", "name": "Loyali" },
    "offers": [
      {
        "@type": "Offer",
        "name": t('pricing.core.name'),
        "price": "9",
        "priceCurrency": "EUR",
        "description": t('pricing.core.tagline'),
      },
      {
        "@type": "Offer",
        "name": t('pricing.grow.name'),
        "price": "12",
        "priceCurrency": "EUR",
        "description": t('pricing.grow.tagline'),
      },
    ],
    // aggregateRating intentionally omitted (see organizationSchema above).
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "inLanguage": locale,
    "mainEntity": [1, 2, 3, 4, 5].map((i) => ({
      "@type": "Question",
      "name": t(`faq.q${i}.question`),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": t(`faq.q${i}.answer`),
      },
    })),
  };

  return (
    <html lang={locale}>
      <head>
        <link rel="alternate" hrefLang="en" href="https://loyali.online/en" />
        <link rel="alternate" hrefLang="it" href="https://loyali.online/it" />
        <link rel="alternate" hrefLang="es" href="https://loyali.online/es" />
        <link rel="alternate" hrefLang="x-default" href="https://loyali.online/en" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body>
        <NextIntlClientProvider>
          <nav className="nav">
            <a href={`/${locale}`} className="nav-brand">{t('nav.brand')}</a>
            <div className="nav-center">
              <a href={`/${locale}#features`}>{t('nav.features')}</a>
              <a href={`/${locale}#pricing`}>{t('nav.pricing')}</a>
              <a href={`/${locale}/contact/`}>{t('nav.contact')}</a>
            </div>
            <div className="nav-actions">
              <LanguageSwitcher />
              <a href="/dashboard/" className="nav-link-secondary">{t('nav.login')}</a>
              <a href="/dashboard/signup" className="nav-cta">{t('nav.cta')}</a>
            </div>
          </nav>

          <main>{children}</main>

          <footer className="footer">
            <div className="footer-grid">
              <div className="footer-join">
                <p className="footer-logo">{t('nav.brand')}</p>
                <p className="footer-tagline">{t('footer.tagline')}</p>
                <p className="footer-eyebrow">{t('footer.joinTitle')}</p>
                <p className="footer-join-subtitle">{t('footer.joinSubtitle')}</p>
                <NewsletterSignup />
              </div>

              <div className="footer-contact">
                <p className="footer-eyebrow footer-eyebrow-right">{t('footer.contactTitle')}</p>
                <a href={`mailto:${FOOTER_EMAIL}`} className="footer-contact-line">
                  {FOOTER_EMAIL}
                </a>
                <a href={`tel:${FOOTER_PHONE.replace(/\s/g, '')}`} className="footer-contact-line">
                  {FOOTER_PHONE}
                </a>
                <p className="footer-contact-line footer-contact-meta">{FOOTER_LOCATION}</p>
              </div>
            </div>

            <div className="footer-bottom">
              <p>&copy; {new Date().getFullYear()} Loyali. {t('footer.copyright')}</p>
              <div className="footer-legal-links">
                <a href={`/${locale}/privacy/`}>{t('footer.linkPrivacy')}</a>
              </div>
            </div>
          </footer>

          <FloatingWhatsApp />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
