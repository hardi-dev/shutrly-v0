import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useIntersectionSentinel } from "./use-intersection-sentinel";

let notify: ((entries: { isIntersecting: boolean }[]) => void) | null = null;

class FakeObserver {
  constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
    notify = callback;
  }
  observe = vi.fn();
  disconnect = vi.fn();
}

function Harness({
  onVisible,
  isEnabled,
}: Readonly<{ onVisible: () => void; isEnabled: boolean }>) {
  const ref = useIntersectionSentinel(onVisible, isEnabled);
  return <div ref={ref} />;
}

describe("useIntersectionSentinel", () => {
  it("A-13 loads more when the sentinel becomes visible, only while enabled", () => {
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    const onVisible = vi.fn();
    notify = null;
    render(<Harness onVisible={onVisible} isEnabled={false} />);
    expect(notify).toBeNull();
    render(<Harness onVisible={onVisible} isEnabled />);
    act(() => {
      notify?.([{ isIntersecting: true }]);
    });
    expect(onVisible).toHaveBeenCalledTimes(1);
  });
});
