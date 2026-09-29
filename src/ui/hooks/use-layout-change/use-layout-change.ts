"use client";

import { useEffect, useRef } from "react";

/** Shell breakpoints: phone below 768 px, tablet rail below 1280 px, desktop from 1280 px. */
export const LAYOUT_QUERIES = ["(min-width: 768px)", "(min-width: 1280px)"] as const;

/**
 * Calls `onChange` whenever the viewport crosses a shell breakpoint.
 * @param onChange - closes overlays that belong to the previous layout
 */
export function useLayoutChange(onChange: () => void): void {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mediaQueries = LAYOUT_QUERIES.map((query) => window.matchMedia(query));
    const handleChange = () => {
      onChangeRef.current();
    };
    for (const mediaQuery of mediaQueries) mediaQuery.addEventListener("change", handleChange);
    return () => {
      for (const mediaQuery of mediaQueries) {
        mediaQuery.removeEventListener("change", handleChange);
      }
    };
  }, []);
}
