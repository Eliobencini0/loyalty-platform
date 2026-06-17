# Customer Loyalty Card — Mobile Wireframes

> Mobile-first wireframes for the customer-facing loyalty experience. All measurements reference `design-tokens.json`. Optimized for 375px viewport (iPhone SE/standard), scales to 428px (iPhone Pro Max).

---

## Navigation Model

The customer app uses a bottom tab bar with 4 tabs:

```
┌─────────────────────────────────────┐
│                                     │
│         (Active screen)             │
│                                     │
├─────────────────────────────────────┤
│  [Card]   [QR]   [History]  [More] │
│   ●        ○        ○        ○     │
└─────────────────────────────────────┘
```

| Tab      | Icon           | Screen           |
|----------|----------------|------------------|
| Card     | `credit-card`  | My Card          |
| QR       | `qr-code`      | QR Code Display  |
| History  | `star`         | Points History   |
| More     | `user`         | Profile & Settings |

---

## 1. My Card Screen (`/card`)

The primary home screen. Shows the customer's digital loyalty card with points balance and merchant branding.

### Card View — Active Card

```
┌─────────────────────────────────────┐
│ ░░░ status bar ░░░░░░░░░░░░░ 9:41  │
├─────────────────────────────────────┤
│                                     │
│  H3: "My Card"              [bell] │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ ┌─────────────────────────────┐ ││
│  │ │                             │ ││
│  │ │  ★ GOLD REWARDS            │ ││
│  │ │                             │ ││
│  │ │  [Loyali Logo]              │ ││
│  │ │  Café Bonheur               │ ││
│  │ │                             │ ││
│  │ │                             │ ││
│  │ │      1,250                  │ ││
│  │ │      points                 │ ││
│  │ │                             │ ││
│  │ │  ┌─ Progress to reward ──┐  │ ││
│  │ │  │ ████████████░░░░░░░░ │  │ ││
│  │ │  │ 750 pts to free drink │  │ ││
│  │ │  └──────────────────────┘  │ ││
│  │ │                             │ ││
│  │ │  LOY-0042-ABCD              │ ││
│  │ │  Valid through Jan 2027     │ ││
│  │ └─────────────────────────────┘ ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─ Quick Actions ─────────────────┐│
│  │                                  ││
│  │  ┌──────────┐  ┌──────────────┐ ││
│  │  │ [QR icon]│  │ [gift icon]  │ ││
│  │  │ Show QR  │  │ Redeem Pts   │ ││
│  │  └──────────┘  └──────────────┘ ││
│  │                                  ││
│  └──────────────────────────────────┘│
│                                     │
│  ┌─ Recent Activity ───────────────┐│
│  │  Today                          ││
│  │  ● +50 pts   Purchase  14:32   ││
│  │  ◆ -200 pts  Redeemed  14:15   ││
│  │                                  ││
│  │  Yesterday                      ││
│  │  ● +25 pts   Purchase  11:20   ││
│  │                                  ││
│  │  [View all history →]           ││
│  └──────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  [Card]   [QR]   [History]  [More] │
│   ●        ○        ○        ○     │
└─────────────────────────────────────┘
```

### My Card — Annotations

| Element              | Token / Spec                                                        |
|----------------------|---------------------------------------------------------------------|
| Screen background    | `gray.50`                                                           |
| Card container       | White surface, `borderRadius.lg` (12px), `shadow.md`, padding `lg`  |
| Card inner           | Gradient: `primary.600` → `primary.700`, `borderRadius.md` (8px), padding `lg` |
| Tier badge           | `borderRadius.sm` (4px), `body.xsmall`, `amber.500` bg + white text (Gold tier) |
| Merchant name        | `heading.h4`, white text, `opacity: 0.9`                           |
| Points value         | 48px / 700 weight, white text, center-aligned                      |
| Points label         | `body.small`, white text, `opacity: 0.7`                           |
| Progress bar bg      | `white` at `opacity: 0.2`, `borderRadius.full`, 8px height        |
| Progress bar fill    | `amber.500`, `borderRadius.full`, animated width                   |
| Progress label       | `body.xsmall`, white text, `opacity: 0.8`                         |
| Card number          | `body.xsmall`, white text, `opacity: 0.6`, monospace font         |
| Validity             | `body.xsmall`, white text, `opacity: 0.6`                         |
| Quick action buttons | White bg, `borderRadius.md`, `shadow.sm`, 50% width each, padding `md`, center icon + label |
| Recent activity      | White card, `borderRadius.md`, grouped by date                    |
| Earn indicator       | `emerald.500` dot, `+` prefix, `font-weight: 600`                 |
| Redeem indicator     | `amber.500` diamond, `-` prefix, `font-weight: 600`               |

