"use client";

import type { RefObject } from "react";
import { useEffect } from "react";

function isVisible(element: HTMLElement): boolean {
  return typeof element.checkVisibility === "function" ? element.checkVisibility() : true;
}

/**
 * Opens a dialog once after mount when a link asked for it (F-25 D-5). The shell renders a page in
 * its desktop and phone layouts, so only the visible copy opens; it waits a frame for layout.
 * @param shouldOpen - the link asked for the dialog
 * @param screenRef - the screen's root element, to tell the visible copy apart
 * @param setOpen - the dialog's state setter (stable)
 */
export function useOpenOnLoad(
  shouldOpen: boolean,
  screenRef: RefObject<HTMLElement | null>,
  setOpen: (isOpen: boolean) => void,
): void {
  useEffect(() => {
    if (!shouldOpen) return undefined;
    const frame = requestAnimationFrame(() => {
      const screen = screenRef.current;
      if (screen && !isVisible(screen)) return;
      setOpen(true);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [shouldOpen, screenRef, setOpen]);
}
