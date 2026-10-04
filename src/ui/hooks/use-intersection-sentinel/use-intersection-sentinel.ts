"use client";

import { useEffect, useRef } from "react";

/** Calls `onVisible` when the returned sentinel scrolls into view, for infinite scroll (A-13). @param onVisible - loads the next page @param isEnabled - false while loading or when nothing is left @returns the ref for the sentinel element */
export function useIntersectionSentinel(onVisible: () => void, isEnabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const callback = useRef(onVisible);
  useEffect(() => {
    callback.current = onVisible;
  }, [onVisible]);
  useEffect(() => {
    const node = ref.current;
    if (!node || !isEnabled) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) callback.current();
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [isEnabled]);
  return ref;
}