### Card View — No Card Yet (Empty State)

```
┌─────────────────────────────────────┐
│ ░░░ status bar ░░░░░░░░░░░░░ 9:41  │
├─────────────────────────────────────┤
│                                     │
│  H3: "My Card"                     │
│                                     │
│                                     │
│                                     │
│     [Illustration: stamp card       │
│      with sparkle accents]          │
│                                     │
│     H2: "No card yet"              │
│     Body: "Scan the QR code at     │
│     the register to get started."  │
│                                     │
│     [Primary: Scan to Join]        │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  [Card]   [QR]   [History]  [More] │
│   ●        ○        ○        ○     │
└─────────────────────────────────────┘
```

### Multi-Card View (multiple merchants)

When a customer has cards from multiple merchants, the main card screen shows a horizontally swipeable card carousel:

```
┌─────────────────────────────────────┐
│                                     │
│  H3: "My Cards"             [bell] │
│                                     │
│  ┌───────────┐ ┌───────────┐       │
│  │           │ │           │       │
│  │  Café     │◄│  Sushi    │       │
│  │  Bonheur  │ │  Zen      │       │
│  │  1,250pts │ │  430 pts  │       │
│  │           │ │           │       │
│  └───────────┘ └───────────┘       │
│       ●             ○              │
│                                     │
```

- Horizontal scroll with snap-to-card behavior
- Page indicator dots below the carousel
- Active card is enlarged (scale 1.0), adjacent cards at scale 0.9 with 16px peek
- Quick actions and recent activity update to match the selected card

---

## 2. QR Code Display Screen (`/qr`)

Full-screen QR code for the cashier to scan at the register.

### QR Display — Default

```
┌─────────────────────────────────────┐
│ ░░░ status bar ░░░░░░░░░░░░░ 9:41  │
├─────────────────────────────────────┤
│                                     │
│  H3: "My QR Code"                  │
│                                     │
│  Body (center): "Show this to the  │
│  cashier to earn or redeem points" │
│                                     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │  ┌───────────────────────────┐  ││
│  │  │                           │  ││
│  │  │                           │  ││
│  │  │     ██ ██ ██ ██ ██       │  ││
│  │  │     ██    ██    ██       │  ││
│  │  │     ██ ██ ██ ██ ██       │  ││
│  │  │        ██ ██             │  ││
│  │  │     ██ ██ ██ ██ ██       │  ││
│  │  │     ██          ██       │  ││
│  │  │     ██ ██ ██ ██ ██       │  ││
│  │  │                           │  ││
│  │  │       (200x200px)         │  ││
│  │  │                           │  ││
│  │  └───────────────────────────┘  ││
│  │                                 ││
│  │  LOY-0042-ABCD                  ││
│  │  Café Bonheur                   ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─ Points Summary ───────────────┐│
│  │  Balance: 1,250 pts            ││
│  │  Available to redeem: 1,200    ││
│  └────────────────────────────────┘│
│                                     │
│  [☀ Brightness] Screen stays on   │
│                                     │
├─────────────────────────────────────┤
│  [Card]   [QR]   [History]  [More] │
│   ○        ●        ○        ○     │
└─────────────────────────────────────┘
```

### QR Display — Annotations

