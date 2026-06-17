'use client';

import { useEffect } from 'react';
import { routing } from '@/i18n/routing';

/**
 * Locale-aware redirect for the legacy /contact/ URL — sends visitors
 * to the localized contact page (/{locale}/contact/).
 */
export default function ContactRedirect() {
  useEffect(() => {
    const supported = routing.locales as readonly string[];

    const readCookie = () => {
      const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    };

    const stored = readCookie() || (() => {
      try { return localStorage.getItem('NEXT_LOCALE'); } catch { return null; }
    })();

    const fromNavigator = typeof navigator !== 'undefined'
      ? (navigator.languages || [navigator.language])
          .map((l) => l?.toLowerCase().split('-')[0])
          .find((l) => l && supported.includes(l))
      : null;

    const chosen = (stored && supported.includes(stored) ? stored : null)
      ?? fromNavigator
      ?? routing.defaultLocale;

    window.location.replace(`/${chosen}/contact/`);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Helvetica Neue', Helvetica, system-ui, sans-serif",
        color: '#0c0c0d',
        background: '#f7f4ee',
      }}
    >
      <noscript>
        <p>
          Choose:
          {' '}<a href="/en/contact/">English</a>
          {' · '}<a href="/it/contact/">Italiano</a>
          {' · '}<a href="/es/contact/">Español</a>
        </p>
      </noscript>
    </div>
  );
}
