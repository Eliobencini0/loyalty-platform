# Merchant Dashboard — Wireframes

> Annotated wireframes for all MVP screens. Reference `design-tokens.json` for spacing, color, and typography values. All measurements use the 4px spacing scale.

---

## 1. Overview Page (`/dashboard`)

The merchant's home screen. Shows KPIs at a glance, recent activity, and quick actions.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (240px)  │  MAIN CONTENT                                            │
│                  │                                                           │
│ [Logo] Loyali    │  ┌─ Page Header ──────────────────────────────────────┐   │
│                  │  │ H1: "Overview"              [Today ▾] [Export ↓]  │   │
│ ● Overview       │  └──────────────────────────────────────────────────────┘   │
│   Customers      │                                                           │
│   Cards          │  ┌─ KPI Row (4 cards, equal width) ────────────────────┐   │
│   Transactions   │  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │   │
│   ─────────      │  │ │ Active   │ │ Total    │ │ Points   │ │ Redemp- │ │   │
│   Settings       │  │ │ Cards    │ │ Customers│ │ Issued   │ │ tions   │ │   │
│   Help           │  │ │          │ │          │ │ Today    │ │ Today   │ │   │
│                  │  │ │ 1,247    │ │ 892      │ │ 4,530    │ │ 12      │ │   │
│                  │  │ │ +3.2% ↑  │ │ +1.8% ↑  │ │ +12% ↑   │ │ -5% ↓   │ │   │
│ ─────────        │  │ └──────────┘ └──────────┘ └──────────┘ └─────────┘ │   │
│ [Avatar]         │  └────────────────────────────────────────────────────────┘   │
│ Café Bonheur     │                                                           │
│ cafe@bonheur.fr  │  ┌─ Two Column Layout ─────────────────────────────────┐   │
│ [Log out]        │  │                                                     │   │
│                  │  │  ┌─ Activity Chart (2/3 width) ──────────────────┐  │   │
│                  │  │  │                                               │  │   │
│                  │  │  │  [7D] [30D] toggle                           │  │   │
│                  │  │  │                                               │  │   │
│                  │  │  │   ╭─╮                                        │  │   │
│                  │  │  │   │ │    ╭─╮                                 │  │   │
│                  │  │  │   │ │ ╭─╮│ │         ╭─╮                    │  │   │
│                  │  │  │ ╭─╮│ │ │ ││ │ ╭─╮╭─╮│ │╭─╮                │  │   │
│                  │  │  │ │ ││ │ │ ││ │ │ ││ ││ ││ │                │  │   │
│                  │  │  │ Mon Tue Wed Thu Fri Sat Sun                  │  │   │
│                  │  │  │                                               │  │   │
│                  │  │  │  ── Points Earned (Indigo 600)               │  │   │
│                  │  │  │  ── Redemptions (Amber 500)                  │  │   │
│                  │  │  └───────────────────────────────────────────────┘  │   │
│                  │  │                                                     │   │
│                  │  │  ┌─ Quick Actions (1/3 width) ─────────────────┐  │   │
│                  │  │  │                                              │  │   │
│                  │  │  │  ┌─────────────────────────────────────┐    │  │   │
│                  │  │  │  │ [QR icon]  Scan Customer QR         │    │  │   │
│                  │  │  │  └─────────────────────────────────────┘    │  │   │
│                  │  │  │  ┌─────────────────────────────────────┐    │  │   │
│                  │  │  │  │ [Card icon] Issue New Card          │    │  │   │
│                  │  │  │  └─────────────────────────────────────┘    │  │   │
│                  │  │  │  ┌─────────────────────────────────────┐    │  │   │
│                  │  │  │  │ [Plus icon] Create Template         │    │  │   │
│                  │  │  │  └─────────────────────────────────────┘    │  │   │
│                  │  │  │                                              │  │   │
│                  │  │  └──────────────────────────────────────────────┘  │   │
│                  │  │                                                     │   │
│                  │  └─────────────────────────────────────────────────────┘   │
│                  │                                                           │
│                  │  ┌─ Recent Transactions ────────────────────────────────┐   │
│                  │  │  Customer       │ Type   │ Points │ Time            │   │
│                  │  │  ───────────────┼────────┼────────┼─────────────────│   │
│                  │  │  Maria Silva    │ EARN   │ +50    │ 2 min ago       │   │
│                  │  │  John Chen      │ REDEEM │ -200   │ 15 min ago      │   │
│                  │  │  Ana López      │ EARN   │ +25    │ 1 hr ago        │   │
│                  │  │  ...                                                │   │
│                  │  │                        [View all transactions →]    │   │
│                  │  └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Overview — Annotations

