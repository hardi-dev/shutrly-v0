import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LAYOUT_QUERIES, useLayoutChange } from "./use-layout-change";

function LayoutProbe({ onChange }: Readonly<{ onChange: () => void }>) {
  useLayoutChange(onChange);
  return null;
}

describe("useLayoutChange", () => {
  it("notifies when the viewport crosses a shell breakpoint", () => {
    const listeners = new Map<string, () => void>();
    vi.stubGlobal("matchMedia", (media: string) => ({
      matches: false,
      media,
      addEventListener: (_type: string, listener: () => void) => {
        listeners.set(media, listener);
      },
      removeEventListener: vi.fn(),
    }));
    const onChange = vi.fn();

    render(<LayoutProbe onChange={onChange} />);
    act(() => {
      listeners.get(LAYOUT_QUERIES[1])?.();
    });

    expect([...listeners.keys()]).toEqual([...LAYOUT_QUERIES]);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("does nothing when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);

    expect(() => render(<LayoutProbe onChange={vi.fn()} />)).not.toThrow();
  });
});
