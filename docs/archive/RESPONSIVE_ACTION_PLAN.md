# Responsive Action Plan

## Goal

Stabilize the mobile responsiveness of the entire product surface, with priority on the merchant dashboard, then the customer-facing static apps, and finally the marketing site.

This plan is based on the current codebase structure and the responsive risks already visible in local and preview testing.

## What This Plan Gets Right

- The priority order is correct: dashboard first, then customer static flows, then marketing.
- The diagnosis around fixed UI, rigid grids, and duplicated static layouts is directionally correct.
- The plan avoids fake fixes such as disabling zoom or hiding overflow globally.

## Working Modes

This execution now uses two complementary modes:

- Responsive stabilization first
- Safe refactoring second

Responsive stabilization removes breakage, clipping, collisions, and brittle mobile behavior.

Safe refactoring starts only after those fixes are validated and focuses on reducing CSS complexity without changing behavior.

## What Needed Tightening

Before execution, the plan needed three corrections:

1. It was too layout-first and not verification-first.

- Responsive work done without a fixed validation matrix tends to expand and regress unrelated screens.

2. It did not explicitly call out nested scroll containers.

- This is already present in the codebase and is a major source of mobile clipping, broken pull-to-refresh, and height math bugs.

3. It mixed shell, page content, and floating overlays too early.

- These must be treated as separate systems or fixes become broad and fragile.

## Validation Matrix

Every phase must be checked against the same mobile baseline before moving on:

- 320px width
- 360px width
- 390px width
- 430px width

Core checks per viewport:

- No horizontal overflow
- No clipped primary CTA
- No header or bottom-nav collision
- No text truncation on primary headings unless intentional and ellipsized
- No broken pull-to-refresh or trapped inner scroll
- No bottom sheet or prompt blocking core actions

## Anti-Patterns To Eliminate

These patterns are now explicit execution targets:

- Page-local `overflow-y: auto` + `maxHeight: calc(100vh - ...)` wrappers inside the dashboard shell
- Fixed UI that depends on manual compensation instead of shared shell spacing
- Rigid `repeat(3|4, 1fr)` grids on narrow widths
- `white-space: nowrap` on content that should wrap on phones
- Cards or stat blocks missing `min-width: 0` in flex/grid contexts
- Visual fixes that rely on global `overflow-x: hidden`

## Current Diagnosis

### 1. Dashboard React App

Main risk area: [dashboard/src/index.css](/Users/eliobencini/loyalty-platform/loyalty-platform/dashboard/src/index.css)

Observed issues:

- Large centralized stylesheet with many layout responsibilities.
- Multiple uses of `position: fixed`, `100vh`, `100vw`, `calc(...)`, and rigid grids.
- Some `white-space: nowrap` rules can force clipping on narrow screens.
- A number of page layouts rely on explicit height math and manual scroll zones.
- Some pages introduce their own internal scroll containers instead of relying on the shared app shell.
- Several pages have dense KPI/card compositions that are vulnerable on mobile widths.

High-risk examples:

- Fixed header and bottom nav
- Rigid grid layouts with `repeat(2|3|4, 1fr)`
- Elements with large fixed icon/font sizes
- Scroll wrappers with `maxHeight: calc(100vh - ...)`

### 2. Customer Static Pages

Main risk area:

- [customer/public/play.html](/Users/eliobencini/loyalty-platform/loyalty-platform/customer/public/play.html)
- [customer/public/review.html](/Users/eliobencini/loyalty-platform/loyalty-platform/customer/public/review.html)
- [customer/public/loyalty.html](/Users/eliobencini/loyalty-platform/loyalty-platform/customer/public/loyalty.html)

Observed issues:

- Static HTML/CSS with fixed font sizes and spacing.
- `max-width`-based layouts that are acceptable on medium screens but brittle on narrow devices.
- Some hero/prize/CTA areas are sized more like desktop cards than mobile-first surfaces.
- Less resilient than the React dashboard because layout logic is duplicated and not componentized.

### 3. Marketing Site

Main risk area:

- [marketing/src/app/globals.css](/Users/eliobencini/loyalty-platform/loyalty-platform/marketing/src/app/globals.css)

Observed issues:

- Generally healthier than the other surfaces.
- Still contains some rigid multi-column sections and large containers.
- Lower priority, but should be normalized for consistency.

## Engineering Principles

These rules should drive implementation across all phases:

1. Prefer fluid sizing over fixed width.

- Use `width: 100%`, `max-width`, `minmax()`, `clamp()`.
- Avoid fixed-width cards/buttons unless functionally required.

2. Make flex/grid children shrink correctly.

- Add `min-width: 0` where text or cards can overflow inside flex/grid containers.

3. Replace rigid grids with adaptive grids.

- Prefer patterns like `repeat(auto-fit, minmax(...))` or `repeat(n, minmax(0, 1fr))`.

4. Let text wrap naturally.

- Remove unnecessary `white-space: nowrap`.
- Use wrapping where headings, labels, and values can compress on mobile.

5. Reduce density on narrow screens.

