'use client';

import { useEffect } from 'react';
import { routing } from '@/i18n/routing';

/**
 * Root redirect: picks a locale based on
 *   1. cookie NEXT_LOCALE (previous explicit choice)
 *   2. localStorage NEXT_LOCALE (previous explicit choice)
 *   3. navigator.language (first visit)
 *   4. defaultLocale (fallback)
 *
 * Executed client-side to remain compatible with `output: 'export'` (no middleware).
 */
export default function RootRedirect() {
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

    window.location.replace(`/${chosen}`);
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
          JavaScript is required to auto-detect your language. Choose one:
          {' '}<a href="/en">English</a>
          {' · '}<a href="/it">Italiano</a>
          {' · '}<a href="/es">Español</a>
        </p>
      </noscript>
    </div>
  );
}
