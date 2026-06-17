'use client';

import { useEffect } from 'react';
import { routing } from '@/i18n/routing';

/**
 * /pricing/ now redirects to the pricing section on the localized
 * homepage (/{locale}#pricing). Keeps old inbound links working while
 * showing the single, up-to-date pricing section instead of a stale page.
 */
export default function PricingRedirect() {
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

    window.location.replace(`/${chosen}#pricing`);
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
          Go to pricing:
          {' '}<a href="/en#pricing">English</a>
          {' · '}<a href="/it#pricing">Italiano</a>
          {' · '}<a href="/es#pricing">Español</a>
        </p>
      </noscript>
    </div>
  );
}
