"use client";

import { useEffect, useInsertionEffect, useRef } from "react";

/**
 * Remembers the element focused when an overlay opens and refocuses it after the
 * overlay closes. The capture runs as an insertion effect so it sees the trigger
 * before React Aria's focus scope moves focus into the overlay. When the trigger
 * was re-rendered while the overlay was open, its id finds the replacement.
 */
export function useRestoreFocus(isOpen: boolean, delayMs = 0): void {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useInsertionEffect(() => {
    if (isOpen) {
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    const previousFocus = previousFocusRef.current;
    previousFocusRef.current = null;
    if (!previousFocus) return;
    const timeout = window.setTimeout(() => {
      if (previousFocus.isConnected) {
        previousFocus.focus();
        return;
      }
      if (previousFocus.id) {
        document.getElementById(previousFocus.id)?.focus();
      }
    }, delayMs);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [isOpen, delayMs]);
}
