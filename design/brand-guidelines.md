# Loyali Brand Guidelines

> The brand identity for the Loyali loyalty platform — modern, trustworthy, and approachable.

---

## 1. Brand Name & Tagline

- **Name:** Loyali
- **Tagline:** "Every visit counts."
- **Pronunciation:** loy-AH-lee
- **Tone:** Friendly, warm, reliable — like a neighborhood regular who remembers your name.

---

## 2. Logo & Wordmark

### Primary Logo

The Loyali logo combines a custom wordmark with a **stamp mark** — a rounded square containing a stylized "L" formed from two overlapping loyalty card punch-holes. This conveys the act of stamping a card while feeling contemporary.

**Construction:**
- Wordmark: Custom geometric sans-serif, soft terminals, moderate weight
- Stamp mark: 48px rounded square (8px radius), centered "L" glyph
- Clear space: Minimum 1x stamp-mark width on all sides

### Logo Variants

| Variant        | Usage                                 |
|----------------|---------------------------------------|
| Full lockup    | Primary — wordmark + stamp mark       |
| Stamp mark     | App icon, favicon, compact spaces     |
| Wordmark only  | Horizontal nav bars, email headers    |

### Logo Colors

| Context           | Logo Color    | Background    |
|-------------------|---------------|---------------|
| Default           | Indigo 600    | White         |
| Reversed          | White         | Indigo 600    |
| Monochrome        | Black / White | Any neutral   |

### Logo Don'ts
- Do not stretch, rotate, or skew the logo
- Do not change logo colors outside the approved palette
- Do not place the logo on busy photographic backgrounds without a container
- Minimum size: 24px height (stamp mark), 80px width (full lockup)

---

## 3. Color Palette

### Primary Colors

| Name          | Hex       | RGB             | Usage                              |
|---------------|-----------|-----------------|------------------------------------|
| Indigo 600    | `#4F46E5` | 79, 70, 229     | Primary brand, CTAs, active states |
| Indigo 700    | `#4338CA` | 67, 56, 202     | Hover/pressed states               |
| Indigo 50     | `#EEF2FF` | 238, 242, 255   | Light backgrounds, highlights      |

### Secondary Colors

| Name          | Hex       | RGB             | Usage                                |
|---------------|-----------|-----------------|--------------------------------------|
| Amber 500     | `#F59E0B` | 245, 158, 11    | Rewards, points, achievements        |
| Amber 50      | `#FFFBEB` | 255, 251, 235   | Reward highlights                    |
| Emerald 500   | `#10B981` | 16, 185, 129    | Success, check-in confirmations      |
| Rose 500      | `#F43F5E` | 244, 63, 94     | Alerts, urgent actions               |

### Neutral Palette

| Name          | Hex       | Usage                              |
|---------------|-----------|------------------------------------|
| Gray 900      | `#111827` | Headings, primary text             |
| Gray 700      | `#374151` | Body text                          |
| Gray 500      | `#6B7280` | Secondary text, placeholders       |
| Gray 200      | `#E5E7EB` | Borders, dividers                  |
| Gray 50       | `#F9FAFB` | Page backgrounds, cards            |
| White         | `#FFFFFF` | Card surfaces, inputs              |

### Accessibility

- All text meets WCAG 2.1 AA contrast ratios (4.5:1 normal text, 3:1 large text)
- Indigo 600 on White: 6.3:1 (passes AA and AAA for normal text)
- Gray 700 on White: 9.2:1 (passes AAA)
- Amber 500 on Gray 900: 7.8:1 (passes AA)

---

## 4. Typography

### Font Stack

| Role        | Family                          | Fallback                     |
|-------------|---------------------------------|------------------------------|
| Headings    | **Inter**                       | system-ui, sans-serif        |
| Body        | **Inter**                       | system-ui, sans-serif        |
| Monospace   | **JetBrains Mono**              | ui-monospace, monospace      |

> Inter is chosen for its excellent readability at small sizes, broad weight range, and free availability via Google Fonts.

### Type Scale

| Level  | Size   | Weight     | Line Height | Letter Spacing | Usage                    |
|--------|--------|------------|-------------|----------------|--------------------------|
| H1     | 32px   | 700 (Bold) | 40px        | -0.02em        | Page titles              |
| H2     | 24px   | 600 (Semi) | 32px        | -0.01em        | Section headers          |
| H3     | 20px   | 600 (Semi) | 28px        | 0              | Card titles, sub-headers |
| H4     | 16px   | 600 (Semi) | 24px        | 0              | Labels, table heads      |
| Body   | 16px   | 400 (Reg)  | 24px        | 0              | Default paragraph text   |
| Small  | 14px   | 400 (Reg)  | 20px        | 0              | Captions, helper text    |
| XSmall | 12px   | 500 (Med)  | 16px        | 0.02em         | Badges, timestamps       |

---

## 5. Spacing & Layout

### Spacing Scale (4px base)

