# Analytics — Umami Self-Hosted

Self-hosted [Umami](https://umami.is/) for marketing-site traffic on `loyali.online`. Privacy-first (no cookies, no PII), GDPR-friendly, runs on the existing Hetzner VPS. €0/month.

## Status

| Phase | What | Status |
|-------|------|--------|
| 1 | Infra (Docker, init SQL, nginx HTTP block, secrets) | ✅ Shipped (PR #49 + #50). `umami` container running on the VPS. |
| 2 | DNS A `analytics.loyali.online` → `46.224.138.230` + `certbot --nginx` | ⏳ Operator action |
| 3 | First login → rotate admin password → add website → return UUID | ⏳ Operator action |
| 4 | Tracking script + custom events in `marketing/src/app/[locale]/layout.tsx` + restore `:443` block in `nginx-production.conf` | ⏳ Pending Phase 3 UUID |

## What gets measured

Out of the box: pageviews, unique visitors, top pages, referrers, geography, device/browser, bounce rate, session duration.

Custom events to add in Phase 4:
- `cta_signup_click` — primary "Start the magic"
- `cta_sales_click` — "Let's talk"
- `lang_switch` (with `from` / `to`)
- `pricing_view` (scroll-into-view)

## Architecture

- One extra Docker container (`umami`), reuses the existing Postgres 16 instance with an isolated `umami` database/user (created by `deploy/init-umami-db.sql`).
- Reached via nginx at `analytics.loyali.online` (dedicated SSL cert).
- `umami` container is not bound to a host port — only nginx talks to it.

Files involved:
- `docker-compose.umami.yml` — Umami service definition
- `deploy/init-umami-db.sql` — DB + user bootstrap
- `deploy/nginx-production.conf` — `analytics.loyali.online` server block
- `marketing/src/app/[locale]/layout.tsx` — tracking script (Phase 4)

## Operator runbook

### Phase 2 — DNS + SSL

1. Add DNS record on the registrar:

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | A | `analytics` | `46.224.138.230` | Auto |

   Verify: `dig +short analytics.loyali.online` → `46.224.138.230`.

2. SSH to the server as root and issue the cert:
   ```bash
   ssh root@46.224.138.230
   sudo certbot --nginx -d analytics.loyali.online
   # Redirect HTTP → HTTPS: choose option 2
   ```

3. Verify: `curl -I https://analytics.loyali.online/` returns 200.

   If 502/503 — the container isn't up. Inspect:
   ```bash
   cd /opt/loyalty-platform
   docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.umami.yml logs umami --tail 50
   ```

### Phase 3 — Umami initial setup

1. Open `https://analytics.loyali.online/`. Login with `admin` / `umami`.
2. **Immediately rotate the admin password** (avatar → Profile → Change password). Store it in a password manager.
3. **Settings → Websites → Add website** — Name `Loyali Marketing`, Domain `loyali.online`. Save.
4. Open the website → Edit → copy the **Website ID** (UUID). Send it to wire Phase 4.
5. (Optional) **Settings → Users** to add additional viewers. Default role `viewer` is read-only.

### Phase 4 — Tracking integration

After receiving the UUID, a follow-up PR adds:

```html
<script defer src="https://analytics.loyali.online/script.js"
        data-website-id="<UUID>"></script>
```

plus the custom-event hooks listed above. Verify by visiting the marketing site and watching the Umami dashboard for ~5 min.

## Maintenance

- **Backups**: the `umami` DB is included in the `pg_dumpall` snapshot taken by `deploy/deploy.sh` before each production migration. Last 10 dumps in `/opt/loyalty-platform/backups/db-*.sql.gz`.
- **Updates**: next production deploy pulls `docker.umami.is/umami-software/umami:postgresql-latest`. Pin a version by editing the `image:` tag in `docker-compose.umami.yml`.
- **Stop**: `docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.umami.yml stop umami umami-db-init`
- **Logs**: `docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.umami.yml logs -f umami`

## Privacy / GDPR

Umami stores no IPs, no cookies, no fingerprints, no cross-site identifiers — only anonymized session info, URL paths, referrer, country (derived then discarded), device class, browser. No cookie banner required for analytics alone. When the public privacy policy lands (e.g., at signup launch), mention "privacy-first analytics that does not store personal data".

The default `auth_basic` is off on production, so the dashboard is reachable on the public internet — Umami's own login is the access control. Rotate the admin password before exposing it (Phase 3 step 2).
