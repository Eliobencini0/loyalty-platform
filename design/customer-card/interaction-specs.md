# Customer Loyalty Card — Interaction Specs

> Animation, feedback, and interaction patterns for the customer-facing loyalty app. References `design-tokens.json` for motion values and `brand-guidelines.md` for tone.

---

## 1. Earn Points — Stamp Animation

Triggered when the cashier scans the customer's QR code and awards points.

### Flow

1. **Cashier scans QR** → Server sends push notification + in-app event
2. **Full-screen overlay** appears on the customer's phone (even if app is backgrounded, notification deep-links here)

### Earn Overlay (full-screen modal)

```
┌─────────────────────────────────────┐
│                                     │
│         (confetti particles)        │
│                                     │
│           ┌─────────┐              │
│           │         │              │
│           │  ✓ ★    │  (stamp      │
│           │         │   bounce)    │
│           └─────────┘              │
│                                     │
│        H1: "+50 points"            │
│                                     │
│        Body: "Nice! 3 more to      │
│        your free drink."           │
│                                     │
│        ┌───────────────────┐       │
│        │ 1,200 → 1,250    │       │
│        │ (count-up anim)   │       │
│        └───────────────────┘       │
│                                     │
│        [Dismiss]                   │
│                                     │
│    Auto-dismiss after 4 seconds    │
│                                     │
└─────────────────────────────────────┘
```

### Earn Animation Sequence

| Step | Time     | Animation                                                                |
|------|----------|--------------------------------------------------------------------------|
| 1    | 0ms      | Overlay fades in (`opacity: 0→1`, 200ms, `easing.enter`)               |
| 2    | 100ms    | Stamp icon scales in (`scale: 0.3→1.15→1.0`, 400ms spring bounce)      |
| 3    | 200ms    | Confetti particles burst from stamp center (20 particles, 800ms)        |
| 4    | 300ms    | Points text fades up (`translateY: 20→0`, `opacity: 0→1`, 300ms)       |
| 5    | 500ms    | Balance counter animates (`1,200→1,250`, 600ms count-up)                |
| 6    | 600ms    | Progress bar width animates to new value (400ms, `easing.default`)      |
| 7    | 700ms    | Context text fades in ("3 more to your free drink", 200ms)              |
| 8    | 4000ms   | Auto-dismiss: overlay fades out (300ms, `easing.exit`)                  |

### Haptic Feedback
- **Step 2 (stamp land):** `UIImpactFeedbackGenerator.medium` (iOS) / `HapticFeedbackConstants.CONFIRM` (Android)
- **Step 3 (confetti):** Light haptic pulse

### Sound (optional, respects device mute)
- Short "stamp press" sound effect (< 500ms, low-pitched thud + sparkle)

---

## 2. Redeem Points — Confirmation Flow

Triggered when the customer redeems points for a reward at the register.

### Flow

1. Customer taps **"Redeem Points"** on Card screen
2. **Reward selection bottom sheet** slides up
3. Customer selects a reward and confirms
4. **QR code with redemption token** is displayed for the cashier to scan
5. **Success overlay** confirms the redemption

### Step 2 — Reward Selection Bottom Sheet

```
┌─────────────────────────────────────┐
│  ─── (drag handle) ───             │
│                                     │
│  H3: "Redeem Points"              │
│  Body: "1,250 points available"    │
│                                     │
│  ┌──────────────────────────────────┐│
│  │ [gift] Free coffee      200 pts ││
│  │        Espresso, latte, or cap. ││
│  ├──────────────────────────────────┤│
│  │ [gift] Free pastry      350 pts ││
│  │        Any pastry from display  ││
│  ├──────────────────────────────────┤│
│  │ [gift] Free lunch       800 pts ││
│  │        Any plat du jour         ││
│  ├──────────────────────────────────┤│
│  │ [lock] VIP event       2,000 pts││
│  │        Not enough points        ││
│  └──────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

- Available rewards: normal tap target, `primary.600` icon
- Unavailable rewards: `gray.400` icon + text, `lock` icon, non-interactive

### Step 3 — Confirmation Dialog

```
┌─────────────────────────────────────┐
│                                     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │  H3: "Redeem for free coffee?" ││
│  │                                 ││
│  │  Body: "This will use 200 of   ││
│  │  your 1,250 points."           ││
│  │                                 ││
│  │  New balance: 1,050 pts        ││
│  │                                 ││
│  │  [Cancel]  [Confirm Redemption] ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Step 4 — Redemption QR Code

