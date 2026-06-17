# Loyali — Loyalty Platform

## What is this?

Loyali is a SaaS platform for physical stores (bars, restaurants, shops) built on three pillars:
1. **Retention** — loyalty programs (points, stamps, tiers, rewards)
2. **Reputation** — public review management, private feedback collection
3. **Customer Intelligence** — behavioral data, satisfaction metrics, segmentation

The MVP focuses on pillar 1 (loyalty) + QR-based customer acquisition.

## Architecture

**Monorepo** with three frontend apps + one backend:

```
src/                  → Express API server (TypeScript, Prisma, PostgreSQL)
dashboard/            → B2B merchant dashboard (React 19, Vite, React Router)
customer/             → B2C customer web app (planned — not yet built)
marketing/            → Marketing website (Next.js, static export)
packages/ui/          → Shared design system (@loyali/ui)
deploy/               → Server provisioning and deploy scripts
prisma/               → Database schema and migrations
```

## Tech Stack

- **Backend**: Express.js + TypeScript + Prisma v7 + PostgreSQL 16
- **Dashboard**: React 19 + Vite 8 + React Router 7 + i18next (en/it/es)
- **Marketing**: Next.js 15 with static export (`output: 'export'`)
- **Design System**: `packages/ui/` — CSS tokens (from `design/design-tokens.json`), shared React components
- **Database**: PostgreSQL 16 via `@prisma/adapter-pg` (PrismaPg adapter required)
- **Docker**: Multi-stage Dockerfile, docker-compose files for dev/staging/prod
- **CI/CD**: GitHub Actions — ci.yml, deploy.yml, preview.yml
- **Server**: Hetzner VPS (46.224.138.230), Nginx reverse proxy, Let's Encrypt SSL

## URLs

