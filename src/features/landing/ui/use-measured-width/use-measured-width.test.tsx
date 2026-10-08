import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMeasuredWidth } from "./use-measured-width";

function Probe({ text }: Readonly<{ text: string }>) {
  const [ref, width] = useMeasuredWidth<HTMLSpanElement>(text);
  return (
    <>
      <span ref={ref}>{text}</span>
      <output>{width ?? "none"}</output>
    </>
  );
}

describe("useMeasuredWidth", () => {
  afterEach(() => vi.restoreAllMocks());

  it("reports the element's width and measures again when the content changes", () => {
    const widths = [120, 180];
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      () => ({ width: widths.shift() ?? 0 }) as DOMRect,
    );
    const { rerender } = render(<Probe text="busywork." />);
    expect(screen.getByRole("status")).toHaveTextContent("120");
    rerender(<Probe text="back-and-forth." />);
    expect(screen.getByRole("status")).toHaveTextContent("180");
  });
});