- Scale padding, gap, icons, and typography with `clamp()` or mobile breakpoints.

6. Treat fixed UI carefully.

- Fixed headers, bottom nav, banners, bottom sheets, and QR flows must live inside a predictable vertical layout model.

7. Fix per component, not with global hacks.

- Do not “solve” layout bugs by disabling zoom or hiding overflow unless the offending component has been corrected.

8. Keep one primary vertical scroll owner per screen.

- In dashboard routes, the shell should own scroll by default.
- Page-level scroll containers are allowed only when clearly required and documented.

9. Separate shell fixes from density fixes.

- Shell issues affect spacing and collision.
- Density issues affect readability, wrapping, and grid behavior.
- They should not be patched together blindly.

10. Refactor only after behavior is stable.

- Do not combine structural responsive fixes with large stylistic cleanup in the same pass.
- After a responsive slice is validated, extract or simplify duplicated CSS safely.
- Prefer small behavior-preserving refactors over large reorganizations of the stylesheet.

## Phased Plan

### Phase 0: Baseline and Triage

Priority: Highest

Goal:

- Reduce risk before editing by identifying which issues are structural and which are page-local.

Tasks:

- Build a viewport checklist for 320, 360, 390, and 430 widths.
- Identify pages using nested scroll wrappers or explicit `maxHeight: calc(100vh - ...)`.
- Identify shared selectors in `dashboard/src/index.css` that affect multiple routes.
- Record which problems are shell collisions, density issues, or overlay issues.

Success criteria:

- A small, concrete target list exists before CSS edits begin.
- Shared fixes are distinguishable from page-local fixes.

### Phase A: Dashboard Layout Foundation

Priority: Highest

Goal:

- Remove structural causes of overflow and clipping in the dashboard.

Tasks:

- Audit `app-shell`, `app-main`, fixed header, fixed bottom nav, and shared page containers.
- Normalize vertical flow around fixed UI.
- Remove page-level scroll ownership where the shell should own scrolling.
- Add `min-width: 0` to critical flex/grid children.
- Remove or reduce non-essential `white-space: nowrap`.
- Review safe area and bottom padding interactions.
- Normalize shared responsive rules for cards, grids, buttons, headers, and KPI blocks.

Success criteria:

- No horizontal overflow in primary dashboard flows on narrow mobile widths.
- No clipping caused by header/nav/banner collisions.
- Shared layout primitives become reliable before page-specific polish.

### Phase B: Dashboard Page-by-Page Hardening

Priority: Highest, immediately after Phase A

Target pages:

- Home / Today
- Insights
- Customers
- Campaigns
- Settings
- QR flows
- Menu and PWA entry contexts

Goal:

- Fix page-level density, hierarchy, and component breakdowns once the layout foundation is stable.

Tasks:

- Inspect each page at narrow viewport widths.
- Convert rigid grids to adaptive ones.
- Reduce padding/gap/font-size where cards become too dense.
- Fix title/header blocks that drift or clip.
- Remove local height math and trapped scroll where present.
- Review modal/bottom sheet/QR surfaces on mobile.
- Review CTA sizing and spacing on high-density pages.

Success criteria:

- Core merchant flows are readable and usable without zoom.
- No page relies on accidental overflow clipping.

### Phase C: PWA Prompt and Other Floating Utility Surfaces

Priority: Medium-high

Goal:

- Ensure floating/secondary UI does not break page flow.

Tasks:

- Keep the PWA prompt in the correct content flow for each context.
- Validate dismiss/reappearance logic across home and menu.
- Review bottom-sheet overlays and any fixed QR or action surfaces.
- Reduce visual dominance of secondary banners and prompts.
- Ensure overlays respect safe-area and do not create hidden tap targets near the bottom nav.

Success criteria:

- Utility surfaces support the page instead of competing with it.
- No collision with header, bottom nav, or main content.

### Phase D: Customer Static Pages

Priority: Medium

Target files:

- [customer/public/play.html](/Users/eliobencini/loyalty-platform/loyalty-platform/customer/public/play.html)
- [customer/public/review.html](/Users/eliobencini/loyalty-platform/loyalty-platform/customer/public/review.html)
- [customer/public/loyalty.html](/Users/eliobencini/loyalty-platform/loyalty-platform/customer/public/loyalty.html)

Goal:

- Bring the customer-facing static pages up to the same mobile quality baseline as the dashboard.

Tasks:

- Reduce fixed typography and spacing.
- Make hero/content cards adapt better to narrow screens.
- Rework scratch card / reward reveal / review form layouts where needed.
- Normalize button, input, and container widths.
- Introduce consistent mobile breakpoints where currently missing.

Success criteria:

- Customer pages are usable and legible on narrow mobile viewports without zoom.
- Prize/review/loyalty flows no longer feel desktop-scaled on mobile.

### Phase E: Marketing Site Cleanup

Priority: Lower

Target files:

- [marketing/src/app/globals.css](/Users/eliobencini/loyalty-platform/loyalty-platform/marketing/src/app/globals.css)

Goal:

- Normalize lower-risk responsive issues after dashboard and customer flows are stable.