| Environment | URL | Notes |
|---|---|---|
| Production | `https://loyali.online` | Public, no basic auth (removed in PR #45) |
| Staging | `https://staging.loyali.online` | Behind nginx basic auth |
| Preview | `http://pr-N.preview.loyali.online` | Auto-deployed per PR, behind nginx basic auth |
| Analytics | `https://analytics.loyali.online` | Umami self-hosted (PR #49, awaiting DNS+SSL — see `ANALYTICS.md`) |

### URL Paths
- `/` — Marketing website (client-side redirect to `/{locale}` based on cookie / browser language)
- `/en`, `/it`, `/es` — Localized marketing pages (next-intl, PR #44)
- `/{locale}/contact/` — Contact page with WhatsApp + email form (PR #52)
- `/contact/` — Locale-aware redirect to `/{locale}/contact/`
- `/pricing/` — Locale-aware redirect to `/{locale}#pricing`
- `/signup/` — Redirects to `/dashboard/signup`
- `/{locale}/privacy` — Privacy policy (en/it/es), linked from join form
- `/dashboard/` — B2B merchant dashboard (default locale `es` — primary market)
- `/app/join/:merchantId` — B2C join flow (`customer/public/join.html`) — used when merchant has a LoyaltyProgram but no active campaign
- `/app/loyalty/:token` — B2C loyalty card page (`customer/public/loyalty.html`) — chartreuse hero, points + progress to next reward, sticky "Show to earn points" QR overlay, recent activity
- `/app/review/:merchantId` — B2C review redirect flow
- `/api/` — REST API (all routes under /api/ prefix)
- `/health` — Health check (no auth)

Customer pages fall back to `en` when `navigator.language` is not en/it/es.

## Development

```bash
# Install dependencies
npm install
cd dashboard && npm install
cd ../marketing && npm install

# Generate Prisma client
npx prisma generate

# Run backend (requires DATABASE_URL in .env)
npm run dev

# Run dashboard dev server (proxies /api to localhost:3000)
npm run dev:dashboard

# Run marketing dev server
cd marketing && npm run dev

# Seed database
npm run db:seed

# Build everything
npm run build
```

### Docker (local dev)
```bash
DB_PASSWORD=devpassword docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```
Note: If port 5432 is in use, change the DB port in docker-compose.dev.yml.

## API Authentication

- **B2B (merchants)**: `X-API-Key` header with merchant UUID
- **B2C (customers)**: Planned — email magic link + JWT Bearer token
- **Public B2C endpoints** (no auth):
  - `GET  /api/loyalty/:merchantId/public-summary` — feeds the join page
  - `POST /api/loyalty/:merchantId/join` — idempotent enrollment (firstName req, lastName opt, email req, marketing consent opt; GDPR consent is implicit via Art. 6(1)(b))
- **Nginx**: basic auth on `staging` + preview subdomains; production (`loyali.online`) is public. Catch-all server (IP/unknown host) requires basic auth.

## Environment Variables

| Var | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | backend | Postgres connection |
| `GOOGLE_MAPS_API_KEY` | backend | **Required** for `extractPlaceIdFromUrl` Pattern 5 (hex CID → ChIJ resolution via Places Details API). Live in production: set as both a GitHub repo secret and a `production` environment secret, propagated through `.github/workflows/deploy.yml` (`env:` + `envs:` + script export) → `docker-compose.yml` `app` env block → `process.env.GOOGLE_MAPS_API_KEY`. Pattern 5 regex matches both `!1s0xHEX:0xHEX` and `ftid=0xHEX:0xHEX` (the latter is what `maps.app.goo.gl` expands to for many businesses). `src/routes/merchants.ts` clears `googlePlaceId` before re-extracting on every settings update so a stale ChIJ can't survive a failed re-extract. ~$17/1k lookups, $200/mo free tier. |
| `UMAMI_DB_PASSWORD`, `UMAMI_APP_SECRET` | server | Auto-generated by `deploy/deploy.sh` on first run |

## Database

- Schema: `prisma/schema.prisma`
- Models: Merchant, Customer, LoyaltyCard, CardTemplate, PointsTransaction
- Adapter: Must use `PrismaPg` adapter (not bare `PrismaClient()`)
- Migrations: `prisma/migrations/` — run `npx prisma migrate deploy`
- Seed: `prisma/seed/seed.ts` — creates 2 merchants, 2 customers, 3 cards, 6 transactions

### Consent model (GDPR)

Migration `20260501010000_move_consents_to_loyalty_card` moved `gdprConsentAt` and `marketingConsentAt` from `Customer` (global) to `LoyaltyCard` (per-merchant), and added `marketingRevokedAt`. Rationale: the **merchant is the data controller**, Loyali is processor — consent must be scoped per merchant relationship, not globally on the Customer record. The marketing consent text on the join form interpolates the merchant name to make the controller relationship explicit.

## Design System

- Tokens: `design/design-tokens.json` → `packages/ui/src/tokens.css` (auto-generated)
- Brand: `design/brand-guidelines.md` — Loyali, Indigo primary (#4F46E5), Inter font, Lucide icons
- Generate tokens: `node packages/ui/scripts/generate-tokens.cjs`
- Dashboard imports: `import '../../packages/ui/src/index.css'` in `dashboard/src/main.tsx`
- Marketing imports: tokens copied via `prebuild` script in `marketing/package.json`

Recent additions (use these instead of ad-hoc Tailwind):
- `.app-status-pill` with `-ok` / `-warn` modifiers — driven by `--success` / `--warning` tokens via `color-mix`. Used on `/review-settings`, `/campaigns`.
- `.stack-md` / `.stack-sm` — gap-driven spacing utilities; intrinsic margins reset.
- `.review-flow-steps` — icon-list pattern reused across Reviews, Campaigns, Settings "how it works" cards.
- `.pwa-prompt-title` (DM Sans bold) — replaces `.title-expressive` (DM Serif italic) on the PWA install prompt h3 to match dashboard style.
- Hub-hero "Add points" button: layered shadow + chartreuse glow + shimmer with `prefers-reduced-motion` fallback.

### Marketing Website (Live)

The marketing website (`marketing/`) is live at `https://loyali.online/`.

- **Design**: Luyoa-style (`https://luyoa.com/en/`). Purple `#7750e7`, beige `#f7f4ee`, Helvetica Neue, rounded 40-54px.
- **Tokens**: `marketing/src/app/tokens.css` (Luyoa-inspired, independent from dashboard).
- **i18n**: `next-intl` with `[locale]` routes (`en`, `it`, `es`). Translations in `marketing/messages/`.
- **Components**: `marketing/src/components/` — `LanguageSwitcher`, `FloatingWhatsApp`, `NewsletterSignup`.
- **Contact constants**: `marketing/src/lib/contact.ts` — single source of truth for WhatsApp number, contact email, footer email/phone/location.
- **Privacy page**: `marketing/src/app/[locale]/privacy/` (en/it/es) — linked from the join form's consent text.
- **Documentation**: `MARKETING_REDESIGN.md` covers the design system. For post-launch history use `git log --grep=marketing`.

### Dashboard (notable post-launch)

One line per shipped feature; details live in the linked doc or in the code.

- **Home redesign** (PR #70) — `LoyaltyHubPage` with Today's Activity card, secondary tile row, chartreuse "Add points" hero, and bell → `NotificationsSheet`. See `HOME_REDESIGN.md` and `dashboard/src/components/NotificationsSheet.tsx`.
- **Insights extensions** — `InsightsKpis` adds `returningCustomers` + `reviewsCount` (`src/services/statsService.ts`). Time filter has a Custom date-range chip; backend accepts `?period=` or `?from=&to=` (`dashboard/src/components/TimeFilter.tsx`).
- **Menu page** — Active Program card at the top (PR #55). Language picker expandable inside Settings (PR #58); persists to `localStorage` and `Merchant.preferredLocale` via `PATCH /merchants/me` (`dashboard/src/pages/MenuPage.tsx`, `dashboard/src/AuthContext.tsx`). Logout moved to SettingsPage "Session" card.
- **Reviews split** — Page split into two URLs:
  - `/review-qr` (`dashboard/src/pages/ReviewQRPage.tsx`) — home tile entry, shows QR + copy/share for `/app/review/:merchantId`.
  - `/review-settings` (`dashboard/src/pages/ReviewSettingsPage.tsx`, ex-`ShowReviewQRPage.tsx`) — Menu entry, configure Google Maps URL, status pill, "How it works" card.
  - Old `/show-review-qr` route removed. Google config no longer lives on the Settings page.
- **Header/nav cleanup** — Global `Header.tsx` uses one big bold `app-header-title-home` style for every route; tab routes show their bottom-nav label. Sub-pages (`/campaigns`, `/settings`, `/review-qr`, `/review-settings`) use `FullPageLayout` with inline `back + title + (optional CTA)` rows — no global header chrome, no duplicate H1/kicker.
- **Customers page fixes** — `customerService.getCustomers` now returns flat `{ data, total, page, limit, hasMore }` matching the dashboard's `PaginatedResponse` (was nested `pagination.*`, hence "0 of 0" counter). Multi-token search: 1 token → `startsWith` on any field; N tokens → first token EQUALS firstName, rest startsWith lastName/email/phone.
- **Scan/redeem flow redesign** — `CustomerProfileModal` split per `LoyaltyProgram.type`: POINTS shows giant `€` input with live points conversion, STAMPS shows `+1 Timbro` hero + secondary `Add more` for custom counts. Header is one inline meta line (`Customer since X · N rewards redeemed` using a real `redemptionsCount` derived from `PointsTransaction(type=REDEEM)` count, NOT `totalRedeemed` which is a points sum). Multi-tier progress bar replaces the 3-stat tile row. Success uses a chartreuse check overlay (`Stamp added!` / `Points added!` / `Card completed`) and the modal stays open after redeem so the merchant can see the updated balance. Scan-page manual lookup replaced by debounced search by email/name/phone via `listCustomers` (`Cache-Control: no-store`). API client has a 5s `AbortController` timeout.
- **Home → redeem entry** — `Riscatta` tile on `LoyaltyHubPage` navigates to `/scan-qr?mode=redeem`; `ScanQRPage` reads the param and passes `initialView` to `CustomerProfileModal` so it lands directly on the redeem view. Empty state when no eligible reward shows `Lock` + `N points/stamps to next reward` + chartreuse fallback to add-points view. The campaign `/redeem-code` flow described in `REDEEM_HOME.md` was de-scoped in favor of this simpler entry. See `REDEEM_HOME.md`.
- **Manual customer add** — `+` button on `CustomersPage` opens `AddCustomerModal` (firstName, lastName, email, marketingConsent). `POST /api/customers/manual-add` (auth merchant) creates `Customer + LoyaltyCard + WalletPass + WalletAccessToken`, mails the wallet link via `src/services/mailer.ts`. Mailer uses Resend if `RESEND_API_KEY` is set, otherwise logs the link and the modal surfaces it as a copyable URL. Modals (`AddCustomerModal`, `CustomerProfileModal`) live OUTSIDE `PullToRefresh` because its `transform` breaks `position: fixed` on the modal-overlay.
- **Setup wizard merge** — Two steps instead of three: step 1 chooses POINTS/STAMPS, step 2 unifies base rule + welcome bonus + reward tiers. New `LoyaltyProgram.welcomePoints` (migration `20260505000000_add_welcome_points`). Per-tier live calc shows `Spend needed: €X` (POINTS) or `N visits needed` (STAMPS) folding `welcomePoints`/`welcomeStamps` into the math. Validation: ascending thresholds; STAMPS thresholds ≤ `goalStamps`; with a single tier or last tier of multi-tier the threshold MUST equal `goalStamps`. Threshold/order errors render under the row; missing reward name shows as a red border on the input only (so the live calc keeps showing).
- **Program edit lock** — `GET /api/programs/mine` returns `hasTransactions` (true when any of the merchant's cards has `totalEarned > 0` or `totalRedeemed > 0`). The `Edit` button on `MenuPage` Active Program card hides as soon as that flips. Useful because `POST /programs` is create-only (409 on existing) — without the lock the Edit button leads to a dead-end. Active Program card now also lists every `RewardTier` with prize name + threshold.

For post-launch dashboard history use `git log --grep=dashboard`.

### Customer app (`customer/`)

Static HTML pages served from `customer/public/`, no build step.

- `join.html` → `/app/join/:merchantId` — Material 3 floating-label "notched outline" inputs, confetti on submit + on each consent check. No required GDPR checkbox (submission = acceptance under Art. 6(1)(b)); inline note replaces it. Marketing consent line interpolates the merchant name.
- `loyalty.html` → `/app/loyalty/:token` — chartreuse hero with points + progress bar to next reward, sticky "Show to earn points" CTA → fullscreen QR overlay (api.qrserver.com), Recent activity timeline. Backed by `WalletSummary` extended with `nextReward { rewardName, threshold, pointsToGo, progress }` (`src/services/walletSummary.ts`).

### Analytics (in progress)

Self-hosted Umami at `https://analytics.loyali.online` — Phase 1 (infra) shipped in PR #49, awaiting DNS+SSL operator action. See `ANALYTICS.md`.

## Deploy Pipeline

1. Push to `main` → GitHub Actions builds Docker image → pushes to GHCR → SSHs to server → runs `deploy/deploy.sh production`. A follow-up step then SSHs as `root` (same key) to copy the nginx config and reload (PR #47, needed because the deploy user can't sudo).
2. Push to `staging` → same flow with `deploy/deploy.sh staging`
3. PR opened → `preview.yml` builds image tagged `pr-N` → deploys preview on port 4000+N

### Nginx config split (PR #48)
The combined `deploy/nginx.conf` was split per environment so each host only references its own SSL certificates:
- `deploy/nginx-production.conf` — `loyali.online` + preview subdomains + analytics:80 placeholder
- `deploy/nginx-staging.conf` — `staging.loyali.online` only

### Deploy Script (`deploy/deploy.sh`)
- Selects the right `deploy/nginx-${ENV}.conf` and copies it via `sudo`
- Generates `UMAMI_DB_PASSWORD` and `UMAMI_APP_SECRET` on first run (analytics)
- Backs up database (production only)
- Pulls Docker image from GHCR
- Runs Prisma migrations (falls back to `db push`)
- Starts containers (production also includes `docker-compose.umami.yml`)
- Health check with auto-rollback on failure

### Deploy hardening (PRs #92, #93)
For months `git fetch origin` on the prod VPS silently failed with `fatal: Authentication failed`: the default `GITHUB_TOKEN` in the SSH-action env lacked `contents: read`, the script chained `git fetch && git reset` against a stale `origin/main`, and there was no `set -e`. The Docker image kept advancing (GHCR auth is separate) but every change to `deploy/deploy.sh`, `docker-compose.yml`, and nginx configs was ignored on the server.
- `deploy-production` job now declares `permissions: { contents: read, packages: read }`.
- SSH script embeds the token in the fetch URL: `git fetch "https://x-access-token:${GH_TOKEN}@github.com/${GITHUB_REPOSITORY}.git" main`.
- `set -euo pipefail` at the top of the SSH script — silent failures now go red.
- `docker compose stop+rm app` then `up --force-recreate` so compose re-reads every file from disk.

### Gotcha: changes to `deploy/deploy.sh` or `docker-compose.yml`
Watch the deploy logs for `fatal: Authentication failed` and verify the change actually landed on the server (e.g. read `process.env.X` from inside the running container, or the nearest equivalent diagnostic). The git-fetch → reset → compose chain has more moving parts than it looks.

## Commit Convention

All commits must include:
```
Co-Authored-By: Paperclip <noreply@paperclip.ing>
```

## Key Files

- `src/index.ts` — Express server entry point, route mounting
- `src/middleware/auth.ts` — Merchant X-API-Key authentication
- `src/routes/` — API route handlers (merchants, cards, points, loyalty join/public-summary)
- `src/services/walletSummary.ts` — wallet payload incl. `nextReward`
- `src/utils/googleMaps.ts` — `extractPlaceIdFromUrl` (Pattern 5 = hex CID → ChIJ via Places API)
- `customer/public/join.html`, `customer/public/loyalty.html` — B2C static pages
- `prisma/schema.prisma` — Database schema (single source of truth)
- `packages/ui/src/tokens.css` — Design tokens (auto-generated, don't edit)
- `design/design-tokens.json` — Design token source (edit this)
- `deploy/deploy.sh` — Main deployment script
- `.github/workflows/` — CI/CD pipelines

## Agent routing

Use these specialized agents proactively without waiting to be asked. Match by topic, then invoke via the Agent tool with the right `subagent_type`:

- **frontend-developer** — React 19 dashboard / Next.js marketing component work, hooks, state management.
- **ui-designer** — visual design critique, design system, spacing, color, typography decisions.
- **ux-researcher** — JTBD analysis, hierarchy critique, behavioral recommendations.
- **product-manager** — scope decisions, prioritization, metric/outcome framing, paid-feature wedges.
- **api-designer** — adding/refactoring `/api/*` endpoints, REST consistency, request/response shapes.
- **postgres-pro** — Prisma schema migrations, advanced PostgreSQL features, indexes, constraints.
- **database-optimizer** — slow queries, execution plan analysis, index strategy.
- **architect-reviewer** — before shipping structural changes (new app, multi-tenancy, breaking infra changes).
- **performance-engineer** — bundle size regressions, API latency, Vite build tuning.
- **debugger** / **error-detective** — diagnosing reproducible bugs / triaging production errors.
- **qa-expert** — defining test strategy, test plans for new features.
- **compliance-auditor** — GDPR/data-handling review (we store customer PII; relevant pre-launch and before any data export feature).
- **documentation-engineer** — when docs grow stale or sprawl (we just had to triage 2200+ lines of doc rot).
- **code-reviewer** — second-opinion review of pending diff before commit on non-trivial changes.
- **security-review** (built-in skill) — when touching auth, payments, PII, or external API surfaces.

Spawn multiple in parallel when their concerns are independent (e.g., `ui-designer` + `ux-researcher` + `product-manager` for any home/feature redesign — that's exactly the cycle that produced HOME_REDESIGN.md).

For multi-step tasks, use `Plan` to design the approach before opening the editor.

## Paperclip Integration

This project is managed in Paperclip. Task identifiers use the `LOY-` prefix.
When creating issues or PRs, reference Paperclip tasks (e.g., LOY-24).
Agents should follow the branch → PR → staging → production workflow.
