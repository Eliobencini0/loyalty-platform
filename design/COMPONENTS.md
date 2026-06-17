# Component Guidelines v3.0

> Implementation guidelines for Loyalty Platform UI components using the Hybrid Design System.

**Version**: 3.0  
**Last Updated**: 2026-04-18

---

## 🎯 Component Philosophy

Each component falls into one of two categories:

- **Expressive**: Interactive, engaging, calls-to-action
- **Technical**: Data-focused, precise, informational

Use the CSS utility classes (`.expressive`, `.technical`, `.card-technical`) to apply the correct style.

---

## 🔘 Buttons

### FAB (Floating Action Button)

#### Primary FAB (Yellow - UNIQUE!)

**Usage**: Main action only (e.g., "Add Points", "Scan QR")

```tsx
<button className="fab-primary expressive">
  <span className="material-symbols-outlined">add</span>
</button>
```

**CSS**:
```css
.fab-primary {
  background: var(--md-sys-color-secondary-container); /* #EFFF74 */
  color: var(--md-sys-color-on-secondary-container);   /* #6B7600 */
  border-radius: var(--radius-expressive);  /* 12px */
  box-shadow: var(--shadow-expressive-md);
}
```

**⚠️ RULE**: Only ONE yellow FAB per screen!

#### Secondary FAB (Purple)

**Usage**: Secondary actions (e.g., "Redeem", "Show QR")

```tsx
<button className="quick-action-fab expressive accent-purple-bg">
  <span className="material-symbols-outlined">redeem</span>
</button>
```

**CSS**:
```css
.accent-purple-bg {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}
```

### Standard Buttons

#### Filled Button (Expressive)

```tsx
<button className="btn btn-primary btn-expressive">
  Save Changes
</button>
```

**CSS**:
```css
.btn-expressive {
  border-radius: var(--radius-expressive); /* 12px */
  font-family: var(--font-label);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

#### Outlined Button

```tsx
<button className="btn btn-outlined expressive">
  Cancel
</button>
```

---

## 📇 Cards

### KPI Card (Technical)

**Usage**: Dashboard metrics, statistics, data displays

```tsx
<article className="app-stat-card card-technical">
  <p className="app-stat-label kpi-label">Active Members</p>
  <p className="app-stat-value kpi-value text-data">1,234</p>
</article>
```

**CSS**:
```css
.card-technical {
  border-radius: var(--radius-technical); /* 4px */
  background: #FFFFFF;
  border: 1px solid var(--md-sys-color-outline-variant);
  box-shadow: none; /* Flat! */
}

.kpi-value {
  font-family: var(--font-body);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.kpi-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--md-sys-color-on-surface-variant);
}
```

### Customer Card (Technical)

```tsx
<article className="app-surface-card card-technical">
  <div className="customer-row">
    <div className="customer-main">
      <p className="customer-name">Marco Rossi</p>
      <p className="customer-contact">marco@example.com</p>
    </div>
    <div className="customer-points">
      <p className="customer-points-value text-data">450</p>
      <p className="customer-points-label kpi-label">Points</p>
    </div>
  </div>
</article>
```

### Program Card (Expressive)

**Usage**: Active program display, featured content

```tsx
<div className="program-card-minimal aviator-shadow expressive-lg">
  <h2 className="program-card-name title-expressive">
    Stamp Card
  </h2>
  <div className="program-card-stats">
    {/* Stats here */}
  </div>
</div>
```

**Note**: Uses larger radius (16-20px) and soft shadow for visual prominence.

---

## ✏️ Forms

### Text Field (Outlined)

```tsx
<div className="form-field">
  <label className="form-label kpi-label">Customer Name</label>
  <input
    type="text"
    className="form-input outlined expressive"
    placeholder="Enter name"
  />
</div>
```

**CSS**:
```css
.form-input.outlined {
  border: 2px solid var(--md-sys-color-outline-variant);
  border-radius: var(--radius-expressive); /* 12px */
}

.form-input.outlined:focus {
  border-color: var(--md-sys-color-primary); /* Purple */
  outline: none;
}
```

---

## 📊 Data Tables (Technical)

### Insights Table

```tsx
<table className="table-technical insights-table">
  <thead>
    <tr>
      <th>Metric</th>
      <th>Value</th>
      <th>Trend</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="text-data">Retention D7</td>
      <td className="number-display">62.4%</td>
      <td><span className="trend-up">↗ 5.2%</span></td>
    </tr>
  </tbody>
</table>
```

**CSS**:
```css
.table-technical {
  border-radius: var(--radius-technical-sm); /* 2px */
  border: 1px solid var(--md-sys-color-outline-variant);
  box-shadow: none;
}

.table-technical th {
  font-family: var(--font-label);
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  background: var(--md-sys-color-surface-variant);
}

.table-technical td {
  font-family: var(--font-body);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}
