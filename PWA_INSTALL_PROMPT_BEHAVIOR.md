# PWA Install Prompt Behavior

## Purpose

This document describes how the dashboard PWA install prompt works, where it is rendered, how it is dismissed, when it reappears, and how to test it safely in local development and preview environments.

## Main Files

Core implementation:

- [dashboard/src/components/PWAInstallPrompt.tsx](/Users/eliobencini/loyalty-platform/loyalty-platform/dashboard/src/components/PWAInstallPrompt.tsx)
- [dashboard/src/hooks/usePWAInstall.ts](/Users/eliobencini/loyalty-platform/loyalty-platform/dashboard/src/hooks/usePWAInstall.ts)

Rendering contexts:

- [dashboard/src/pages/LoyaltyHubPage.tsx](/Users/eliobencini/loyalty-platform/loyalty-platform/dashboard/src/pages/LoyaltyHubPage.tsx)
- [dashboard/src/pages/MenuPage.tsx](/Users/eliobencini/loyalty-platform/loyalty-platform/dashboard/src/pages/MenuPage.tsx)

Visual styling:

- [dashboard/src/index.css](/Users/eliobencini/loyalty-platform/loyalty-platform/dashboard/src/index.css)

## Rendering Model

The install prompt is not global anymore.

It is rendered explicitly in two places:

1. Home dashboard (`Today`)

- `LoyaltyHubPage`
- Uses `mode="home"`

2. Menu page

- `MenuPage`
- Uses `mode="menu"`

This is intentional.

The prompt was moved out of the global mobile layout because rendering it between the fixed header and the main content caused clipping and poor mobile composition.

## Hook-Level Installability Logic

Installability detection lives in [dashboard/src/hooks/usePWAInstall.ts](/Users/eliobencini/loyalty-platform/loyalty-platform/dashboard/src/hooks/usePWAInstall.ts).

The hook exposes:

- `isInstallable`
- `isInstalled`
- `install()`

### `isInstalled`

The app is considered already installed if either of these is true:

- `window.matchMedia('(display-mode: standalone)').matches`
- `window.navigator.standalone === true` on iOS

If installed, the prompt is not shown.

### `isInstallable`

On non-iOS browsers, the prompt depends on the browser firing `beforeinstallprompt`.

If the event never fires:

- `isInstallable` remains `false`
- the banner stays hidden unless debug mode is enabled

### `install()`

On supported browsers, `install()` calls the deferred browser install prompt and waits for the result.

If accepted:

- the prompt is treated as permanently dismissed

## Display Modes

The component supports two explicit modes:

- `home`
- `menu`

The behavior differs by mode.

## Home Mode

Used in:

- [dashboard/src/pages/LoyaltyHubPage.tsx](/Users/eliobencini/loyalty-platform/loyalty-platform/dashboard/src/pages/LoyaltyHubPage.tsx)

### Rules

The prompt is shown only if:

- the app is not installed
- it has not been permanently dismissed after a successful install
- it is not currently in cooldown after a dismiss
- it has not exceeded the max allowed dismiss count
- on non-iOS:
  - either `beforeinstallprompt` has fired
  - or debug forcing is enabled

### Dismiss Behavior

When dismissed in `home` mode:

- store current timestamp in `localStorage`
- increment a dismiss counter in `localStorage`

Cooldown:

- 3 days

Display limit:

- after the initial display, it may reappear only 2 more times
- after the 3rd total dismiss in home mode, it stops reappearing

### Home Storage Keys

- `pwa_home_dismissed_at`
- `pwa_home_dismiss_count`

## Menu Mode

Used in:

- [dashboard/src/pages/MenuPage.tsx](/Users/eliobencini/loyalty-platform/loyalty-platform/dashboard/src/pages/MenuPage.tsx)

### Rules

The prompt is shown only if:

- the app is not installed
- it has not been permanently dismissed after a successful install
- it has not been dismissed in the current browser session
- on non-iOS:
  - either `beforeinstallprompt` has fired
  - or debug forcing is enabled

### Dismiss Behavior

When dismissed in `menu` mode:

- it is hidden only for the current tab/session
- it does not use the 3-day cooldown
- it does not use the home dismiss counter

### Menu Storage Key

- `sessionStorage['pwa_menu_dismissed']`

## Permanent Dismiss

If install succeeds, the prompt is permanently hidden.

Storage key:

- `pwa_permanently_dismissed`

This applies across both `home` and `menu`.

## Debug Forcing

The prompt supports a debug bypass for visual testing.

This is useful because `beforeinstallprompt` is browser-controlled and often hard to trigger on demand.

### Debug Activation Methods

1. Query string:

```txt
?debugPwaPrompt=1
```

2. Local storage:

```js
localStorage.setItem('debug_pwa_prompt', 'true')
```

### Debug Deactivation

```js
localStorage.removeItem('debug_pwa_prompt')
```

### Important Note

Debug mode only forces the banner to appear.

It does not guarantee that clicking `Install` will open the native install prompt.

If the browser has not actually fired `beforeinstallprompt`, the UI is visible for testing but the native install action may still be unavailable.

## iOS Behavior

iOS Safari does not rely on `beforeinstallprompt`.

Instead:

- the banner can still be shown if other visibility constraints pass
- the content becomes instructional:
  - “Tap Share icon, then Add to Home Screen”

This is handled directly inside [dashboard/src/components/PWAInstallPrompt.tsx](/Users/eliobencini/loyalty-platform/loyalty-platform/dashboard/src/components/PWAInstallPrompt.tsx).

## Visual Behavior

The prompt is styled as a lightweight in-flow utility card rather than a global floating system element.

Design goals:

- keep it inside the content flow
- avoid collision with fixed header and bottom navigation
- keep CTA secondary to the main page content
- support narrow mobile widths without clipping

Styling lives in:

- [dashboard/src/index.css](/Users/eliobencini/loyalty-platform/loyalty-platform/dashboard/src/index.css)

## Manual Testing Guide

### Local Dashboard URL

Use:

```txt
http://127.0.0.1:4173/dashboard/
```

For debug forcing:

```txt
http://127.0.0.1:4173/dashboard/?debugPwaPrompt=1
```

Important:

- use the trailing slash after `/dashboard/`
- `/dashboard` without trailing slash may 404 in local preview

### Reset Home Prompt State

```js
localStorage.removeItem('pwa_home_dismissed_at')
localStorage.removeItem('pwa_home_dismiss_count')
localStorage.removeItem('pwa_permanently_dismissed')
```

### Reset Menu Prompt State

```js
sessionStorage.removeItem('pwa_menu_dismissed')
```

### Reset Debug State

```js
localStorage.removeItem('debug_pwa_prompt')
```

### Full Reset

```js
localStorage.removeItem('pwa_home_dismissed_at')
localStorage.removeItem('pwa_home_dismiss_count')
localStorage.removeItem('pwa_permanently_dismissed')
localStorage.removeItem('debug_pwa_prompt')
sessionStorage.removeItem('pwa_menu_dismissed')
location.reload()
```

## Known Limitations

1. The browser fully controls `beforeinstallprompt`.

- The app cannot guarantee when that event fires.

2. Debug mode only forces visibility, not native browser install support.

3. If viewport/layout bugs exist in surrounding pages, the prompt can still look wrong even if its own logic is correct.

4. Disabling zoom does not solve prompt layout problems; responsive behavior must still be correct at component level.

## Summary

The install prompt is intentionally contextual:

- `home`: persistent, cooldown-based, limited reappearance
- `menu`: temporary, session-based

This avoids the previous problems of:

- global clipping under the fixed header
- noisy repeated reappearance
- fragile mount-count-based “session” logic