| Element              | Token / Spec                                                        |
|----------------------|---------------------------------------------------------------------|
| Screen background    | White (maximizes QR contrast)                                       |
| QR container         | White card, `borderRadius.lg`, `shadow.sm`, padding `xl` (32px)    |
| QR code              | 200x200px, `primary.600` foreground, white background              |
| QR code data         | Encodes card number + merchant ID in a URL: `loyali://card/{cardNumber}` |
| Card number below QR | `body.small`, `gray.500`, monospace font, center-aligned            |
| Merchant name        | `body.default`, `gray.700`, center-aligned                         |
| Points summary       | `gray.50` bg card, `borderRadius.md`, `body.small`                  |
| Brightness hint      | `body.xsmall`, `gray.400`, sun icon + text                        |
| Screen wake lock     | Auto-enable `navigator.wakeLock` when QR tab is active             |

### QR Display — Multi-Card

When the customer has multiple cards, add a merchant selector above the QR:

```
│  [Café Bonheur ▾]                  │
```

Tapping opens a bottom sheet listing all merchants with card counts.

---

## 3. Points History Screen (`/history`)

Full transaction history with filtering.

### History — Default View

```
┌─────────────────────────────────────┐
│ ░░░ status bar ░░░░░░░░░░░░░ 9:41  │
├─────────────────────────────────────┤
│                                     │
│  H3: "Points History"              │
│                                     │
│  ┌─ Summary Card ──────────────────┐│
│  │                                  ││
│  │     1,250                       ││
│  │     Current Balance             ││
│  │                                  ││
│  │  Earned      Redeemed           ││
│  │  3,400       2,150              ││
│  │                                  ││
│  └──────────────────────────────────┘│
│                                     │
│  ┌─ Filter Chips ──────────────────┐│
│  │ [All] [Earned] [Redeemed] [Bonus]│
│  └──────────────────────────────────┘│
│                                     │
│  ── Today ──────────────────────── │
│                                     │
│  ┌──────────────────────────────────┐│
│  │ ● Purchase              +50 pts ││
│  │   Café Bonheur · 14:32          ││
│  ├──────────────────────────────────┤│
│  │ ◆ Free drink redeemed   -200 pts││
│  │   Café Bonheur · 14:15          ││
│  └──────────────────────────────────┘│
│                                     │
│  ── Yesterday ─────────────────── │
│                                     │
│  ┌──────────────────────────────────┐│
│  │ ● Purchase              +25 pts ││
│  │   Café Bonheur · 11:20          ││
│  ├──────────────────────────────────┤│
│  │ ★ Welcome bonus         +100 pts││
│  │   Café Bonheur · 10:05          ││
│  └──────────────────────────────────┘│
│                                     │
│  ── Mar 28 ────────────────────── │
│                                     │
│  ┌──────────────────────────────────┐│
│  │ ● Purchase              +75 pts ││
│  │   Café Bonheur · 15:40          ││
│  └──────────────────────────────────┘│
│                                     │
│  (infinite scroll)                  │
│                                     │
├─────────────────────────────────────┤
│  [Card]   [QR]   [History]  [More] │
│   ○        ○        ●        ○     │
└─────────────────────────────────────┘
```

### Transaction Detail — Bottom Sheet

Tapping a transaction row opens a bottom sheet with full details:

```
┌─────────────────────────────────────┐
│  ─── (drag handle) ───             │
│                                     │
│  ● Earned Points            +50 pts│
│                                     │
│  ┌─────────────────────────────────┐│
│  │  Merchant     Café Bonheur      ││
│  │  Card         LOY-0042-ABCD     ││
│  │  Type         EARN              ││
│  │  Points       +50               ││
│  │  Balance      1,250             ││
│  │  Description  Purchase — €50.00 ││
│  │  Date         Mar 31, 14:32     ││
│  │  Reference    order_789xyz      ││
│  └─────────────────────────────────┘│
│                                     │
│  [Close]                           │
│                                     │
└─────────────────────────────────────┘
```

### Points History — Annotations