| Token  | Value | Common usage                |
|--------|-------|-----------------------------|
| xs     | 4px   | Inline icon padding         |
| sm     | 8px   | Compact element gaps        |
| md     | 16px  | Default padding, card gaps  |
| lg     | 24px  | Section spacing             |
| xl     | 32px  | Page-level margins          |
| 2xl    | 48px  | Hero sections               |
| 3xl    | 64px  | Major section breaks        |

### Border Radius

| Token      | Value | Usage                          |
|------------|-------|--------------------------------|
| sm         | 4px   | Badges, tags                   |
| md         | 8px   | Cards, inputs, buttons         |
| lg         | 12px  | Modals, large cards            |
| xl         | 16px  | Bottom sheets, drawer panels   |
| full       | 9999px| Avatars, pills, dot indicators |

### Elevation (Shadows)

| Level | Value                                  | Usage                    |
|-------|----------------------------------------|--------------------------|
| sm    | `0 1px 2px rgba(0,0,0,0.05)`          | Cards, subtle lift       |
| md    | `0 4px 6px rgba(0,0,0,0.07)`          | Dropdowns, popovers      |
| lg    | `0 10px 15px rgba(0,0,0,0.10)`        | Modals, floating panels  |
| xl    | `0 20px 25px rgba(0,0,0,0.12)`        | Toast notifications      |

---

## 6. Icon System

### Style
- **Stroke-based** outline icons at 1.5px stroke width
- 24x24px default grid, 20x20px compact variant
- Rounded line caps and joins
- Consistent optical weight across the set

### Recommended Library
**Lucide Icons** — open source, consistent with our stroke-based style, tree-shakeable.

### Core Icon Set

| Icon             | Usage                              |
|------------------|------------------------------------|
| `stamp`          | Loyalty check-in / punch           |
| `gift`           | Rewards, redeemable items          |
| `qr-code`        | QR scan flows                      |
| `star`           | Points, ratings                    |
| `store`          | Merchant / venue                   |
| `credit-card`    | Loyalty card                       |
| `trophy`         | Achievements, milestones           |
| `bell`           | Notifications                      |
| `user`           | Customer profile                   |
| `settings`       | Preferences, configuration         |
| `chart-bar`      | Analytics, merchant dashboard      |
| `scan`           | Scan QR at point of sale           |
| `check-circle`   | Success confirmation               |
| `arrow-right`    | Navigation, progression            |

---

## 7. Visual Language & Illustration

### Style Principles
- **Flat with subtle depth** — single-color fills with light shadows, no heavy gradients
- **Geometric** — rounded shapes, simple forms, 4px grid alignment
- **Warm accents** — use Amber highlights to draw attention to reward/achievement moments
- **Human touch** — spot illustrations of people, venues, and food/drink where appropriate

### Illustration Palette
Use brand colors only. Primary illustrations use Indigo 600 as the dominant color with Amber 500 accents for emphasis. Neutral grays for supporting elements.

### Motion Principles
- **Duration:** 150ms micro-interactions, 300ms transitions, 500ms page-level animations
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` — smooth deceleration
- **Stamp animation:** A satisfying "press and release" bounce when a loyalty stamp is earned
- **Points counter:** Count-up animation when points are awarded

---

## 8. Voice & Tone

| Context              | Tone             | Example                                    |
|----------------------|------------------|--------------------------------------------|
| Onboarding           | Welcoming, clear | "Welcome to Loyali! Let's set up your first reward." |
| Reward earned        | Celebratory      | "Nice! You just earned 50 points."         |
| Check-in             | Quick, affirming  | "Stamp collected. 3 more to your reward!"  |
| Error                | Helpful, calm    | "Something went wrong. Let's try that again." |
| Merchant dashboard   | Professional     | "Your weekly summary is ready to review."  |

### Writing Rules
- Use active voice
- Lead with the benefit or outcome
- Keep sentences short (max 20 words for UI copy)
- Use "you" and "your" — speak directly to the user
- Avoid jargon — say "reward" not "redemption event"

---

## 9. Application Examples

### Customer Card (Mobile)
- White card surface with 8px radius, `sm` shadow
- Indigo 600 header bar with venue name in White
- Amber stamp dots in a grid (filled = earned, outlined = remaining)
- Points balance in H2 with Amber 500 accent
- QR code centered at bottom, 120x120px, Indigo 600 foreground

### Merchant Dashboard (Desktop)
- Gray 50 page background
- White sidebar with Indigo 600 active indicator
- Card-based layout for metrics (visits, active cards, redemptions)
- Charts use Indigo 600 primary, Amber 500 secondary, Gray 200 axes

### QR Scan Flow (Mobile)
- Full-screen camera viewfinder with rounded cutout
- Indigo 600 branded frame overlay
- Success state: Emerald 500 checkmark animation with stamp sound
- Points awarded toast: Amber 50 background, Amber 500 icon, Gray 900 text
