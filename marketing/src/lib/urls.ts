/**
 * Single source of truth for links from the marketing site into the merchant
 * dashboard.
 *
 * The dashboard is a SEPARATE deploy from this marketing site:
 *   - same origin (old loyali.online, or relative paths)  → leave the env unset
 *   - split origins on Render (marketing static site vs. the `loyalty-api`
 *     service that serves /dashboard) → set NEXT_PUBLIC_DASHBOARD_URL to the
 *     API host, e.g. https://loyalty-api.onrender.com
 *   - local dev (marketing :5174, dashboard :5173)        → http://localhost:5173
 *
 * ⚠ This is a static export: NEXT_PUBLIC_* is inlined at BUILD time, so the
 * marketing site must be rebuilt/redeployed after changing the value.
 *
 * Unset → relative paths (/dashboard/...), i.e. the previous behaviour.
 */
const BASE = (process.env.NEXT_PUBLIC_DASHBOARD_URL || '').replace(/\/+$/, '');

export const DASHBOARD_LOGIN_URL = `${BASE}/dashboard/`;
export const DASHBOARD_SIGNUP_URL = `${BASE}/dashboard/signup`;
