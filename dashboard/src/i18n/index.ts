import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import it from './it.json';
import es from './es.json';

export const SUPPORTED_LOCALES = ['en', 'it', 'es'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_MAP: Record<string, string> = {
  en: 'en-GB',
  it: 'it-IT',
  es: 'es-ES',
};

export function getIntlLocale(lng?: string): string {
  const lang = lng || i18n.language || 'en';
  return LOCALE_MAP[lang] || 'en-GB';
}

export function formatDate(date: string | Date | null | undefined, lng?: string): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  const locale = getIntlLocale(lng);
  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date | null | undefined, lng?: string): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  const locale = getIntlLocale(lng);
  return d.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumber(value: number | null | undefined, lng?: string): string {
  if (value === null || value === undefined) return '0';
  const locale = getIntlLocale(lng);
  return value.toLocaleString(locale);
}

export function formatCurrency(value: number | null | undefined, lng?: string, currency = 'EUR'): string {
  if (value === null || value === undefined) return '0';
  const locale = getIntlLocale(lng);
  return value.toLocaleString(locale, {
    style: 'currency',
    currency,
  });
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      it: { translation: it },
      es: { translation: es },
    },
    fallbackLng: 'es',
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'preferredLocale',
      caches: ['localStorage'],
    },
  });

export default i18n;