```

---

## 🏷️ Badges & Indicators

### Success Badge (Yellow - Small!)

**Usage**: Success states, positive notifications, small indicators

```tsx
<span className="success-badge">+10 points</span>
```

**CSS**:
```css
.success-badge {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  border-radius: var(--radius-expressive-full); /* Circular */
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 700;
}
```

### Status Badge

```tsx
<span className="status-badge status-active">Active</span>
```

**CSS**:
```css
.status-badge {
  border-radius: var(--radius-expressive);
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 700;
}

.status-active {
  background: var(--success);
  color: white;
}
```

---

## 📄 Pages

### Insights Page (Full Technical)

```tsx
<div className="app-page page-insights">
  <header className="app-page-header">
    <h1 className="app-page-title title-technical">Analytics</h1>
  </header>

  <section className="insights-kpi-grid">
    <KPICard
      title="Active Members"
      value="1,234"
      trend={5.2}
    />
    {/* More KPIs */}
  </section>

  <table className="table-technical insights-table">
    {/* Data */}
  </table>
</div>
```

**CSS**:
```css
.page-insights {
  background: #FFFFFF; /* Pure white */
}

.page-insights .app-surface-card {
  background: #FFFFFF;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--radius-technical);
  box-shadow: none;
}
```

### Dashboard Page (Hybrid)

```tsx
<div className="hub-page">
  {/* Expressive Header */}
  <h1 className="app-header-title title-expressive">
    Buongiorno, Marco
  </h1>

  {/* Expressive FABs */}
  <div className="quick-actions">
    <button className="fab-primary">Add Points</button>
    <button className="accent-purple-bg">Redeem</button>
  </div>

  {/* Technical Stats */}
  <div className="app-stat-grid">
    <div className="card-technical">
      <span className="kpi-label">Today</span>
      <span className="kpi-value text-data">45</span>
    </div>
  </div>
</div>
```

---

## 🎨 Typography Components

### Emotional Titles

```tsx
<h1 className="title-expressive">
  Welcome to Loyalty
</h1>
```

**Renders as**: DM Serif Display, Italic, -0.02em letter-spacing

### Technical Titles

```tsx
<h2 className="title-technical">
  Analytics Overview
</h2>
```

**Renders as**: DM Sans, Bold, Normal (NO italic)

### Data Values

```tsx
<span className="text-data kpi-value">
  1,234.56
</span>
```

**Renders as**: DM Sans, 600 weight, tabular-nums (aligned numbers)

---

## 📐 Layout Components

### Bottom Navigation

```tsx
<nav className="bottom-nav">
  <a href="/today" className="nav-item active">
    <span className="material-symbols-outlined">calendar_today</span>
    <span className="nav-label">Today</span>
  </a>
  <a href="/insights" className="nav-item">
    <span className="material-symbols-outlined">bar_chart</span>
    <span className="nav-label">Insights</span>
  </a>
  {/* More items */}
</nav>
```

**Guidelines**:
- Maximum 5 items
- Touch target: 44×44px minimum
- Icon + label (not just icon)
- Active state with purple accent

---

## ✅ Component Checklist

When creating a new component:

- [ ] Determine: Expressive or Technical?
- [ ] Apply correct border-radius (12px vs 4px)
- [ ] Use appropriate shadow (colored vs none)
- [ ] Choose typography (serif italic vs sans normal)
- [ ] Verify touch target size (≥44×44px for mobile)
- [ ] Check color contrast (WCAG AA minimum)
- [ ] Test with real data (not just "Lorem ipsum")
- [ ] Verify responsive behavior on mobile

---

## 🚫 Common Mistakes

1. **Using yellow (#EFFF74) for multiple elements**
   - ❌ Wrong: 5 yellow buttons
   - ✅ Right: 1 yellow FAB, rest purple

2. **Mixing border-radius styles**
   - ❌ Wrong: Data card with 12px radius
   - ✅ Right: Data card with 4px radius

3. **Adding shadows to technical components**
   - ❌ Wrong: KPI card with shadow
   - ✅ Right: KPI card with flat border

4. **Using italic for data/numbers**
   - ❌ Wrong: "1,234" in DM Serif italic
   - ✅ Right: "1,234" in DM Sans normal

5. **UPPERCASE for emotional titles**
   - ❌ Wrong: "BUONGIORNO, MARCO"
   - ✅ Right: "Buongiorno, Marco" (title case, italic)

---

## 📖 Code Examples Repository

Full implementation examples in:
- `dashboard/src/pages/InsightsPage.tsx` - Full technical page
- `dashboard/src/pages/LoyaltyHubPage.tsx` - Hybrid page
- `dashboard/src/components/KPICard.tsx` - Technical component
- `dashboard/src/components/Header.tsx` - Expressive typography

---

**Questions?** Check [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for token reference or [README.md](./README.md) for overview.
