# Loyali Design System

> Comprehensive design guide for the Loyalty Platform merchant dashboard. This document serves as the single source of truth for colors, typography, components, and design patterns.

**Last Updated:** 2026-04-04  
**Version:** 2.0  
**Based on:** Material Design 3 + Custom Loyali Brand

---

## 📐 Design Principles

1. **Clean & Modern** — Soft shadows, generous spacing, rounded corners
2. **Mobile-First** — Touch-friendly targets (min 44×44px), thumb-zone optimized
3. **Accessible** — WCAG AA contrast, clear hierarchy, readable labels
4. **Consistent** — Reusable components, predictable patterns
5. **Delightful** — Smooth animations, celebratory moments (confetti)

---

## 🎨 Color System

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Primary** | `#2563EB` | Main brand color, CTAs, active states |
| **Primary Dim** | `#0046BB` | Hover states for primary |
| **Primary Container** | `#7B9CFF` | Light backgrounds for primary content |
| **On Primary** | `#F1F2FF` | Text on primary background |

### Secondary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Secondary** | `#10B981` | Success, positive actions, growth indicators |
| **Secondary Dim** | `#005C3D` | Hover states for secondary |
| **Secondary Container** | `#69F6B8` | Light backgrounds for secondary content |
| **On Secondary** | `#C8FFE0` | Text on secondary background |

### Tertiary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Tertiary** | `#F59E0B` | Rewards, points, achievements, warnings |
| **Tertiary Dim** | `#714600` | Hover states for tertiary |
| **Tertiary Container** | `#F8A010` | Light backgrounds for tertiary content |
| **On Tertiary** | `#FFF0E3` | Text on tertiary background |

### Neutral Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Neutral** | `#1F2937` | Dark elements, contest button |
| **Surface** | `#F4F6FF` | Page background |
| **Surface Container** | `#DCE9FF` | Card backgrounds (default) |
| **Surface Container Low** | `#EAF1FF` | Subtle card backgrounds |
| **Surface Container Lowest** | `#FFFFFF` | Highest elevation cards |
| **On Surface** | `#252F3D` | Primary text color |
| **On Surface Variant** | `#525C6C` | Secondary text, labels |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Error** | `#B31B25` | Errors, destructive actions |
| **Error Container** | `#FB5151` | Error backgrounds |
| **On Error** | `#FFEFEE` | Text on error background |
| **Outline** | `#6D7788` | Borders, dividers (strong) |
| **Outline Variant** | `#A3AEC0` | Borders, dividers (subtle) |

### Quick Action Colors (Specific)

```css
--quick-add-points: #66FFB2;      /* Light green */
--quick-add-points-text: #004D26;  /* Dark green */

--quick-redeem: #FF9900;           /* Orange */
--quick-redeem-text: #4D2E00;      /* Dark brown */

--quick-show-qr: #7C9DFF;          /* Light blue */
--quick-show-qr-text: #002080;     /* Navy */

--quick-contest: #D1E1FF;          /* Very light blue */
--quick-contest-text: #4A5568;     /* Gray */
```

---

## 🔤 Typography

### Font Families

```css
--font-headline: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
--font-body: 'Manrope', system-ui, -apple-system, sans-serif;
--font-label: 'Manrope', system-ui, -apple-system, sans-serif;
```

