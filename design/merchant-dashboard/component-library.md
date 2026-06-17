# Merchant Dashboard — Component Library

> Reusable UI components for the merchant dashboard. All components reference tokens from `design-tokens.json`. Built with React + Lucide icons.

---

## 1. Layout Components

### AppShell
The root layout wrapper for all dashboard pages.

```
Props:
  - children: ReactNode (page content)

Structure:
  ┌─────────────────────────────────────┐
  │ Sidebar │ TopBar (mobile only)      │
  │         │ ┌───────────────────────┐ │
  │         │ │ Page Content          │ │
  │         │ │ (max-width: 1200px)   │ │
  │         │ │ (padding: spacing.xl) │ │
  │         │ └───────────────────────┘ │
  │         │ BottomTabBar (mobile)     │
  └─────────────────────────────────────┘

CSS tokens:
  - Sidebar bg: white, border-right: 1px gray.200
  - Content bg: gray.50
  - Sidebar width: 240px (desktop), 64px (tablet rail), 0 (mobile)
```

### PageHeader
Consistent header for every page.

```
Props:
  - title: string (H1)
  - subtitle?: string (badge or count)
  - actions?: ReactNode (right-aligned buttons)

Structure:
  ┌──────────────────────────────────────────┐
  │ H1: {title}  [subtitle]     {actions}    │
  └──────────────────────────────────────────┘

Tokens:
  - title: heading.h1 (32px/700), gray.900
  - subtitle: body.xsmall, gray.500, bg gray.100, borderRadius.full, padding xs/sm
  - margin-bottom: spacing.lg
```

---

## 2. Data Display Components

### KPICard
Displays a single metric with trend.

```
Props:
  - label: string
  - value: string | number
  - trend?: { value: string, direction: "up" | "down" }
  - icon?: LucideIcon

Structure:
  ┌────────────────────────┐
  │ [icon]                 │
  │ {label}                │  ← body.small, gray.500
  │ {value}                │  ← heading.h2, gray.900
  │ {trend.value} ↑        │  ← body.xsmall, emerald.500 or rose.500
  └────────────────────────┘

Tokens:
  - bg: white, borderRadius.md, shadow.sm
  - padding: spacing.lg
  - icon: 20px, gray.400
  - min-width: 200px
  - gap between cards: spacing.md
```

### DataTable
Generic table component used across customers, cards, and transactions pages.

```
Props:
  - columns: { key, label, width?, sortable?, render? }[]
  - data: any[]
  - onRowClick?: (row) => void
  - expandable?: boolean
  - pagination?: { page, total, limit, onChange }
  - emptyState?: ReactNode
  - selectable?: boolean

Structure:
  ┌──────────────────────────────────────┐
  │ Header Row                           │  ← body.xsmall, gray.500, uppercase
  │ ────────────────────────────────────  │
  │ Data Row 1                           │  ← body.default, 64px min-height
  │ ────────────────────────────────────  │
  │ Data Row 2                           │
  │ ...                                  │
  │ Pagination                           │
  └──────────────────────────────────────┘

Tokens:
  - bg: white, borderRadius.md, shadow.sm
  - header: padding spacing.md, border-bottom 1px gray.200
  - row: padding spacing.md, border-bottom 1px gray.200, hover bg gray.50
  - sort icon: 16px, gray.400, active: primary.600
```

### StatusBadge
Colored indicator for card status, transaction type, etc.

```
Props:
  - status: "active" | "suspended" | "expired" | "cancelled"
  - size?: "sm" | "md"

Variants:
  active:    ● emerald.500 dot + "Active" text
  suspended: ● amber.500 dot + "Suspended" text
  expired:   ● gray.400 dot + "Expired" text
  cancelled: ● rose.500 dot + "Cancelled" text

Tokens:
  - dot: 8px circle (sm) or 10px (md)
  - text: body.small, gray.700
  - gap: spacing.xs between dot and text
```

### TransactionTypeBadge
Visual indicator for transaction types.

```
Props:
  - type: "EARN" | "REDEEM" | "ADJUST" | "EXPIRE" | "BONUS"

Variants:
  EARN:   emerald.500 bg (light), emerald.700 text, "Earn"
  REDEEM: amber.50 bg, amber.600 text, "Redeem"
  ADJUST: primary.50 bg, primary.600 text, "Adjust"
  EXPIRE: gray.100 bg, gray.500 text, "Expire"
  BONUS:  amber.50 bg, amber.600 text, star icon, "Bonus"

Tokens:
  - borderRadius.sm, padding xs (vertical) sm (horizontal)
  - text: body.xsmall (12px/500)
```

