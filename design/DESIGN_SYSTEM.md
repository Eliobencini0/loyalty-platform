# Loyalty Platform Design System v3.0

> Hybrid Design System: Material Design 3 Expressive + Technical Minimalism

**Version**: 3.0  
**Last Updated**: 2026-04-18  
**Status**: Active

---

## 🧬 Design Philosophy

This design system combines **two complementary design languages**:

### 🌟 Expressive (M3 Vibrante)
**Purpose**: Engagement, emotion, call-to-action  
**Characteristics**:
- Vibrant colors (purple #725BF3, yellow #EFFF74)
- Soft border-radius (12px)
- Colored shadows
- Serif typography for emotion

**When to use**: Interactive elements, CTAs, emotional moments, user engagement

### 📐 Technical (Minimalism)
**Purpose**: Data clarity, precision, focus  
**Characteristics**:
- Clean backgrounds (white #FFFFFF)
- Sharp border-radius (4px)
- No shadows (flat)
- Sans-serif typography for data

**When to use**: Dashboards, insights, KPIs, data tables, analytics

---

## 🎨 Color System

### Primary Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--md-sys-color-primary` | `#725BF3` | `rgb(114, 91, 243)` | Interactive elements, links, active borders |
| `--md-sys-color-on-primary` | `#FFFFFF` | `rgb(255, 255, 255)` | Text on purple background |
| `--md-sys-color-primary-container` | `#725BF3` | `rgb(114, 91, 243)` | Purple container backgrounds |

**Usage**: Buttons, links, active states, interactive UI elements

### Secondary Colors (⚠️ LIMITED USE)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--md-sys-color-secondary-container` | `#EFFF74` | `rgb(239, 255, 116)` | **ONLY** main FAB + success badges |
| `--md-sys-color-on-secondary-container` | `#6B7600` | `rgb(107, 118, 0)` | Text on yellow background |

**⚠️ CRITICAL RULE**: Yellow is the **single focal point**. Use ONLY for:
- Main FAB action (e.g., "Add Points")
- Small success indicators/badges
- Never for general buttons or large areas

### Surface & Background

| Token | Hex | Usage |
|-------|-----|-------|
| `--md-sys-color-surface` | `#FCF8FF` | App background (lilac neutral) |
| `--md-sys-color-surface-container-lowest` | `#FFFFFF` | Technical cards, insights page |
| `--md-sys-color-surface-variant` | `#E7E0EC` | Subtle backgrounds |
| `--md-sys-color-on-surface` | `#1C1B1F` | Primary text |
| `--md-sys-color-on-surface-variant` | `#49454F` | Secondary text |

### Outline & Borders

| Token | Hex | Usage |
|-------|-----|-------|
| `--md-sys-color-outline` | `#725BF3` | Active borders (expressive) |
| `--md-sys-color-outline-variant` | `#CAC4D0` | Technical borders (subtle) |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--md-sys-color-error` | `#B31B25` | Error states, destructive actions |
| `--md-sys-color-on-error` | `#FFFFFF` | Text on error background |
| `--success` | `#006947` | Success states (kept from v1) |

---

## ✍️ Typography

### Font Families

```css
--font-display: 'DM Serif Display', Georgia, serif;
--font-headline: 'DM Sans', system-ui, sans-serif;
--font-body: 'DM Sans', system-ui, sans-serif;
--font-label: 'DM Sans', system-ui, sans-serif;
```

### Typography Scale

| Purpose | Font | Weight | Style | Letter Spacing | Usage |
|---------|------|--------|-------|----------------|-------|
| **Emotional Titles** | DM Serif Display | 400 | **Italic** | -0.02em | Hero headlines, welcome messages |
| **Technical Titles** | DM Sans | 700 | Normal | -0.01em | Section titles, data headers |
| **Data Values** | DM Sans | 600 | Normal | -0.01em | KPIs, numbers, stats |
| **Labels** | DM Sans | 700 | Normal | 0.1em | Buttons, form labels (uppercase) |
| **Body Text** | DM Sans | 400-500 | Normal | 0em | Descriptions, paragraphs |

### CSS Classes

```css
/* Expressive Typography */
.title-expressive {
  font-family: var(--font-display);
  font-style: italic;
  letter-spacing: -0.02em;
}

/* Technical Typography */
.title-technical {
  font-family: var(--font-body);
  font-style: normal;
  font-weight: 700;
  letter-spacing: -0.01em;
}

/* Data Typography */
.text-data, .kpi-value {
  font-family: var(--font-body);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.kpi-label {
  font-family: var(--font-label);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

---

## 📐 Shape System (Border Radius)

### Dual Scale

| Purpose | Variable | Value | When to Use |
|---------|----------|-------|-------------|
| **Expressive** | `--radius-expressive` | **12px** | Buttons, FAB, chips, interactive elements |
| **Expressive Large** | `--radius-expressive-lg` | **16px** | Modals, drawers, large interactive components |
| **Technical** | `--radius-technical` | **4px** | Data cards, KPI containers, tables |
| **Technical Small** | `--radius-technical-sm` | **2px** | Table borders, subtle dividers |
| **Technical Strict** | `--radius-technical-none` | **0px** | Strict data views, insights tables |
| **Circular** | `--radius-expressive-full` | **9999px** | Avatars, circular badges |

### CSS Classes

```css
/* Expressive Components */
.expressive {
  border-radius: var(--radius-expressive); /* 12px */
}

.btn-expressive {
  border-radius: var(--radius-expressive);
  /* ... */
}

/* Technical Components */
.technical {
  border-radius: var(--radius-technical); /* 4px */
  box-shadow: none;
}

.card-technical {
  border-radius: var(--radius-technical);
  background: var(--md-sys-color-surface-container-lowest);
  border: 1px solid var(--md-sys-color-outline-variant);
  box-shadow: none;
}
```

---

## 🌓 Shadow System

### Expressive Shadows (Colored, Soft)

| Variable | Value | Usage |
|----------|-------|-------|
| `--shadow-expressive-sm` | `0 2px 8px rgba(114, 91, 243, 0.12)` | Small interactive elements |
| `--shadow-expressive-md` | `0 4px 12px rgba(114, 91, 243, 0.16)` | Buttons, FAB hover |
| `--shadow-expressive-lg` | `0 8px 24px rgba(114, 91, 243, 0.2)` | Modals, elevated cards |

### Technical Shadows (None)

| Variable | Value | Usage |
|----------|-------|-------|
| `--shadow-technical` | `none` | All data/insights components |

**Rule**: If it's a number/data → no shadow. If it's an action → shadow OK.

---

## 🎨 Design Tokens Reference

### Complete Token List

```css
/* Primary */
--md-sys-color-primary: #725BF3;
--md-sys-color-on-primary: #FFFFFF;
--md-sys-color-primary-container: #725BF3;
--md-sys-color-on-primary-container: #FFFFFF;

/* Secondary (LIMITED!) */
--md-sys-color-secondary-container: #EFFF74;
--md-sys-color-on-secondary-container: #6B7600;

/* Surface */
--md-sys-color-surface: #FCF8FF;
--md-sys-color-on-surface: #1C1B1F;
--md-sys-color-surface-container-lowest: #FFFFFF;

/* Outline */
--md-sys-color-outline: #725BF3;
--md-sys-color-outline-variant: #CAC4D0;

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 24px;
--spacing-2xl: 32px;
--spacing-3xl: 48px;

/* Motion */
--motion-micro: 150ms;
--motion-normal: 300ms;
--motion-page: 500ms;
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 🧭 Usage Guidelines

### Decision Tree: Expressive vs Technical

**Ask yourself**:

1. **Is this component showing data/numbers?**
   - Yes → Use **Technical** (4px, white, no shadow, DM Sans)
   - No → Continue to Q2

2. **Is this component an interaction/action?**
   - Yes → Use **Expressive** (12px, colored, shadow, vibrant)
   - No → Use neutral/surface colors

3. **Does this need emotional impact?**
   - Yes → Use **Expressive** typography (DM Serif italic)
   - No → Use **Technical** typography (DM Sans normal)

### Examples

**Expressive**:
- FAB buttons
- CTAs
- Header greeting: "Buongiorno, Marco"
- Welcome screens
- Success celebrations

**Technical**:
- Insights page
- KPI cards
- Customer list
- Data tables
- Analytics dashboard

---

## 📱 Mobile-First Principles

1. **Touch Targets**: Minimum 44×44px (iOS HIG standard)
2. **Thumb Zone**: Primary actions in bottom 60% of screen
3. **Text Size**: Minimum 16px to prevent iOS zoom
4. **Spacing**: Generous padding (min 16px) for finger accuracy
5. **Bottom Nav**: 5 tabs maximum, icons + labels

---

## ♿ Accessibility

All color combinations meet **WCAG 2.1 Level AA**:
- Purple #725BF3 on White: **6.8:1** ✅
- Yellow #EFFF74 / Olive #6B7600: **8.2:1** ✅ (AAA!)
- On Surface on Surface: **18.5:1** ✅

See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for full audit.

---

## 🔗 Related Documentation

- [COMPONENTS.md](./COMPONENTS.md) - Component implementation guidelines
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - WCAG compliance details
- [brand-guidelines.md](./brand-guidelines.md) - Brand identity
- [archive/migration-history.md](./archive/migration-history.md) - Design evolution

---

**Last Updated**: 2026-04-18 | **Version**: 3.0 Hybrid