```
┌─────────────────────────────────────┐
│                                     │
│  H3: "Show to cashier"            │
│                                     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │     [QR Code 200x200]          ││
│  │     (encodes redemption token) ││
│  │                                 ││
│  │  Free Coffee · 200 pts         ││
│  │                                 ││
│  │  ┌───────────────────────────┐  ││
│  │  │ ████████████████░░░░░░░░ │  ││
│  │  │ Expires in 5:00           │  ││
│  │  └───────────────────────────┘  ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  [Cancel Redemption]               │
│                                     │
└─────────────────────────────────────┘
```

- 5-minute countdown timer bar (`amber.500`, animates width to 0)
- Auto-cancels if not scanned within time window
- Screen wake lock active

### Step 5 — Redemption Success Overlay

```
┌─────────────────────────────────────┐
│                                     │
│           ┌─────────┐              │
│           │  ✓      │  (scale-in   │
│           │         │   bounce)    │
│           └─────────┘              │
│                                     │
│      H1: "Enjoy your coffee!"      │
│                                     │
│      Body: "200 points redeemed"   │
│      New balance: 1,050 pts        │
│                                     │
│      [Done]                        │
│                                     │
└─────────────────────────────────────┘
```

### Redeem Animation Sequence

| Step | Time   | Animation                                                              |
|------|--------|------------------------------------------------------------------------|
| 1    | 0ms    | Overlay fades in (200ms)                                               |
| 2    | 100ms  | Check circle scales in (`scale: 0→1.1→1.0`, 350ms spring), `emerald.500` |
| 3    | 300ms  | Text fades up (300ms)                                                  |
| 4    | 500ms  | Balance counter animates down (`1,250→1,050`, 500ms count-down)        |

### Haptic Feedback
- **Confirm tap:** `UIImpactFeedbackGenerator.light`
- **Success (step 2):** `UINotificationFeedbackGenerator.success`

---

## 3. QR Code Scan Flow (Customer Perspective)

### When Customer Opens QR Tab

| Action                      | Behavior                                                          |
|-----------------------------|-------------------------------------------------------------------|
| Tab selected                | QR code renders immediately (generated client-side from card data) |
| Screen brightness           | Auto-increase to max while on this tab                           |
| Wake lock                   | `navigator.wakeLock.request('screen')` — prevent screen timeout  |
| Tab switch / background     | Release wake lock, restore brightness                            |

### QR Code Refresh

- QR codes include a rotating TOTP-like token (refreshes every 30 seconds)
- Subtle pulse animation on the QR border every refresh (200ms `primary.100` glow)
- No visible countdown — rotation is seamless

### Multi-Merchant QR Switching

```
Tap merchant selector →
  Bottom sheet slides up (300ms, easing.enter)
  List of merchants with card status
  Tap different merchant →
    Bottom sheet slides down (200ms, easing.exit)
    QR code crossfades to new card (200ms)
```

---

## 4. Card Screen Micro-Interactions

### Card Carousel (Multi-Card)

| Gesture        | Behavior                                                            |
|----------------|---------------------------------------------------------------------|
| Horizontal swipe | Snap-to-card with `scroll-snap-type: x mandatory`                 |
| Card transition  | Adjacent cards at `scale(0.92)`, active at `scale(1.0)`, 200ms   |
| Page dots       | Active dot: `primary.600` 8px, inactive: `gray.300` 6px           |
| Swipe velocity  | Natural deceleration, > 0.5 velocity snaps to next card           |

### Points Balance Update (Real-Time)

When points change while viewing the card screen:

1. Balance text briefly highlights (`amber.500` glow, 300ms)
2. Count animation from old → new value (400ms)
3. Progress bar animates to new position (300ms)

### Pull-to-Refresh

| Step | Animation                                                              |
|------|------------------------------------------------------------------------|
| Pull | Loyali stamp icon appears at top, rotates as user pulls                |
| Threshold | At 60px pull, stamp icon fills with `primary.600`                 |
| Release | Stamp icon bounces, spinner replaces it                             |
| Complete | Spinner fades, content refreshes with 200ms crossfade              |

