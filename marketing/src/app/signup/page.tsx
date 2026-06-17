'use client';

import { useEffect } from 'react';

/**
 * /signup/ now redirects to the dashboard signup flow.
 * The marketing site no longer owns the signup form — it lives with the dashboard.
 */
export default function SignupRedirect() {
  useEffect(() => {
    window.location.replace('/dashboard/signup');
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
          <a href="/dashboard/signup">Continue to signup</a>
        </p>
      </noscript>
    </div>
  );
}
