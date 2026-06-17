# Merchant Dashboard — Information Architecture

> Navigation structure and screen hierarchy for the Loyali merchant-facing dashboard.

---

## 1. Primary Navigation (Sidebar)

The dashboard uses a **persistent left sidebar** (240px wide) with icon + label navigation.
On mobile (<768px), the sidebar collapses to a bottom tab bar with the top 5 items.

```
┌─────────────────────┐
│  [Logo] Loyali       │
│─────────────────────│
│  ◈  Overview         │  ← Default landing
│  👥 Customers        │
│  💳 Cards            │
│  📊 Transactions     │
│  🎁 Rewards          │  ← Future (v2)
│─────────────────────│
│  ⚙  Settings         │
│  ?  Help             │
│─────────────────────│
│  [Merchant Avatar]   │
│  Merchant Name       │
│  merchant@email.com  │
│  [Log out]           │
└─────────────────────┘
```

### Navigation Items

| Item           | Route               | Icon (Lucide)  | Description                            | MVP |
|----------------|---------------------|----------------|----------------------------------------|-----|
| Overview       | `/dashboard`        | `chart-bar`    | KPIs, recent activity, quick actions   | Yes |
| Customers      | `/dashboard/customers` | `users`     | Customer list, search, profiles        | Yes |
| Cards          | `/dashboard/cards`  | `credit-card`  | Card templates, active cards           | Yes |
| Transactions   | `/dashboard/transactions` | `receipt-text` | Points history, filters           | Yes |
| Rewards        | `/dashboard/rewards` | `gift`        | Reward catalog management              | v2  |
| Settings       | `/dashboard/settings` | `settings`   | Profile, plan, API keys                | Yes |
| Help           | `/dashboard/help`   | `help-circle`  | Docs, support contact                  | Yes |

---

## 2. Screen Hierarchy

```
Dashboard (authenticated merchant)
├── Overview
│   ├── KPI Cards (active cards, total customers, points issued today, redemptions)
│   ├── Activity Chart (7d / 30d toggle)
│   ├── Recent Transactions (last 10)
│   └── Quick Actions (issue card, scan QR, create template)
│
├── Customers
│   ├── Customer List (paginated table)
│   │   ├── Search / filter bar
│   │   ├── Sort by: name, points, last visit, join date
│   │   └── Bulk actions: export CSV
│   └── Customer Detail (slide-over panel)
│       ├── Profile info
│       ├── Loyalty card summary
│       ├── Points balance + history
│       └── Actions: adjust points, suspend card
│
├── Cards
│   ├── Card Templates (grid view)
│   │   ├── Create Template (modal)
│   │   └── Edit Template (modal)
│   └── Active Cards (table view)
│       ├── Filter by: status, template, date range
│       └── Card Detail (slide-over)
│
├── Transactions
│   ├── Transaction List (paginated table)
│   │   ├── Filter by: type (earn/redeem/adjust/expire/bonus), date range, customer
│   │   ├── Search by customer name or card number
│   │   └── Export CSV
│   └── Transaction Detail (expandable row)
│
├── Settings
│   ├── Profile (merchant info, logo upload)
│   ├── Plan & Billing
│   └── API Keys (future)
│
└── Help
    ├── Getting Started guide
    └── Contact Support
```

---

## 3. User Flows

### Flow 1: First-Time Setup
1. Merchant signs up → lands on **Overview** (empty state)
2. Empty state CTA: "Create your first card template"
3. → Opens **Cards** → Create Template modal
4. After creation: "Share your QR code with customers"

### Flow 2: Daily Check-In (Merchant at Register)
1. Merchant opens dashboard → **Overview**
2. Clicks "Scan QR" quick action (or customer presents QR)
3. → QR scanner overlay opens
4. Scan confirms customer → points awarded → toast notification
5. Transaction appears in Recent Transactions

### Flow 3: Customer Lookup
1. Merchant navigates to **Customers**
2. Types customer name or email in search
3. Clicks row → slide-over shows customer detail
4. Views points balance, can adjust points or suspend card

### Flow 4: End-of-Day Review
1. Merchant opens **Overview** → reviews today's KPIs
2. Clicks "View all transactions" → **Transactions** page
3. Filters by today → reviews all point activities
4. Exports CSV for bookkeeping

---

## 4. URL Structure

All merchant dashboard routes are prefixed with `/dashboard` and require authentication.

| Route                              | Component         |
|------------------------------------|-------------------|
| `/dashboard`                       | OverviewPage      |
| `/dashboard/customers`             | CustomerListPage  |
| `/dashboard/customers/:id`         | CustomerDetailPage (or slide-over) |
| `/dashboard/cards`                 | CardsPage         |
| `/dashboard/cards/templates/:id`   | TemplateDetailPage (or modal) |
| `/dashboard/transactions`          | TransactionsPage  |
| `/dashboard/settings`              | SettingsPage      |
| `/dashboard/help`                  | HelpPage          |