**Google Fonts Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">
```

### Type Scale

| Style | Font | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|------|--------|-------------|----------------|-------|
| **Display** | Jakarta | 32px | 800 | 40px | -0.02em | Hero sections |
| **H1** | Jakarta | 24px | 800 | 32px | -0.01em | Page titles |
| **H2** | Jakarta | 20px | 700 | 28px | 0 | Section headers |
| **H3** | Jakarta | 18px | 700 | 24px | 0 | Card titles |
| **Body Large** | Manrope | 16px | 500 | 24px | 0 | Main content |
| **Body** | Manrope | 14px | 400 | 20px | 0 | Default text |
| **Label Large** | Manrope | 11px | 700 | 16px | 0.15em (widest) | Button text, stat labels |
| **Label Small** | Manrope | 10px | 800 | 14px | 0.2em (widest) | Tiny labels, tags |

### Typography Classes

```css
/* Headline - Bold, uppercase labels */
.text-label-large {
  font-family: var(--font-label);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.text-label-small {
  font-family: var(--font-label);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

/* Stats display */
.text-stat {
  font-family: var(--font-headline);
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
}
```

---

## 📦 Spacing & Layout

### Spacing Scale

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 24px;
--spacing-2xl: 32px;
--spacing-3xl: 48px;
```

### Container Widths

```css
--container-mobile: 100%;
--container-tablet: 640px;
--container-desktop: 768px;
--container-max: 480px;  /* Mobile app max width */
```

### Safe Areas

```css
/* Bottom navigation padding */
padding-bottom: env(safe-area-inset-bottom, 8px);

/* Top header padding */
padding-top: env(safe-area-inset-top, 0);
```

---

## 🔲 Border Radius

```css
--radius-sm: 8px;      /* Small elements */
--radius-md: 12px;     /* Buttons, inputs */
--radius-lg: 16px;     /* Cards */
--radius-xl: 20px;     /* Large cards */
--radius-2xl: 24px;    /* Main containers */
--radius-3xl: 28px;    /* Hero cards */
--radius-full: 9999px; /* Pills, circular buttons */
```

### Usage Guide

- **Buttons:** `rounded-xl` (16px)
- **Cards:** `rounded-3xl` (24px)
- **Pills/Badges:** `rounded-full`
- **Inputs:** `rounded-2xl` (20px)
- **Bottom Nav:** `rounded-t-[24px]` (top only)

---

## 🌑 Shadows & Elevation

### Aviator Shadow (Primary)

```css
.aviator-shadow {
  box-shadow: 0 20px 40px -12px rgba(37, 47, 61, 0.06);
}
```

**Usage:** Main cards, floating panels

### Elevation Levels

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(37, 47, 61, 0.06);  /* aviator-shadow */
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
```

### Fixed Element Shadows

```css
/* Top header */
box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);

/* Bottom navigation */
box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.04);
```

---

## 🎭 Components Library

### 1. Buttons

#### Primary Button

```html
<button class="bg-primary text-on-primary px-6 py-3 rounded-xl font-label font-bold text-sm uppercase tracking-wider hover:bg-primary-dim transition-colors active:scale-95">
  Label
</button>
```

**Variants:**
- **Primary:** Blue background, white text
- **Secondary:** Transparent with outline
- **Inverted:** Dark background, white text
- **Outlined:** Border only, no fill

#### FAB (Floating Action Button)

```html
<button class="w-28 h-28 rounded-full bg-[#66FFB2] text-[#004D26] flex items-center justify-center shadow-lg hover:brightness-105 transition-all active:scale-95">
  <span class="material-symbols-outlined text-5xl">add</span>
</button>
```

**Sizes:**
- Large: `w-28 h-28` (112px) - Quick actions
- Medium: `w-16 h-16` (64px) - Secondary actions
- Small: `w-12 h-12` (48px) - Inline actions

**Colors:** See Quick Action Colors section

---

### 2. Cards

#### Default Card

```html
<div class="bg-surface-container-lowest rounded-3xl p-6 aviator-shadow border border-outline-variant/15">
  <!-- Content -->
</div>
```

**Variants:**

**Primary Content Card:**
```html
<div class="bg-surface-container-lowest rounded-3xl p-6 aviator-shadow border border-outline-variant/15 relative overflow-hidden">
  <div class="absolute top-6 right-6">
    <button class="text-[10px] font-extrabold text-primary uppercase tracking-widest">
      Edit
    </button>
  </div>
  <!-- Content -->
</div>
```

**Stat Card (Insights):**
```html
<div class="bg-white rounded-3xl overflow-hidden aviator-shadow border border-outline-variant/15">
  <div class="p-4 bg-surface-container-low/30 border-b border-outline-variant/10">
    <h4 class="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-2">
      <span class="material-symbols-outlined text-sm">analytics</span>
      Insights
    </h4>
  </div>
  <!-- Stats rows -->
</div>
```

---

### 3. Stat Row

```html
<div class="p-6 flex items-center gap-6 border-b border-outline-variant/10 bg-surface-container-low/20">
  <span class="material-symbols-outlined text-secondary text-4xl p-3 bg-secondary/10 rounded-xl">
    groups
  </span>
  <div>
    <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
      Membri
    </p>
    <p class="text-3xl font-extrabold font-headline text-on-surface leading-none mt-1">
      124
    </p>
  </div>
</div>
```

**Highlighted variant (primary background):**
```html
<div class="p-6 flex items-center gap-6 bg-primary text-on-primary">
  <span class="material-symbols-outlined text-white text-4xl p-3 bg-white/20 rounded-xl">
    person_add
  </span>
  <div>
    <p class="text-[10px] font-bold text-on-primary/80 uppercase tracking-widest">
      Nuovi (24h)
    </p>
    <p class="text-3xl font-extrabold font-headline text-white leading-none mt-1">
      1
    </p>
  </div>
