# 🎨 Loyalty Platform Design System

> Single source of truth for the Loyalty Platform visual design, components, and brand identity.

**Version**: 3.0 (Hybrid Design System)  
**Last Updated**: 2026-04-18  
**Philosophy**: Material Design 3 Expressive + Technical Minimalism

---

## 📚 Documentation Structure

### Core Design Files

| File | Description | For Who |
|------|-------------|---------|
| **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** | Complete design system (colors, typography, shapes, components) | Developers, Designers |
| **[COMPONENTS.md](./COMPONENTS.md)** | Component guidelines & usage examples | Developers |
| **[ACCESSIBILITY.md](./ACCESSIBILITY.md)** | WCAG compliance, contrast ratios, accessibility guidelines | QA, Developers |
| **[brand-guidelines.md](./brand-guidelines.md)** | Brand identity, logo usage, tone of voice | Marketing, Design |

### Archive (Historical)

| File | Description |
|------|-------------|
| **[archive/migration-history.md](./archive/migration-history.md)** | Migration from custom design → M3 → Hybrid |
| **[archive/implementation-log.md](./archive/implementation-log.md)** | Technical log of hybrid implementation |
| **[archive/old-design-system-v1.md](./archive/old-design-system-v1.md)** | Original design system (blue/green) |

---

## 🎯 Quick Start

### For Designers
1. Read [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Understand the hybrid philosophy
2. Review [COMPONENTS.md](./COMPONENTS.md) - Learn component patterns
3. Check [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Ensure WCAG compliance

### For Developers
1. Use CSS variables from `dashboard/src/index.css`
2. Apply utility classes: `.expressive`, `.technical`, `.card-technical`, etc.
3. Reference [COMPONENTS.md](./COMPONENTS.md) for implementation examples

### For Stakeholders
1. Read [brand-guidelines.md](./brand-guidelines.md) - Brand identity
2. Review color palette in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
3. Understand the dual design philosophy (Expressive + Technical)

---

## 🧬 Design Philosophy: Hybrid System

Our design system has **two complementary personalities**:

### 🌟 **EXPRESSIVE** (Emotional, Engaging)
- **Where**: UI interactions, CTAs, emotional moments
- **How**: Vibrant colors (#725BF3 purple, #EFFF74 yellow), 12px radius, soft shadows
- **Example**: FAB buttons, header greeting "Buongiorno, [Name]"

### 📐 **TECHNICAL** (Precise, Data-Focused)
- **Where**: Data displays, insights, dashboards, KPIs
- **How**: White backgrounds, 4px sharp radius, no shadows, technical typography
- **Example**: Insights page, KPI cards, customer data tables

**Why?** This creates visual hierarchy: data gets focus (clean), actions get attention (vibrant).

---

## 🎨 Color Palette (Quick Reference)

| Color | Hex | Usage |
|-------|-----|-------|
| **Primary (Purple)** | `#725BF3` | Interactive elements, links, borders |
| **Secondary Container (Yellow)** | `#EFFF74` | **ONLY** FAB main action + success badges |
| **On Secondary (Olive)** | `#6B7600` | Text on yellow |
| **Surface (Lilac)** | `#FCF8FF` | App background |
| **Surface Container (White)** | `#FFFFFF` | Technical cards, insights |
| **Outline Variant** | `#CAC4D0` | Technical borders |

⚠️ **CRITICAL**: Yellow (#EFFF74) is the **single focal point**. Use sparingly!

---

## ✍️ Typography

| Purpose | Font | Style | When |
|---------|------|-------|------|
| **Emotional Titles** | DM Serif Display | Italic | Hero headlines, greetings |
| **Data/Numbers** | DM Sans | Normal, Bold | KPIs, stats, tables |
| **UI Labels** | DM Sans | Bold, Uppercase | Buttons, labels |

---

## 📐 Shape System

| Component Type | Border Radius | Rationale |
|----------------|---------------|-----------|
| **Interactive** (buttons, FAB) | **12px** | Friendly, approachable |
| **Data** (KPI cards, tables) | **4px** | Sharp, technical, focused |
| **Hero** (main cards) | **20-48px** | Expressive, visual impact |

---

## ♿ Accessibility

All color combinations meet **WCAG 2.1 Level AA** minimum:
- Purple on White: 6.8:1 ✅
- Yellow/Olive: 8.2:1 ✅ (AAA!)
- Surface text: 18.5:1 ✅

See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for full audit.

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| **3.0** | 2026-04-18 | Hybrid Design System (Expressive + Technical) |
| **2.0** | 2026-04-17 | Material Design 3 implementation |
| **1.0** | 2026-04-04 | Original custom design (blue/green) |

---

## 📖 External Resources

- [Material Design 3](https://m3.material.io/) - Foundation principles
- [DM Fonts](https://fonts.google.com/specimen/DM+Sans) - Typography
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility

---

## 🤝 Contributing

When updating the design system:
1. Update the relevant markdown file
2. Increment version number if major change
3. Document in `archive/implementation-log.md` for significant updates
4. Ensure WCAG compliance (update [ACCESSIBILITY.md](./ACCESSIBILITY.md))

---

**Questions?** Check the specific documentation files above or review code examples in `dashboard/src/`.