Tasks:

- Review rigid multi-column sections.
- Convert fixed desktop assumptions to adaptive grid behavior.
- Validate headline wrapping and card density on mobile.

Success criteria:

- Marketing surfaces are consistent with the quality bar of the app surfaces.

### Phase F: Safe CSS Refactoring

Priority: After dashboard stabilization

Goal:

- Reduce the fragility of the shared dashboard stylesheet without changing validated behavior.

Primary target:

- [dashboard/src/index.css](/Users/eliobencini/loyalty-platform/loyalty-platform/dashboard/src/index.css)

Tasks:

- Identify duplicated layout primitives and repeated spacing/card/grid rules.
- Separate shell, page, component, and overlay rules more clearly.
- Consolidate repeated responsive patterns into shared selectors where safe.
- Remove obsolete height-math and compatibility rules left behind by earlier fixes.
- Keep refactors incremental and verify each slice with the same mobile validation matrix.

Success criteria:

- Shared CSS becomes easier to reason about and less regression-prone.
- No validated responsive behavior regresses after refactoring.
- Future page-level responsive fixes require fewer one-off overrides.

## Execution Method

To keep risk low, implementation should be done in small thematic passes:

1. Establish the viewport baseline first.
2. Fix shell structure second.
3. Remove nested scroll and height math third.
4. Fix page density fourth.
5. Fix secondary/floating UI fifth.
6. Fix static customer pages after the dashboard is stable.
7. Fix marketing after app surfaces are stable.
8. Refactor shared CSS only after validated stabilization.

Each pass should follow the same loop:

1. Identify offending components or wrappers.
2. Apply narrow responsive fixes.
3. Build locally.
4. Validate in local preview or PR preview.
5. Commit a focused change.

## Immediate Recommendation

Start with Phase 0, then Phase A on the dashboard only. Phase B should begin only after shell behavior is stable.

Reason:

- It has the highest user impact.
- It contains the largest concentration of layout bugs already observed.
- It will establish the responsive patterns that can later be reused in the customer and marketing surfaces.
- The codebase already shows at least one page-local scroll container that should be treated as a structural bug, not as isolated page polish.

## Known Risks

- `dashboard/src/index.css` is monolithic, so unrelated regressions are possible if changes are too broad.
- Fixed header + bottom nav combinations require careful vertical spacing discipline.
- Nested scroll containers can silently break pull-to-refresh, bottom-sheet behavior, and perceived page height.
- Static customer HTML pages are more brittle because they lack shared layout primitives.
- Disabling zoom can hide symptoms but does not fix component-level responsiveness.
- Premature CSS cleanup can obscure the source of responsive regressions if it happens before stabilization is verified.

## Definition of Done

The plan is successful when:

- Dashboard shell behavior is consistent across core routes at 320, 360, 390, and 430 widths.
- All primary dashboard views work on narrow mobile widths without clipping or forced zoom.
- The PWA prompt and other utility surfaces do not collide with the page shell.
- No critical dashboard page depends on local `maxHeight: calc(100vh - ...)` scroll wrappers unless explicitly justified.
- Customer static flows are legible and usable on phones.
- Marketing pages remain coherent on mobile.
- No critical mobile flow depends on accidental overflow behavior.

## Execution Status

Status as of 2026-04-20:

- Phase 0 completed
- Phase A completed
- Phase B completed
- Phase C completed
- Phase D completed
- Phase E implemented
- Phase F partially completed

## What Was Implemented

### Dashboard

- Removed page-level nested scroll ownership from the customers flow and switched load-more behavior to an observer pattern.
- Hardened the shared shell with `100dvh`, shrink-safe containers, wrapped header rows, safer action groups, and small-phone fallbacks.
- Normalized mobile behavior for Insights, Campaigns, Menu/PWA entry points, Show QR, Show Review QR, Settings, Customer Detail, Campaign Detail, Create Campaign, Edit Campaign, and Scan QR surfaces.
- Moved several fragile inline layout styles into shared CSS so responsive behavior is easier to reason about and safer to refactor.

### Customer Static Pages

- Updated `play.html`, `review.html`, and `loyalty.html` with more fluid spacing, tighter small-phone typography, and better stacking behavior below narrow widths.
- Reduced desktop-scaled density in key prize, review, and loyalty summary surfaces.

### Marketing

- Improved mobile stacking for hero buttons and narrowed section/nav padding for smaller screens.
- Normalized lower-risk responsive behavior without broad design changes.

## Verification Completed

- `npm run build:dashboard` passes after the responsive changes.
- Dashboard responsive fixes were implemented without introducing TypeScript or Vite build failures.

## Verification Limits

- Marketing runtime build could not be completed in this environment because `next` is not installed locally:
  `sh: next: command not found`
- Marketing changes were therefore validated statically at the stylesheet level, not through a successful local Next.js production build.

## Residual Risk

- `dashboard/src/index.css` is still large, even though the most fragile responsive issues were stabilized.
- A fuller Phase F refactor is still useful if the goal shifts from responsive stabilization to long-term stylesheet maintainability.