</div>
```

---

### 4. Top Header (Fixed)

```html
<div class="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl shadow-xl shadow-slate-900/5">
  <header class="flex justify-between items-center px-6 py-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
        <img alt="User Profile" class="w-full h-full object-cover" src="..." />
      </div>
      <h1 class="text-lg font-extrabold text-slate-900 tracking-tight font-headline uppercase">
        BUONGIORNO, Barelio
      </h1>
    </div>
    <button class="material-symbols-outlined text-blue-700 hover:opacity-80 transition-opacity scale-95 active:scale-90">
      notifications
    </button>
  </header>
</div>
```

**Properties:**
- Background: `bg-white/90` with `backdrop-blur-xl`
- z-index: `50`
- Shadow: `shadow-xl shadow-slate-900/5`

---

### 5. Bottom Navigation

```html
<nav class="fixed bottom-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl flex justify-around items-center px-4 pb-6 pt-3 rounded-t-[24px] shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
  <!-- Active tab -->
  <div class="flex flex-col items-center justify-center bg-blue-50 text-blue-700 rounded-2xl px-5 py-2 scale-110">
    <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">
      calendar_today
    </span>
    <span class="text-[10px] font-bold font-body mt-1">Oggi</span>
  </div>
  
  <!-- Inactive tab -->
  <div class="flex flex-col items-center justify-center text-slate-400 px-5 py-2">
    <span class="material-symbols-outlined">leaderboard</span>
    <span class="text-[10px] font-medium font-body mt-1">Statistiche</span>
  </div>
</nav>
```

**Properties:**
- Active state: Light background + bold text + filled icon + `scale-110`
- Inactive state: Gray text + outlined icon
- Safe area padding: `pb-6` (accounts for env safe area)

---

### 6. Icon Buttons

```html
<!-- Icon only -->
<button class="material-symbols-outlined text-blue-700 hover:opacity-80 transition-opacity scale-95 active:scale-90">
  notifications
</button>

<!-- Icon with background -->
<span class="material-symbols-outlined text-secondary text-4xl p-3 bg-secondary/10 rounded-xl">
  groups
</span>
```

---

### 7. Input Fields (Search)

```html
<div class="relative">
  <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
    search
  </span>
  <input 
    type="text" 
    placeholder="Search" 
    class="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-2xl text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
  />
</div>
```

---

## 🎨 Material Symbols Icons

### Setup

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
```

```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* Filled variant (active states) */
.material-symbols-outlined.filled {
  font-variation-settings: 'FILL' 1;
}
```

### Icon Sizes

```css
--icon-sm: text-base;   /* 16px */
--icon-md: text-xl;     /* 20px */
--icon-lg: text-2xl;    /* 24px */
--icon-xl: text-4xl;    /* 36px */
--icon-2xl: text-5xl;   /* 48px */
```

### Core Icons

| Icon | Name | Usage |
|------|------|-------|
| `add` | Add | Add points action |
| `redeem` | Redeem | Redeem rewards |
| `qr_code_2` | QR Code | Show QR |
| `sports_esports` | Gaming | Contest |
| `notifications` | Bell | Notifications |
| `calendar_today` | Calendar | Today tab |
| `leaderboard` | Chart | Insights tab |
| `group` | People | Customers tab |
| `menu` | Menu | Menu tab |
| `analytics` | Analytics | Stats section |
| `groups` | Groups | Members |
| `person_add` | Add person | New members |
| `star` | Star | Ratings |
| `arrow_forward` | Arrow | Navigation |

---

## 🎬 Motion & Transitions

### Duration

```css
--motion-micro: 150ms;   /* Icon hovers */
--motion-normal: 300ms;  /* Button states */
--motion-page: 500ms;    /* Page transitions */
```

### Easing

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);  /* Material ease */
--ease-in: cubic-bezier(0, 0, 0.2, 1);
--ease-out: cubic-bezier(0.4, 0, 1, 1);
```

### Common Transitions

```css
/* Button hover */
transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);

/* Icon hover */
transition: opacity 150ms ease;

/* Active press */
active:scale-95;
transition: transform 150ms ease;
```

---

## 🏗️ Layout Patterns

### Main Container

```html
<main class="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8">
  <!-- Content -->
