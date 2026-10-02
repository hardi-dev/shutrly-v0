"use client";

import { useSyncExternalStore } from "react";

const MOBILE_VIEWPORT_QUERY = "(max-width: 767px)";

function subscribe(onChange: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => undefined;
  const mediaQuery = window.matchMedia(MOBILE_VIEWPORT_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => {
    mediaQuery.removeEventListener("change", onChange);
  };
}

function getSnapshot(): boolean {
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia(MOBILE_VIEWPORT_QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Tracks whether the current viewport is within the shared mobile breakpoint.
 * Components mounted after hydration read the breakpoint on their first render,
 * so responsive dialogs never mount the desktop surface for one frame.
 */
export function useMobileViewport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
