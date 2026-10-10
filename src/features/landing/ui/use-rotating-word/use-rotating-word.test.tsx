import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ROTATING_WORD_HOLD_MS, useRotatingWord } from "./use-rotating-word";

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", () => ({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe("useRotatingWord", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("holds each word, then moves to the next and wraps around", () => {
    stubReducedMotion(false);
    const { result } = renderHook(() => useRotatingWord(3));
    expect(result.current).toBe(0);
    act(() => {
      vi.advanceTimersByTime(ROTATING_WORD_HOLD_MS);
    });
    expect(result.current).toBe(1);
    act(() => {
      vi.advanceTimersByTime(ROTATING_WORD_HOLD_MS * 2);
    });
    expect(result.current).toBe(0);
  });

  it("stays on the first word when the visitor prefers reduced motion", () => {
    stubReducedMotion(true);
    const { result } = renderHook(() => useRotatingWord(3));
    act(() => {
      vi.advanceTimersByTime(ROTATING_WORD_HOLD_MS * 4);
    });
    expect(result.current).toBe(0);
  });
});
