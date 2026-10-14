import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricSpark } from "./metric-spark";

function barsOf(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("span.block"));
}

describe("MetricSpark (C26)", () => {
  it("AC-DASH-034 draws seven bars scaled to the largest value, the last one highlighted", () => {
    const { container } = render(<MetricSpark values={[2, 0, 0, 0, 0, 0, 4]} />);
    const bars = barsOf(container);

    expect(bars).toHaveLength(7);
    expect(bars[0]).toHaveStyle({ height: "50%" });
    expect(bars[6]).toHaveStyle({ height: "100%" });
    expect(bars[6]).toHaveClass("bg-(--component-metric-spark-current)");
    expect(bars[0]).toHaveClass("bg-(--component-metric-spark-bar)");
  });

  it("draws no bars for an all-zero series", () => {
    const { container } = render(<MetricSpark values={[0, 0, 0, 0, 0, 0, 0]} />);
    barsOf(container).forEach((bar) => {
      expect(bar).toHaveStyle({ height: "0%" });
    });
  });

  it("is hidden from assistive tech unless it has a spoken summary", () => {
    const { container, rerender } = render(<MetricSpark values={[1, 1, 1, 1, 1, 1, 1]} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");

    rerender(<MetricSpark values={[1, 1, 1, 1, 1, 1, 1]} label="Projects per month" />);
    expect(screen.getByRole("img", { name: "Projects per month" })).toBeInTheDocument();
  });
});
