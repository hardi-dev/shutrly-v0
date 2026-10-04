import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useImageFallback } from "./use-image-fallback";

describe("useImageFallback", () => {
  it("AC-GAL-034 swaps to the fallback once, then gives up without retrying", () => {
    const { result } = renderHook(() => useImageFallback("/main.jpg", "/fallback.jpg"));
    expect(result.current.src).toBe("/main.jpg");
    act(() => {
      result.current.onError();
    });
    expect(result.current.src).toBe("/fallback.jpg");
    act(() => {
      result.current.onError();
    });
    expect(result.current.src).toBeNull();
    act(() => {
      result.current.onError();
    });
    expect(result.current.src).toBeNull();
  });

  it("AC-GAL-034 without a fallback a failed image just goes away", () => {
    const { result } = renderHook(() => useImageFallback("/main.jpg"));
    act(() => {
      result.current.onError();
    });
    expect(result.current.src).toBeNull();
  });

  it("AC-GAL-034 another photo starts again from its main URL", () => {
    const { result, rerender } = renderHook(({ src }) => useImageFallback(src, "/fallback.jpg"), {
      initialProps: { src: "/a.jpg" },
    });
    act(() => {
      result.current.onError();
    });
    rerender({ src: "/b.jpg" });
    expect(result.current.src).toBe("/b.jpg");
  });
});