| Element              | Token / Spec                                                        |
|----------------------|---------------------------------------------------------------------|
| Screen background    | `gray.50`                                                           |
| Summary card         | `primary.600` gradient bg, white text, `borderRadius.lg`           |
| Balance value        | 40px / 700 weight, white, center-aligned                           |
| Balance label        | `body.small`, white, `opacity: 0.8`                               |
| Earned/Redeemed      | `heading.h3`, white, in a 2-column row                              |
| Filter chips         | Horizontal scroll, `borderRadius.full`, 32px height                 |
| Active chip          | `primary.600` bg, white text                                       |
| Inactive chip        | White bg, `gray.700` text, `border: 1px gray.200`                 |
| Date header          | `body.xsmall`, `gray.500`, uppercase, `letter-spacing: 0.05em`    |
| Transaction row      | White card, `borderRadius.md`, 56px min-height, padding `md`      |
| EARN icon            | 8px `emerald.500` circle                                            |
| REDEEM icon          | 8px `amber.500` diamond                                            |
| BONUS icon           | 8px `amber.500` star                                               |
| ADJUST icon          | 8px `primary.600` circle-adjust                                    |
| EXPIRE icon          | 8px `gray.400` circle                                              |
| Points positive      | `emerald.500`, `font-weight: 600`                                  |
| Points negative      | `rose.500`, `font-weight: 600`                                     |
| Bottom sheet         | White bg, `borderRadius.xl` top corners, `shadow.xl`, slide-up 300ms |
| Detail table         | Key-value pairs, `body.small`, alternating `gray.50` rows          |
| Infinite scroll      | Load 20 items, fetch next page on 80% scroll threshold             |

---

## 4. Profile & Settings Screen (`/more`)

```
┌─────────────────────────────────────┐
│ ░░░ status bar ░░░░░░░░░░░░░ 9:41  │
├─────────────────────────────────────┤
│                                     │
│  H3: "Profile"                     │
│                                     │
│  ┌─ Profile Card ──────────────────┐│
│  │  [Avatar 64px]                  ││
│  │  H4: Maria Silva               ││
│  │  maria@email.com                ││
│  │  Member since Jan 2026          ││
│  │  [Edit Profile →]              ││
│  └──────────────────────────────────┘│
│                                     │
│  ┌─ My Cards ─────────────────────┐│
│  │  [card icon] Café Bonheur      ││
│  │              Gold · 1,250 pts  ││
│  │──────────────────────────────── ││
│  │  [card icon] Sushi Zen         ││
│  │              Standard · 430 pts││
│  └──────────────────────────────────┘│
│                                     │
│  ┌─ Settings ─────────────────────┐│
│  │  [bell] Notifications       [→]││
│  │──────────────────────────────── ││
│  │  [lock] Privacy             [→]││
│  │──────────────────────────────── ││
│  │  [help] Help & Support      [→]││
│  │──────────────────────────────── ││
│  │  [info] About Loyali        [→]││
│  └──────────────────────────────────┘│
│                                     │
│  [Log Out]                         │
│                                     │
├─────────────────────────────────────┤
│  [Card]   [QR]   [History]  [More] │
│   ○        ○        ○        ●     │
└─────────────────────────────────────┘
```

---

## 5. Notifications (bell icon from Card screen)

```
┌─────────────────────────────────────┐
│ ░░░ status bar ░░░░░░░░░░░░░ 9:41  │
├─────────────────────────────────────┤
│                                     │
│  [← Back] H3: "Notifications"     │
│                                     │
│  ── New ────────────────────────── │
│                                     │
│  ┌──────────────────────────────────┐│
│  │ ● Nice! You earned 50 points   ││
│  │   Café Bonheur · 2 min ago      ││
│  ├──────────────────────────────────┤│
│  │ ● 3 stamps to your free drink! ││
│  │   Café Bonheur · 2 min ago      ││
│  └──────────────────────────────────┘│
│                                     │
│  ── Earlier ────────────────────── │
│                                     │
│  ┌──────────────────────────────────┐│
│  │ ○ Welcome to Café Bonheur!     ││
│  │   You're set up with Gold tier. ││
│  │   Yesterday                      ││
│  └──────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  [Card]   [QR]   [History]  [More] │
└─────────────────────────────────────┘
```

---

## Responsive Breakpoints

| Viewport        | Width   | Adaptation                                                  |
|-----------------|---------|-------------------------------------------------------------|
| Small phone     | 320px   | Card padding reduces to `md`, QR code 160x160px            |
| Standard phone  | 375px   | Default layout as wireframed                                |
| Large phone     | 428px   | Card padding increases to `xl`, QR code 220x220px          |
| Tablet (future) | 768px+  | Two-column: card on left, history on right                  |