| Element          | Token / Spec                                                      |
|------------------|-------------------------------------------------------------------|
| Page background  | `gray.50` (#F9FAFB)                                              |
| KPI Card         | White surface, `borderRadius.md` (8px), `shadow.sm`, padding `lg` (24px) |
| KPI Value        | `heading.h2` (24px/600), `gray.900`                              |
| KPI Label        | `body.small` (14px/400), `gray.500`                              |
| KPI Trend Up     | `emerald.500` text + ↑ arrow icon                                |
| KPI Trend Down   | `rose.500` text + ↓ arrow icon                                   |
| Chart area       | White card, bar chart uses `primary.600` and `amber.500`         |
| Quick Action btn | White card, `border: 1px gray.200`, hover: `primary.50` bg      |
| Recent Txn table | White card, `body.default` for data, `body.xsmall` for timestamps |
| Section gap      | `spacing.lg` (24px) between card rows                            |

### Overview — Empty State

When no cards/customers exist yet, replace KPI + chart area with:
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│       [Illustration: stamp card being created]           │
│                                                          │
│       H2: "Welcome to Loyali!"                           │
│       Body: "Set up your first loyalty card              │
│              template to start rewarding customers."     │
│                                                          │
│       [Primary Button: "Create Card Template"]           │
│       [Secondary Link: "Learn how it works →"]           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Customer List Page (`/dashboard/customers`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR          │  MAIN CONTENT                                            │
│                  │                                                           │
│                  │  ┌─ Page Header ──────────────────────────────────────┐   │
│                  │  │ H1: "Customers"     [892 total]    [Export CSV ↓] │   │
│                  │  └──────────────────────────────────────────────────────┘   │
│                  │                                                           │
│                  │  ┌─ Filter Bar ──────────────────────────────────────────┐   │
│                  │  │ [🔍 Search by name or email...          ]            │   │
│                  │  │ [Status ▾: All]  [Card Template ▾: All]  [Sort ▾]   │   │
│                  │  └──────────────────────────────────────────────────────────┘   │
│                  │                                                           │
│                  │  ┌─ Customer Table ──────────────────────────────────────┐   │
│                  │  │                                                       │   │
│                  │  │  □  Customer         │ Card Status │ Points │ Last   │   │
│                  │  │     ────────────────┼─────────────┼────────┼─────── │   │
│                  │  │  □  [Av] Maria Silva │ ● Active    │ 1,250  │ Today  │   │
│                  │  │     maria@email.com  │             │        │        │   │
│                  │  │  ─────────────────────────────────────────────────── │   │
│                  │  │  □  [Av] John Chen   │ ● Active    │ 780    │ 2d ago │   │
│                  │  │     john@email.com   │             │        │        │   │
│                  │  │  ─────────────────────────────────────────────────── │   │
│                  │  │  □  [Av] Ana López   │ ○ Suspended │ 2,100  │ 1w ago │   │
│                  │  │     ana@email.com    │             │        │        │   │
│                  │  │  ─────────────────────────────────────────────────── │   │
│                  │  │  □  [Av] Liam Brown  │ ● Active    │ 430    │ 3d ago │   │
│                  │  │     liam@email.com   │             │        │        │   │
│                  │  │                                                       │   │
│                  │  │  ◀ 1 2 3 ... 45 ▶        Showing 1-20 of 892        │   │
│                  │  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Customer Detail — Slide-Over Panel (right, 480px wide)

Opens when clicking a customer row. Overlays on top of the table.

```
┌─ Customer Detail ─────────────────────────┐
│ [← Back]                          [✕]     │
│                                           │
│ ┌─ Profile ─────────────────────────────┐ │
│ │  [Avatar 64px]                        │ │
│ │  H2: Maria Silva                      │ │
│ │  maria@email.com · +33 6 12 34 56 78  │ │
│ │  Joined: Jan 15, 2026                 │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ ┌─ Loyalty Card Summary ────────────────┐ │
│ │  Card #:    LOY-0042-ABCD             │ │
│ │  Template:  Gold Rewards              │ │
│ │  Status:    ● Active                  │ │
│ │  Issued:    Jan 15, 2026              │ │
│ │  Expires:   Jan 15, 2027              │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ ┌─ Points ──────────────────────────────┐ │
│ │  Current Balance      1,250 pts       │ │
│ │  Total Earned         3,400 pts       │ │
│ │  Total Redeemed       2,150 pts       │ │
│ │                                       │ │
│ │  [Adjust Points]  [Suspend Card]      │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ ┌─ Recent Activity ─────────────────────┐ │
│ │  Mar 31  EARN    +50 pts   Balance: 1,250 │
│ │  Mar 28  REDEEM  -200 pts  Balance: 1,200 │
│ │  Mar 25  EARN    +75 pts   Balance: 1,400 │
│ │  Mar 20  BONUS   +100 pts  Balance: 1,325 │
│ │                                       │ │
│ │  [View full history →]                │ │
│ └───────────────────────────────────────┘ │
└───────────────────────────────────────────┘
```

### Customer List — Annotations

| Element          | Token / Spec                                                      |
|------------------|-------------------------------------------------------------------|
| Search input     | 40px height, `borderRadius.md`, `border: 1px gray.200`, focus: `primary.600` ring |
| Filter dropdowns | `body.small`, `gray.700`, `borderRadius.md`                      |
| Table header     | `body.xsmall` (12px/500), `gray.500`, uppercase, `letter-spacing: 0.05em` |
| Table row        | 64px min-height, `border-bottom: 1px gray.200`, hover: `gray.50` bg |
| Avatar           | 40px circle (`borderRadius.full`), `gray.200` border             |
| Status dot       | 8px circle — Active: `emerald.500`, Suspended: `amber.500`, Expired: `gray.400` |
| Points value     | `body.default`, `font-weight: 600`                               |
| Pagination       | `body.small`, active page: `primary.600` bg + white text         |
| Slide-over       | 480px width, `shadow.lg`, white bg, `300ms` slide-in animation   |

---

## 3. Card Management Page (`/dashboard/cards`)

Two views: **Templates** (default tab) and **Active Cards**.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR          │  MAIN CONTENT                                            │
│                  │                                                           │
│                  │  ┌─ Page Header ──────────────────────────────────────┐   │
│                  │  │ H1: "Cards"          [+ Create Template]           │   │
│                  │  └──────────────────────────────────────────────────────┘   │
│                  │                                                           │
│                  │  ┌─ Tab Bar ─────────────────────────────────────────────┐   │
│                  │  │  [Templates]  [Active Cards (1,247)]                 │   │
│                  │  └──────────────────────────────────────────────────────────┘   │
│                  │                                                           │
│                  │  ── Templates Tab (Grid View) ──                          │
│                  │                                                           │
│                  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────┐   │
│                  │  │ ★ GOLD          │  │   STANDARD      │  │ + Create │   │
│                  │  │                 │  │                 │  │   New    │   │
│                  │  │ Gold Rewards    │  │ Basic Loyalty   │  │ Template │   │
│                  │  │                 │  │                 │  │          │   │
│                  │  │ 1.5x multiplier │  │ 1x multiplier   │  │  [dash   │   │
│                  │  │ 100 min redeem  │  │ 100 min redeem  │  │  border] │   │
│                  │  │ 365 day validity│  │ No expiry       │  │          │   │
│                  │  │                 │  │                 │  │          │   │
│                  │  │ 312 active cards│  │ 935 active cards│  │          │   │
│                  │  │                 │  │                 │  │          │   │
│                  │  │ [Edit] [···]    │  │ [Edit] [···]    │  │          │   │
│                  │  └─────────────────┘  └─────────────────┘  └──────────┘   │
│                  │                                                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Create/Edit Template — Modal (560px wide)

```
┌─ Create Card Template ────────────────────────┐
│                                        [✕]    │
│                                               │
│  Template Name *                              │
│  ┌───────────────────────────────────────┐    │
│  │ e.g. Gold Rewards                     │    │
│  └───────────────────────────────────────┘    │
│                                               │
│  Description                                  │
│  ┌───────────────────────────────────────┐    │
│  │ Optional description for this tier    │    │
│  └───────────────────────────────────────┘    │
│                                               │
│  Tier *                                       │
│  ┌───────────────────────────────────────┐    │
│  │ Standard ▾                            │    │
│  └───────────────────────────────────────┘    │
│                                               │
│  ┌─ Two Column ─────────────────────────┐    │
│  │ Points per €1        │ Min. Redeem    │    │
│  │ ┌──────────────┐    │ ┌────────────┐ │    │
│  │ │ 1.00         │    │ │ 100        │ │    │
│  │ └──────────────┘    │ └────────────┘ │    │
│  │                      │                │    │
│  │ Bonus Multiplier     │ Validity (days)│    │
│  │ ┌──────────────┐    │ ┌────────────┐ │    │
│  │ │ 1.00         │    │ │ 365        │ │    │
│  │ └──────────────┘    │ └────────────┘ │    │
│  └───────────────────────────────────────┘    │
│                                               │
│         [Cancel]  [Create Template ✓]         │
│                                               │
└───────────────────────────────────────────────┘
```

### Active Cards Tab (Table View)

```
│  ┌─ Filter Bar ──────────────────────────────────────────────┐   │
│  │ [🔍 Search card # or customer...] [Status ▾] [Template ▾] │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Card Number    │ Customer       │ Template  │ Status  │ Points   │
│  ───────────────┼────────────────┼───────────┼─────────┼───────── │
│  LOY-0042-ABCD  │ Maria Silva    │ Gold      │ Active  │ 1,250    │
│  LOY-0041-EFGH  │ John Chen      │ Standard  │ Active  │ 780      │
│  LOY-0039-IJKL  │ Ana López      │ Gold      │ Suspend │ 2,100    │
│                                                                   │
│  ◀ 1 2 3 ... 63 ▶                  Showing 1-20 of 1,247         │
```

### Card Management — Annotations

| Element            | Token / Spec                                                    |
|--------------------|-----------------------------------------------------------------|
| Template card      | White, `borderRadius.lg` (12px), `shadow.sm`, padding `lg`, 280px min-width |
| Tier badge         | `borderRadius.sm` (4px), `body.xsmall`, Gold: `amber.500` bg + white text, Standard: `gray.200` bg + `gray.700` text, Silver: `gray.300` bg, Platinum: `primary.600` bg + white |
| "Create New" card  | Dashed border `2px gray.300`, `gray.500` text, hover: `primary.50` bg + `primary.600` border |
| Template stats     | `body.small`, `gray.500`                                       |
| Modal              | 560px width, `borderRadius.lg`, `shadow.xl`, backdrop `rgba(0,0,0,0.4)` |
| Form inputs        | 40px height, `borderRadius.md`, `border: 1px gray.200`, focus: `primary.600` 2px ring |
| Primary button     | `primary.600` bg, white text, `borderRadius.md`, 40px height, hover: `primary.700` |
| Secondary button   | White bg, `gray.700` text, `border: 1px gray.200`, hover: `gray.50` bg |

---

## 4. Transaction History Page (`/dashboard/transactions`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR          │  MAIN CONTENT                                            │
│                  │                                                           │
│                  │  ┌─ Page Header ──────────────────────────────────────┐   │
│                  │  │ H1: "Transactions"                  [Export CSV ↓] │   │
│                  │  └──────────────────────────────────────────────────────┘   │
│                  │                                                           │
│                  │  ┌─ Summary Cards (inline) ──────────────────────────────┐   │
│                  │  │  Today: +4,530 earned · -1,200 redeemed · Net +3,330 │   │
│                  │  └──────────────────────────────────────────────────────────┘   │
│                  │                                                           │
│                  │  ┌─ Filter Bar ──────────────────────────────────────────┐   │
│                  │  │ [🔍 Search customer or card #...]                     │   │
│                  │  │ [Type ▾: All]  [Date: Last 7 days ▾]  [Clear all]   │   │
│                  │  └──────────────────────────────────────────────────────────┘   │
│                  │                                                           │
│                  │  ┌─ Transaction Table ───────────────────────────────────┐   │
│                  │  │                                                       │   │
│                  │  │  Date/Time       │ Customer     │ Type    │ Points   │   │
│                  │  │  ────────────────┼──────────────┼─────────┼───────── │   │
│                  │  │  Mar 31, 14:32   │ Maria Silva  │ ● EARN  │ +50      │   │
│                  │  │  Card LOY-0042   │              │         │ Bal: 1,250│   │
│                  │  │  ─────────────────────────────────────────────────── │   │
│                  │  │  Mar 31, 14:15   │ John Chen    │ ◆ REDEEM│ -200     │   │
│                  │  │  Card LOY-0041   │              │         │ Bal: 780 │   │
│                  │  │  ─────────────────────────────────────────────────── │   │
│                  │  │  Mar 31, 13:50   │ Ana López    │ ● EARN  │ +25      │   │
│                  │  │  Card LOY-0039   │              │         │ Bal: 2,100│   │
│                  │  │  ─────────────────────────────────────────────────── │   │
│                  │  │  Mar 31, 12:00   │ Liam Brown   │ ★ BONUS │ +100     │   │
│                  │  │  Card LOY-0038   │              │         │ Bal: 530 │   │
│                  │  │  ─────────────────────────────────────────────────── │   │
│                  │  │  Mar 31, 11:30   │ Maria Silva  │ ⊘ ADJUST│ +20      │   │
│                  │  │  Card LOY-0042   │ Manual adj.  │         │ Bal: 1,200│   │
│                  │  │                                                       │   │
│                  │  │  ◀ 1 2 3 ... 120 ▶       Showing 1-20 of 2,394      │   │
│                  │  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Expanded Transaction Row (click to expand)

```
│  ┌─ Mar 31, 14:32 — Maria Silva ─────────────────────────────┐ │
│  │                                                             │ │
│  │  Transaction ID:  txn_abc123def456                          │ │
│  │  Card:            LOY-0042-ABCD (Gold Rewards)              │ │
│  │  Type:            EARN                                      │ │
│  │  Points:          +50                                       │ │
│  │  Balance After:   1,250                                     │ │
│  │  Description:     "Purchase — €50.00"                       │ │
│  │  Reference:       order_789xyz                              │ │
│  │  Timestamp:       2026-03-31T14:32:15Z                      │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
```

### Transaction History — Annotations

| Element              | Token / Spec                                                  |
|----------------------|---------------------------------------------------------------|
| Summary bar          | `primary.50` bg, `borderRadius.md`, padding `md`, `body.small` bold values |
| Type badge colors    | EARN: `emerald.500`, REDEEM: `amber.500`, ADJUST: `primary.600`, EXPIRE: `gray.400`, BONUS: `amber.500` with star |
| Points positive      | `emerald.500` text, `font-weight: 600`                       |
| Points negative      | `rose.500` text, `font-weight: 600`                          |
| Row expand animation | `300ms` slide-down, `easing.default`                         |
| Expanded detail      | `gray.50` bg, `borderRadius.md`, `body.small`                |
| Date column          | Primary: `body.default`, Secondary (card #): `body.xsmall`, `gray.500` |

---

## 5. Settings Page (`/dashboard/settings`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR          │  MAIN CONTENT                                            │
│                  │                                                           │
│                  │  ┌─ Page Header ──────────────────────────────────────┐   │
│                  │  │ H1: "Settings"                                     │   │
│                  │  └──────────────────────────────────────────────────────┘   │
│                  │                                                           │
│                  │  ┌─ Section: Business Profile ────────────────────────┐   │
│                  │  │                                                     │   │
│                  │  │  ┌──────┐  Business Name *                         │   │
│                  │  │  │ Logo │  ┌──────────────────────────────────┐    │   │
│                  │  │  │ 80px │  │ Café Bonheur                    │    │   │
│                  │  │  │      │  └──────────────────────────────────┘    │   │
│                  │  │  │[Edit]│                                          │   │
│                  │  │  └──────┘  Email (read-only)                       │   │
│                  │  │            cafe@bonheur.fr                         │   │
│                  │  │                                                     │   │
│                  │  │  Phone              │  Address                     │   │
│                  │  │  ┌────────────────┐ │  ┌────────────────────────┐  │   │
│                  │  │  │ +33 1 23 45 67 │ │  │ 12 Rue de la Paix     │  │   │
│                  │  │  └────────────────┘ │  └────────────────────────┘  │   │
│                  │  │                                                     │   │
│                  │  │  City                │  Country                    │   │
│                  │  │  ┌────────────────┐ │  ┌────────────────────────┐  │   │
│                  │  │  │ Paris          │ │  │ France              ▾  │  │   │
│                  │  │  └────────────────┘ │  └────────────────────────┘  │   │
│                  │  │                                                     │   │
│                  │  │                              [Save Changes]        │   │
│                  │  └────────────────────────────────────────────────────────┘   │
│                  │                                                           │
│                  │  ┌─ Section: Plan & Billing ─────────────────────────┐   │
│                  │  │                                                     │   │
│                  │  │  Current Plan: FREE                                │   │
│                  │  │  ● Up to 100 active cards                         │   │
│                  │  │  ● 1 card template                                │   │
│                  │  │  ● Basic analytics                                │   │
│                  │  │                                                     │   │
│                  │  │  [Upgrade Plan →]                                  │   │
│                  │  └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```