### Avatar
User avatar with fallback initials.

```
Props:
  - src?: string (image URL)
  - name: string (for initials fallback)
  - size?: "sm" (32px) | "md" (40px) | "lg" (64px)

Tokens:
  - borderRadius.full
  - fallback bg: primary.100, text: primary.700, font-weight: 600
  - border: 2px white (for overlap use cases)
```

---

## 3. Input Components

### SearchInput
Search field with icon and optional clear button.

```
Props:
  - placeholder: string
  - value: string
  - onChange: (value: string) => void
  - onClear?: () => void

Structure:
  ┌──────────────────────────────────┐
  │ [🔍]  {placeholder / value}  [✕] │
  └──────────────────────────────────┘

Tokens:
  - height: 40px
  - bg: white, border: 1px gray.200, borderRadius.md
  - focus: border primary.600, ring 2px primary.100
  - icon: 20px, gray.400
  - text: body.default, gray.900
  - placeholder: gray.500
```

### FilterDropdown
Dropdown for filtering tables.

```
Props:
  - label: string
  - options: { value, label }[]
  - value: string
  - onChange: (value) => void

Tokens:
  - height: 36px
  - bg: white, border: 1px gray.200, borderRadius.md
  - text: body.small, gray.700
  - chevron icon: 16px, gray.400
  - dropdown panel: white, shadow.md, borderRadius.md, max-height 240px
```

### FormInput
Standard text input for forms.

```
Props:
  - label: string
  - value: string
  - onChange: (value) => void
  - type?: "text" | "email" | "number"
  - placeholder?: string
  - error?: string
  - required?: boolean
  - disabled?: boolean

Tokens:
  - label: body.small, font-weight 500, gray.700, margin-bottom spacing.xs
  - input: 40px height, borderRadius.md, border 1px gray.200, padding 0 spacing.sm
  - focus: border primary.600, ring 2px primary.100
  - error: border rose.500, error text body.xsmall rose.500, margin-top spacing.xs
  - disabled: bg gray.50, text gray.400, cursor not-allowed
```

---

## 4. Action Components

### Button

```
Props:
  - variant: "primary" | "secondary" | "ghost" | "danger"
  - size?: "sm" (32px) | "md" (40px) | "lg" (48px)
  - icon?: LucideIcon
  - iconPosition?: "left" | "right"
  - loading?: boolean
  - disabled?: boolean
  - children: ReactNode

Variants:
  primary:   bg primary.600, text white, hover primary.700, active primary.800
  secondary: bg white, text gray.700, border 1px gray.200, hover bg gray.50
  ghost:     bg transparent, text gray.700, hover bg gray.100
  danger:    bg rose.500, text white, hover rose.600

Tokens:
  - borderRadius.md
  - font: body.default (md), body.small (sm), font-weight 500
  - padding: 0 spacing.md (md), 0 spacing.sm (sm)
  - gap (icon + text): spacing.xs
  - disabled: opacity 0.5, cursor not-allowed
  - loading: spinner replaces icon, pointer-events none
  - transition: duration.micro, easing.default
```

### IconButton
Compact icon-only button (e.g., table actions, close buttons).

```
Props:
  - icon: LucideIcon
  - variant: "ghost" | "secondary"
  - size?: "sm" (28px) | "md" (36px)
  - tooltip?: string
  - onClick: () => void

Tokens:
  - borderRadius.md (sm uses borderRadius.sm)
  - icon: 16px (sm) or 20px (md), gray.500
  - hover: bg gray.100, icon gray.700
```

---

## 5. Overlay Components

### Modal
Centered dialog for create/edit flows.

```
Props:
  - title: string
  - open: boolean
  - onClose: () => void
  - width?: number (default 560px)
  - children: ReactNode
  - footer?: ReactNode

Tokens:
  - bg: white, borderRadius.lg, shadow.xl
  - backdrop: rgba(0,0,0,0.4), blur(4px)
  - header: padding spacing.lg, border-bottom 1px gray.200
  - title: heading.h3 (20px/600)
  - body: padding spacing.lg
  - footer: padding spacing.md spacing.lg, border-top 1px gray.200, flex justify-end gap spacing.sm
  - close icon: top-right, gray.400, hover gray.600
  - animation: scale(0.95) → scale(1), opacity 0→1, duration.normal, easing.enter
  - mobile (<768px): full-screen, borderRadius 0, bottom-sheet slide-up
```

### SlideOver
Right-side panel for detail views.

