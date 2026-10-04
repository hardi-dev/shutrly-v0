"use client";

import { useState } from "react";

import type { ImageFallbackState } from "./use-image-fallback.types";

interface Failure {
  readonly forSrc: string;
  readonly count: number;
}

/** Tracks which image URL to show: the main one, then the fallback once after a load error, then none, so a broken image never retries in a loop. @param src - the main image URL @param fallbackSrc - the URL to try once after `src` fails, if any @returns the URL to render (null when every candidate failed) and the `onError` handler */
export function useImageFallback(src: string, fallbackSrc?: string): ImageFallbackState {
  const [failure, setFailure] = useState<Failure>({ forSrc: src, count: 0 });
  // A new `src` (another photo) starts again from the main URL.
  const count = failure.forSrc === src ? failure.count : 0;
  const handleError = () => {
    setFailure({ forSrc: src, count: count + 1 });
  };
  if (count === 0) return { src, onError: handleError };
  if (count === 1 && fallbackSrc !== undefined) return { src: fallbackSrc, onError: handleError };
  return { src: null, onError: handleError };
}
