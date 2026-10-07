"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

// How long each word stays before the next slides in (design.md › rotation board vxDeG).
export const ROTATING_WORD_HOLD_MS = 2800;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => undefined;
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => {
    mediaQuery.removeEventListener("change", onChange);
  };
}

function prefersReducedMotion(): boolean {
  if (typeof window.matchMedia !== "function") return true;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

// The server renders the first word without motion; the client starts rotating after hydration.
function serverPrefersReducedMotion(): boolean {
  return true;
}

/**
 * Cycle through a list of words, one every `ROTATING_WORD_HOLD_MS`; stay on the first word when
 * the visitor prefers reduced motion.
 * @param count - how many words rotate
 * @returns the index of the word to show
 */
export function useRotatingWord(count: number): number {
  const [index, setIndex] = useState(0);
  const reduced = useSyncExternalStore(subscribe, prefersReducedMotion, serverPrefersReducedMotion);
  useEffect(() => {
    if (reduced || count < 2) return undefined;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, ROTATING_WORD_HOLD_MS);
    return () => {
      clearInterval(timer);
    };
  }, [reduced, count]);
  return reduced ? 0 : index % count;
}