```
Props:
  - title: string
  - open: boolean
  - onClose: () => void
  - width?: number (default 480px)
  - children: ReactNode

Tokens:
  - bg: white, shadow.lg
  - header: padding spacing.lg, border-bottom 1px gray.200, flex space-between
  - title: heading.h3
  - body: padding spacing.lg, overflow-y auto
  - animation: translateX(100%) → translateX(0), duration.normal, easing.enter
  - backdrop: rgba(0,0,0,0.2) (click to close)
  - mobile (<768px): full-screen, slide-up from bottom
```

### Toast
Notification for success/error feedback.

```
Props:
  - message: string
  - type: "success" | "error" | "info"
  - duration?: number (default 4000ms)
  - action?: { label, onClick }

Variants:
  success: emerald.500 left border + emerald.500 check-circle icon
  error:   rose.500 left border + rose.500 alert-circle icon
  info:    primary.600 left border + primary.600 info icon

Tokens:
  - bg: white, shadow.lg, borderRadius.md
  - position: fixed, top spacing.lg, right spacing.lg
  - left border: 4px solid
  - padding: spacing.md
  - text: body.small, gray.900
  - animation: slide-in from right, fade-out on dismiss
  - max-width: 400px
```

---

## 6. Navigation Components

### SidebarNav
Primary navigation in sidebar.

```
Props:
  - items: { label, icon, href, badge? }[]
  - activeHref: string
  - onNavigate: (href) => void

Item states:
  default:  text gray.500, icon gray.400
  hover:    bg gray.50, text gray.700
  active:   bg primary.50, text primary.600, left border 3px primary.600

Tokens:
  - item height: 40px, padding 0 spacing.md
  - icon: 20px, margin-right spacing.sm
  - text: body.default, font-weight 500
  - badge: body.xsmall, primary.600 text, primary.50 bg, borderRadius.full, min-width 20px
  - section divider: 1px gray.200, margin spacing.sm 0
```

### BottomTabBar (Mobile)
Bottom navigation for mobile.

```
Props:
  - items: { label, icon, href }[]
  - activeHref: string

Tokens:
  - height: 56px
  - bg: white, border-top 1px gray.200, shadow.sm (upward)
  - item: flex column, center, gap 2px
  - icon: 24px
  - label: body.xsmall (12px)
  - default: gray.400 icon + text
  - active: primary.600 icon + text, font-weight 600
  - safe area padding on iOS
```

### Pagination
Page navigation for tables.

```
Props:
  - page: number
  - total: number
  - limit: number
  - onChange: (page: number) => void

Structure (desktop):
  ◀  1  2  3  ...  45  ▶     Showing 1-20 of 892

Structure (mobile):
  [← Previous]  [Next →]

Tokens:
  - page button: 36px square, borderRadius.md
  - default: text gray.700, hover bg gray.50
  - active: bg primary.600, text white
  - disabled (prev/next at bounds): text gray.300, cursor not-allowed
  - "Showing" text: body.small, gray.500
```

---

## 7. Chart Components

### BarChart
Used on Overview page for activity visualization.

```
Props:
  - data: { label, values: { key, value }[] }[]
  - series: { key, color, label }[]
  - period: "7d" | "30d"
  - onPeriodChange: (period) => void
  - height?: number (default 280px)

Tokens:
  - bg: white card, borderRadius.md, shadow.sm, padding spacing.lg
  - bar colors: primary.600 (points earned), amber.500 (redemptions)
  - bar borderRadius: borderRadius.sm on top corners
  - axis labels: body.xsmall, gray.500
  - grid lines: 1px gray.100
  - bar hover: tooltip with exact value, shadow.md
  - legend: body.small, colored dot 8px + label
  - period toggle: body.small buttons, active primary.600 bg + white text, borderRadius.full
```

---

## 8. Empty States

Consistent pattern for pages/sections with no data.

```
Props:
  - icon: LucideIcon
  - title: string
  - description: string
  - action?: { label, onClick, variant }

Structure:
  ┌──────────────────────────────────┐
  │       [icon 48px, gray.300]      │
  │                                  │
  │       H3: {title}                │  ← gray.900
  │       Body: {description}        │  ← gray.500
  │                                  │
  │       [Action Button]            │
  └──────────────────────────────────┘

Tokens:
  - centered in parent, padding spacing.3xl vertical
  - icon: 48px, gray.300
  - title: heading.h3, gray.900, margin-top spacing.md
  - description: body.default, gray.500, max-width 400px, margin-top spacing.xs
  - action: margin-top spacing.lg
```
