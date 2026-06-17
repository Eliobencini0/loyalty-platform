# Home (LoyaltyHubPage) Redesign

Sprint outcome: redesign of the merchant dashboard home (`dashboard/src/pages/LoyaltyHubPage.tsx`) following UX + UI + PM review (2026-04-28).

## Why

PR #69 removed the legacy `HomeQuickStats` "Estadísticas" card, leaving ~50% of the viewport empty. The 2×2 quick-actions grid treated all four actions as equal-weight, mismatching real usage frequency (Add Points ≫ Show QR > Redeem > Reviews) and underusing the highest-frequency surface in the app.

## Job-to-be-done

- **Mid-shift (≈90% of opens):** "A customer is at the till — give them points fast." 3-second transactional task.
- **Morning (≈10%):** "What happened, what should I do today?" Orientation.

The redesign serves both: a glanceable activity card at top, dominant primary CTA at thumb position.

## Final layout (top → bottom)

1. **Header** — avatar + greeting "Buongiorno, {name}" (Inter sentence-case, dropped italic serif) + bell with red-dot indicator. Bell tap opens `NotificationsSheet`.
2. **Today's Activity card** (`HomeTodayStrip`) — calendar icon + "TODAY'S ACTIVITY" olive uppercase label + "Live" green pulsing indicator (when activity > 0). Three stats with vertical dividers: `+N New | N Returning | N Reviews`. Light lavender gradient (matches `app-surface-card-muted` design tokens). Tap → `/insights`.
3. **Secondary row** — three lavender-gradient tiles, soft shadow, lift on hover:
   - **Show QR** (`qr_code_2`)
   - **Redeem** (`confirmation_number`)
   - **Reviews** (`star`)
4. **Hero "Add points"** — full-width chartreuse card (`#EFFF74`), olive title + sublabel "Reward your customers instantly", dark olive circular FAB on the right with white `+`. Tap → `/scan-qr`.

## Notifications surface

Operational alerts now live in `NotificationsSheet` (bottom sheet opened by header bell), NOT inline on the home. Surfaces `getInsightsNotifications()` items, each tappable (deep-link via `actionPath`) and dismissible. Dismissals persist for 7 days in `localStorage` under `notifications_dismissed_v1`. Empty state: "Tutto in ordine · nessuna notifica".

This was a deliberate change from the original plan: the inline alerts strip was tested and judged too dense for the home's "fast action" job. Pushing alerts behind the bell preserves the home's clean visual hierarchy while keeping the data accessible.

## Backend

Extended `InsightsKpis` with two new fields, both computed inside the same time window as the rest of the KPIs:

- `returningCustomers` — count of loyalty cards created before the window with at least one transaction inside it.
- `reviewsCount` — count of `MerchantFeedback` rows in the window.

Files: `src/services/statsService.ts`, `src/routes/stats.ts`, mirrored in `dashboard/src/api.ts`.

## Design tokens used

- Chartreuse hero: `--quick-add-points` (#EFFF74) + `--quick-add-points-text` (#6B7600)
- Card lavender gradient: copied from `app-surface-card-muted` (radial blue + linear lavender→white)
- Card radii: 23px (today), 21px (secondary tiles), 25px (hero)
- Card shadow: `--shadow-lg`
- Border: `1px solid rgba(163, 174, 192, 0.16)` for soft definition
- Icons: Material Symbols outlined throughout

## Decisions explicitly NOT taken

- **No full Today stats card with KPIs** — would rebuild the deleted "Estadísticas". Stuck to deltas only (+New / Returning / Reviews).
- **No inline alerts strip on home** — moved to bell sheet (see above).
- **No paid action layer on alerts yet** — read-only for now; SMS/WhatsApp re-engagement is a future quarter, gated by tap-rate evidence.
- **No removal of Reviews from home** — demoted, not deleted (Google Maps growth strategic value).

## Risks tracked (still relevant for follow-up)

- **Alert fatigue:** sheet caps visible to whatever the API returns; dismissed items respect 7-day cooldown.
- **Reviews demotion starves Maps growth:** add `review_qr_shown` weekly tracking; nudge merchant if drop >40%.
- **Today card resembles deleted Estadísticas:** mitigated by being deltas (24h) not totals/averages, and by the "Live" indicator framing it as "what's happening now".

## Future work

- Instrumentation: `home_add_points_tap`, `home_alert_tap` (per type), `home_today_card_tap`, `review_qr_shown`.
- Single-line "today" counter alternative if the card proves too heavy after merchant interviews.
- Paid alert actions (re-engagement campaigns) gated by tap-rate evidence.