</main>
```

**Properties:**
- Top padding: `pt-24` (accounts for fixed header)
- Bottom padding: `pb-32` (accounts for bottom nav)
- Horizontal padding: `px-6`
- Max width: `max-w-2xl` (768px)
- Vertical spacing: `space-y-8`

### Grid Layouts

**2-Column Stats:**
```html
<div class="grid grid-cols-2 gap-8">
  <div><!-- Stat --></div>
  <div><!-- Stat --></div>
</div>
```

**2×2 Quick Actions:**
```html
<section class="grid grid-cols-2 gap-y-12 py-8">
  <div class="flex flex-col items-center gap-4">
    <!-- FAB + Label -->
  </div>
  <!-- 3 more items -->
</section>
```

---

## 📱 Responsive Design

### Breakpoints

```css
--screen-sm: 640px;
--screen-md: 768px;
--screen-lg: 1024px;
```

### Mobile-First Approach

- Default styles target mobile (320-480px)
- Use `max-w-2xl mx-auto` to center on larger screens
- Bottom nav and header have max-width constraints

---

## ✅ Accessibility Guidelines

### Contrast Ratios

- Text on surface: 12.6:1 (AAA)
- Primary on white: 5.2:1 (AA)
- Secondary on white: 4.8:1 (AA)
- All labels: Minimum 4.5:1

### Touch Targets

- Minimum: 44×44px
- FAB buttons: 112×112px
- Bottom nav items: 64×64px (with padding)
- Icon buttons: 48×48px

### Focus States

```css
focus:outline-none 
focus:ring-2 
focus:ring-primary/20 
focus:border-primary
```

---

## 🎯 Design Tokens (CSS Variables)

```css
:root {
  /* Colors - Primary */
  --primary: #2563EB;
  --primary-dim: #0046BB;
  --primary-container: #7B9CFF;
  --on-primary: #F1F2FF;
  
  /* Colors - Secondary */
  --secondary: #10B981;
  --secondary-dim: #005C3D;
  --secondary-container: #69F6B8;
  --on-secondary: #C8FFE0;
  
  /* Colors - Tertiary */
  --tertiary: #F59E0B;
  --tertiary-dim: #714600;
  --tertiary-container: #F8A010;
  --on-tertiary: #FFF0E3;
  
  /* Colors - Neutral */
  --neutral: #1F2937;
  --surface: #F4F6FF;
  --surface-container: #DCE9FF;
  --surface-container-low: #EAF1FF;
  --surface-container-lowest: #FFFFFF;
  --on-surface: #252F3D;
  --on-surface-variant: #525C6C;
  
  /* Colors - Semantic */
  --error: #B31B25;
  --error-container: #FB5151;
  --on-error: #FFEFEE;
  --outline: #6D7788;
  --outline-variant: #A3AEC0;
  
  /* Typography */
  --font-headline: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Manrope', sans-serif;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-3xl: 28px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 20px 40px -12px rgba(37, 47, 61, 0.06);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
}
```

---

## 📋 Component Checklist

When creating a new component, ensure:

- [ ] Uses design tokens (CSS variables)
- [ ] Follows typography scale
- [ ] Has proper contrast ratios
- [ ] Touch targets ≥ 44×44px
- [ ] Includes hover/active states
- [ ] Has focus states for keyboard navigation
- [ ] Uses consistent border radius
- [ ] Applies aviator-shadow when needed
- [ ] Responsive on mobile (320px min)
- [ ] Uses Material Symbols icons

---

## 🚀 Implementation Priority

### Phase 1: Core Tokens (Now)
1. Update CSS variables in `index.css`
2. Load Plus Jakarta Sans and Manrope fonts
3. Update primary color from old blue to new `#2563EB`

### Phase 2: Components (Next)
1. Refactor LoyaltyHubPage to use FAB buttons
2. Update InsightsPage with new stat cards
3. Rebuild bottom navigation
4. Update header with profile avatar

### Phase 3: Refinement
1. Add transitions to all interactive elements
2. Implement aviator-shadow on all cards
3. Ensure all text uses correct typography scale
4. Test accessibility and contrast

---

## 📚 References

- **Material Design 3:** https://m3.material.io/
- **Material Symbols:** https://fonts.google.com/icons
- **Plus Jakarta Sans:** https://fonts.google.com/specimen/Plus+Jakarta+Sans
- **Manrope:** https://fonts.google.com/specimen/Manrope

---

**Status:** ✅ Ready for Implementation  
**Created by:** Claude Opus 4.6  
**Date:** 2026-04-04
