"use client";

import type { RefObject } from "react";
import { useLayoutEffect, useRef, useState } from "react";

/**
 * Measure an element's rendered width before paint, again whenever `content` changes, and when
 * the element resizes (a breakpoint or a late web font changes the text width).
 * @param content - what the element shows; a change triggers a new measurement
 * @returns the ref to attach and the width in pixels, undefined until measured
 */
export function useMeasuredWidth<T extends HTMLElement>(
  content: string,
): [RefObject<T | null>, number | undefined] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState<number>();
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const measure = () => {
      setWidth(element.getBoundingClientRect().width);
    };
    measure();
    if (typeof ResizeObserver !== "function") return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [content]);
  return [ref, width];
}
