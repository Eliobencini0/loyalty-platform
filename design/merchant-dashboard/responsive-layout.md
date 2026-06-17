# Merchant Dashboard — Responsive Layout Strategy

> Desktop-first, mobile-friendly approach. The dashboard is primarily used by merchants on desktop/tablet at their venue, with occasional mobile checks.

---

## Breakpoints

| Name     | Min Width | Sidebar         | Grid Columns | Notes                     |
|----------|-----------|-----------------|--------------|---------------------------|
| Desktop  | 1280px    | 240px fixed     | 12-col       | Full layout               |
| Laptop   | 1024px    | 240px fixed     | 12-col       | Narrower content area     |
| Tablet   | 768px     | Collapsible     | 8-col        | Sidebar as overlay drawer |
| Mobile   | < 768px   | Bottom tab bar  | 4-col        | Single column layout      |

---

## Grid System

- **Max content width:** 1200px (centered in main area)
- **Column gap:** `spacing.md` (16px)
- **Row gap:** `spacing.lg` (24px)
- **Page padding:** `spacing.xl` (32px) desktop, `spacing.md` (16px) mobile

---

## Sidebar Behavior

### Desktop / Laptop (≥ 1024px)
- Fixed left sidebar, 240px wide
- Always visible
- Content area: `calc(100vw - 240px)`

### Tablet (768px – 1023px)
- Sidebar collapses to **64px icon-only rail** by default
- Hamburger menu expands to full 240px overlay with backdrop
- Content area: `calc(100vw - 64px)`

### Mobile (< 768px)
- Sidebar replaced with **bottom tab bar** (56px height)
- Shows top 5 nav items: Overview, Customers, Cards, Transactions, Settings
- "More" overflow for Help, Log out
- Content area: full width, padding `spacing.md`

```
Mobile Bottom Tab Bar:
┌──────────────────────────────────────────────┐
│  [◈]      [👥]     [💳]     [📊]     [⚙]   │
│ Overview  Custo-   Cards   Trans-   Settings │
│           mers             actions            │
└──────────────────────────────────────────────┘
```

---

## Per-Screen Responsive Rules

### Overview Page

| Element         | Desktop (≥1024px)       | Tablet (768-1023px)     | Mobile (<768px)         |
|-----------------|-------------------------|-------------------------|-------------------------|
| KPI cards       | 4 in a row              | 2×2 grid                | 2×2 grid, smaller text  |
| Chart + Actions | 2/3 + 1/3 side by side  | Stacked (full width)    | Stacked (full width)    |
| Recent txns     | Full table              | Full table              | Card-based list         |

### Customer List Page

| Element         | Desktop                 | Tablet                  | Mobile                  |
|-----------------|-------------------------|-------------------------|-------------------------|
| Table columns   | All columns visible     | Hide "Last Visit"       | Card layout per customer|
| Search bar      | Inline with filters     | Inline with filters     | Full width, filters below|
| Slide-over      | 480px right panel       | 480px right panel       | Full-screen modal       |
| Pagination      | Full numbered           | Compact (prev/next)     | Load more button        |

### Card Management Page

| Element         | Desktop                 | Tablet                  | Mobile                  |
|-----------------|-------------------------|-------------------------|-------------------------|
| Template grid   | 3 cards per row         | 2 cards per row         | 1 card per row          |
| Create modal    | 560px centered modal    | 560px centered modal    | Full-screen sheet       |
| Active cards tab| Full table              | Scroll horizontal       | Card-based list         |

### Transaction History Page

| Element         | Desktop                 | Tablet                  | Mobile                  |
|-----------------|-------------------------|-------------------------|-------------------------|
| Summary bar     | Inline horizontal       | Inline horizontal       | Stacked vertical        |
| Table columns   | All columns             | Hide "Balance After"    | Card layout per txn     |
| Expanded row    | Inline expand           | Inline expand           | Full-screen detail      |
| Filters         | Inline row              | Inline row              | Collapsible "Filter" btn|

---

## Mobile Card Layout Pattern

When tables collapse on mobile, each row becomes a card:

```
┌─────────────────────────────────┐
│  [Avatar] Maria Silva      ● Active
│  maria@email.com
│  ─────────────────────────────
│  Points: 1,250    Last: Today
│  Card: LOY-0042   Template: Gold
└─────────────────────────────────┘
   ↕ spacing.sm (8px)
┌─────────────────────────────────┐
│  [Avatar] John Chen        ● Active
│  ...
└─────────────────────────────────┘
```

- Card: White bg, `borderRadius.md`, `shadow.sm`, padding `md`
- Tap to open full-screen detail

---

## Touch Targets

- All interactive elements: minimum **44×44px** tap target (WCAG 2.1 Level AAA)
- Buttons: minimum 40px height on desktop, 48px on mobile
- Table rows on mobile card view: minimum 64px height
- Bottom tab bar items: 56px height, evenly distributed