### Card Flip (Easter Egg)

Long-press on the card → 3D flip animation (600ms, `perspective: 1000px`) reveals back of card with:
- Full card number
- QR code (small, 80x80px)
- Card issue date and expiry
- Merchant contact info

---

## 5. Transition Patterns

### Tab Switching

| From → To    | Transition                                                            |
|--------------|-----------------------------------------------------------------------|
| Any → Any    | Content crossfade, 200ms, `easing.default`                           |
| Tab bar      | Icon fills on active tab (stroke → filled variant), 150ms             |

### Screen Push (e.g., Card → Notifications)

| Element       | Animation                                                            |
|---------------|----------------------------------------------------------------------|
| New screen    | Slide in from right (`translateX: 100%→0`, 300ms, `easing.enter`)    |
| Previous screen | Slide left + dim (`translateX: 0→-30%`, `opacity: 1→0.5`, 300ms) |
| Back gesture  | Interactive swipe-to-go-back from left edge, `20px` hit area        |

### Bottom Sheet

| Action | Animation                                                              |
|--------|------------------------------------------------------------------------|
| Open   | Slide up from bottom (300ms, `easing.enter`), backdrop fade to `rgba(0,0,0,0.4)` |
| Close  | Slide down (200ms, `easing.exit`), backdrop fade out                   |
| Drag   | Follows finger, dismiss threshold at 40% sheet height                  |

---

## 6. Error & Edge Cases

### Network Error During Transaction

```
┌──────────────────────────────────────┐
│  [warning icon]                      │
│                                      │
│  H4: "Couldn't connect"             │
│  Body: "Check your connection and   │
│  try again."                        │
│                                      │
│  [Try Again]                        │
└──────────────────────────────────────┘
```

- Displayed as inline card replacing the affected content area
- Not a blocking modal — other tabs remain usable

### Card Expired

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────────┐│
│  │ (card visual, desaturated)      ││
│  │                                 ││
│  │  ⚠ Card Expired                ││
│  │  This card expired on Jan 2027  ││
│  │                                 ││
│  │  [Contact Café Bonheur →]      ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

- Card visual uses `grayscale(1) opacity(0.6)` filter
- Status badge: `rose.500` bg, white text

### Card Suspended

- Similar to expired but with `amber.500` badge
- Message: "Your card is temporarily suspended. Contact the merchant for help."

### Empty History

```
│  [Illustration: empty timeline]     │
│                                     │
│  H4: "No activity yet"             │
│  Body: "Your points history will   │
│  appear here after your first      │
│  visit."                           │
│                                     │
│  [Show My QR Code →]              │
```

---

## 7. Accessibility

| Feature                  | Implementation                                                  |
|--------------------------|-----------------------------------------------------------------|
| Screen reader            | All icons have `aria-label`, points values read as "1,250 points" |
| VoiceOver card carousel  | "Card 1 of 2, Café Bonheur, 1,250 points, Gold tier"          |
| Reduce Motion            | When `prefers-reduced-motion`, disable confetti, replace spring animations with simple fades, disable card flip |
| Dynamic Type (iOS)       | All text scales with system font size preference (1.0x–1.5x)  |
| Color-blind safe         | Transaction types use shape indicators (circle, diamond, star) in addition to color |
| Touch targets            | Minimum 44x44px for all interactive elements                    |
| Focus order              | Logical top-to-bottom, left-to-right within each screen        |

---

## 8. Push Notifications

| Event                    | Title                          | Body                                              |
|--------------------------|--------------------------------|----------------------------------------------------|
| Points earned            | "Nice! +{n} points"           | "You earned {n} points at {merchant}. Balance: {b}" |
| Points redeemed          | "Reward redeemed"             | "Enjoy your {reward} at {merchant}!"               |
| Reward available         | "You've got a reward!"        | "You have enough points for {reward} at {merchant}" |
| Card expiring soon       | "Card expiring soon"          | "Your {merchant} card expires in {n} days"         |
| Bonus points             | "Bonus! +{n} points"          | "{merchant} just gave you {n} bonus points!"       |

All notifications deep-link to the relevant screen (earn → card, redeem → card, expiring → card).
