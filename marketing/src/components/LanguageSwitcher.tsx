'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';

const FLAGS: Record<string, string> = { en: '🇬🇧', it: '🇮🇹', es: '🇪🇸' };

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('languageSwitcher');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const switchTo = (newLocale: string) => {
    if (newLocale === locale) {
      setOpen(false);
      return;
    }
    // Remember user choice
    try {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; samesite=lax`;
      localStorage.setItem('NEXT_LOCALE', newLocale);
    } catch {
      // Ignore if storage unavailable
    }
    // Replace current locale segment in the URL
    const segments = pathname.split('/');
    if (segments.length > 1 && routing.locales.includes(segments[1] as typeof routing.locales[number])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join('/') || `/${newLocale}`);
    setOpen(false);
  };

  return (
    <div className="lang-switcher" ref={ref}>
      <button
        type="button"
        className="lang-switcher-trigger"
        aria-label={t('label')}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="lang-flag" aria-hidden="true">{FLAGS[locale]}</span>
        <span className="lang-code">{locale.toUpperCase()}</span>
      </button>
      {open && (
        <ul className="lang-switcher-menu" role="listbox">
          {routing.locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                className={`lang-switcher-option ${l === locale ? 'active' : ''}`}
                onClick={() => switchTo(l)}
              >
                <span className="lang-flag" aria-hidden="true">{FLAGS[l]}</span>
                <span>{t(l)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
