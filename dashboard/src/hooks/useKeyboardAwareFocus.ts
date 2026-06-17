import { useEffect } from 'react';

/**
 * Mount once at the app root. When an input/textarea/select gains focus,
 * scrolls it into view above the virtual keyboard.
 *
 * Strategy:
 *  - VisualViewport API (mobile Safari + Chrome): listens for resize events
 *    triggered by the keyboard and re-scrolls the focused element into view.
 *  - Fallback for browsers without VisualViewport: a single `scrollIntoView`
 *    on focus, with a small timeout to let the keyboard finish appearing.
 *
 * The viewport meta `interactive-widget=resizes-content` is the other half
 * of the fix (declared in index.html); without it the layout viewport
 * doesn't shrink when the keyboard appears.
 */
export function useKeyboardAwareFocus() {
  useEffect(() => {
    const SELECTOR = 'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]),textarea,select,[contenteditable="true"]';

    let scheduled = 0;
    const scrollFocusedIntoView = () => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || !el.matches?.(SELECTOR)) return;
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    };

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.matches?.(SELECTOR)) return;
      // Wait for the keyboard to start appearing.
      window.clearTimeout(scheduled);
      scheduled = window.setTimeout(scrollFocusedIntoView, 250);
    };

    const onViewportResize = () => {
      // Re-trigger when the visual viewport changes (keyboard show/hide).
      window.clearTimeout(scheduled);
      scheduled = window.setTimeout(scrollFocusedIntoView, 50);
    };

    document.addEventListener('focusin', onFocusIn);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', onViewportResize);

    return () => {
      document.removeEventListener('focusin', onFocusIn);
      vv?.removeEventListener('resize', onViewportResize);
      window.clearTimeout(scheduled);
    };
  }, []);
}
