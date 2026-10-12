import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useOpenOnLoad } from "./use-open-on-load";

function elementWithVisibility(visible: boolean): HTMLElement {
  const element = document.createElement("main");
  Object.defineProperty(element, "checkVisibility", { value: () => visible });
  return element;
}

describe("useOpenOnLoad", () => {
  it("AC-SETUP-005 opens the visible screen's dialog after mount", async () => {
    const setOpen = vi.fn();
    renderHook(() => {
      useOpenOnLoad(true, { current: elementWithVisibility(true) }, setOpen);
    });
    await waitFor(() => {
      expect(setOpen).toHaveBeenCalledWith(true);
    });
  });

  it("AC-SETUP-005 leaves the hidden layout's copy closed", async () => {
    const setOpen = vi.fn();
    renderHook(() => {
      useOpenOnLoad(true, { current: elementWithVisibility(false) }, setOpen);
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(setOpen).not.toHaveBeenCalled();
  });

  it("does nothing without the link", async () => {
    const setOpen = vi.fn();
    renderHook(() => {
      useOpenOnLoad(false, { current: elementWithVisibility(true) }, setOpen);
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(setOpen).not.toHaveBeenCalled();
  });
});
