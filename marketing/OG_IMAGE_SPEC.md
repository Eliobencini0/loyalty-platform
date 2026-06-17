# Open Graph Image Specification

**Status:** ⚠️ REQUIRED - Referenced in meta tags but not yet created  
**Priority:** HIGH (blocks optimal social sharing)

---

## Specifications

### File Details
- **Filename:** `og-image.png`
- **Location:** `/marketing/public/og-image.png`
- **Dimensions:** 1200 x 630 pixels (Open Graph standard)
- **Format:** PNG or JPG (PNG recommended for text clarity)
- **File size:** < 1 MB (< 500 KB ideal)
- **Color mode:** RGB

### Safe Area
- **Minimum safe area:** 1200 x 600 pixels (avoid top/bottom 15px)
- **Text safe area:** 1100 x 580 pixels (centered)
- **Reason:** Some platforms crop or add borders

---

## Design Requirements

### Brand Elements (MUST INCLUDE)
1. **Loyali Logo**
   - Location: Top-left or centered
   - Size: Prominent but not overwhelming
   - Color: Brand purple (#7750e7) or white (on dark background)

2. **Primary Text**
   - Headline: "Digital Loyalty Cards for Apple & Google Wallet"
   - OR shorter: "Loyalty Cards for Apple & Google Wallet"
   - Font: Helvetica Neue Bold (or similar sans-serif)
   - Size: 48-60px
   - Color: High contrast (dark on light, or light on dark)

3. **Social Proof Stat** (choose one)
   - "85% Retention Rate" ⭐
   - "500+ Local Businesses" 🏪
   - "30k+ Active Users" 👥
   - Font: Helvetica Neue Medium
   - Size: 32-40px

### Visual Elements (OPTIONAL BUT RECOMMENDED)
1. **Apple Wallet + Google Wallet Icons**
   - Placement: Bottom-right or integrated with text
   - Size: 60-80px each
   - Use official logos (respect brand guidelines)

2. **Background**
   - Option A: Beige (#f7f4ee) with purple accents
   - Option B: Purple gradient (#7750e7 → #b1a1ff)
   - Option C: White with purple elements
   - Avoid: Busy patterns (text must be legible)

3. **Mockup/Visual** (optional)
   - Smartphone showing loyalty card in wallet
   - QR code scan illustration
   - Keep it simple and clear at small sizes

---

## Design Options (Choose One)

### Option A: Minimal Text-Only
```
┌─────────────────────────────────────────────────┐
│                                                 │
│   Loyali                                       │
│                                                 │
│   Digital Loyalty Cards for                    │
│   Apple & Google Wallet                        │
│                                                 │
│   85% Retention Rate                           │
│                                                 │
│               [Apple Wallet] [Google Wallet]    │
└─────────────────────────────────────────────────┘
Background: Beige (#f7f4ee)
Text: Dark purple (#7750e7)
```

### Option B: Visual with Stats
```
┌─────────────────────────────────────────────────┐
│                                                 │
│   [Phone mockup      Loyali                   ]│
│   [showing wallet    ─────────                ]│
│   [loyalty card]     85% Retention            ]│
│                      500+ Businesses          ]│
│                      30k Users                ]│
│                                                 │
│   Digital Loyalty Cards for Apple & Google Wallet│
└─────────────────────────────────────────────────┘
Background: White or light beige
Accent: Purple highlights
```

### Option C: Bold Gradient
```
┌─────────────────────────────────────────────────┐
│  [Purple gradient background]                  │
│                                                 │
│  Loyali                                        │
│                                                 │
│  Turn Every Visit Into                         │
│  Repeat Business                               │
│                                                 │
│  85% Retention • 500+ Businesses               │
│  [Apple] [Google] Wallet Ready                 │
└─────────────────────────────────────────────────┘
Background: Purple gradient
Text: White
```

---

## Creation Tools

### Option 1: Figma (Recommended)
1. Create 1200x630px frame
2. Use Loyali brand colors and fonts
3. Export as PNG (2x for retina)
4. Optimize with TinyPNG

### Option 2: Canva
1. Use "Facebook Post" template (resize to 1200x630px)
2. Upload Loyali logo
3. Add text and stats
4. Download as PNG

### Option 3: Photoshop/Sketch
1. New file: 1200x630px, 72 DPI, RGB
2. Design with brand elements
3. Export as PNG-24 or JPG (90% quality)

### Option 4: AI Generation
Use DALL-E or Midjourney with prompt:
```
Professional Open Graph image for SaaS platform, 1200x630px, 
purple brand color #7750e7, beige background #f7f4ee, 
text "Digital Loyalty Cards for Apple & Google Wallet", 
stat "85% Retention Rate", modern minimalist design, 
Helvetica font, high contrast, corporate style
```

---

## Brand Assets Needed

### Logos
- **Loyali logo:** Use SVG from `/marketing/public/favicon.svg`
- **Apple Wallet logo:** Download from Apple brand guidelines
- **Google Wallet logo:** Download from Google brand guidelines

### Fonts
- **Primary:** Helvetica Neue (Bold, Medium)
- **Fallback:** Arial, system-ui (if Helvetica unavailable)

### Colors
- **Primary purple:** #7750e7
- **Light purple:** #b1a1ff
- **Beige background:** #f7f4ee
- **Dark text:** #0c0c0d
- **White:** #ffffff

---

## Testing After Creation

1. **Place file in:**
   ```
   /marketing/public/og-image.png
   ```

2. **Build and deploy:**
   ```bash
   cd marketing
   npm run build
   # Verify file in out/og-image.png
   ```

3. **Test preview at:**
   - Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
   - Twitter Card Validator: https://cards-dev.twitter.com/validator
   - LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
   - Slack: Share URL and check preview

4. **Validate dimensions:**
   ```bash
   file public/og-image.png
   # Should show: 1200 x 630
   ```

---

## Examples of Good OG Images

Reference these for inspiration:
- **Stripe:** Bold text on gradient, minimal visual
- **Notion:** Product mockup + simple text
- **Linear:** Clean typography, single accent color
- **Vercel:** Minimalist, high contrast, logo + text only

**Key Takeaway:** Less is more. Prioritize legibility over complexity.

---

## Deliverables Checklist

- [ ] OG image created (1200x630px PNG)
- [ ] Saved to `/marketing/public/og-image.png`
- [ ] File size < 500 KB
- [ ] Tested in Facebook Sharing Debugger
- [ ] Tested in Twitter Card Validator
- [ ] Tested in LinkedIn Post Inspector
- [ ] Preview looks good on mobile and desktop
- [ ] Text is legible at small sizes (thumbnail)
- [ ] Brand colors and fonts used correctly

---

**Created:** 2026-04-22  
**For:** Loyali Marketing Website  
**By:** Claude Sonnet 4.5
