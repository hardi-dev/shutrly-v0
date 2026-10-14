import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricDelta } from "./metric-delta";

describe("MetricDelta (C15)", () => {
  it("AC-DASH-033 shows the positive tone with its visible value", () => {
    render(<MetricDelta tone="positive" value="+1" />);
    const badge = screen.getByText("+1");
    expect(badge).toHaveClass(
      "bg-(--component-metric-delta-positive-background)",
      "text-(--component-metric-delta-positive-text)",
    );
  });

  it("AC-DASH-033 shows the warning tone for a loss", () => {
    render(<MetricDelta tone="warning" value="−2" />);
    expect(screen.getByText("−2")).toHaveClass("bg-(--component-metric-delta-warning-background)");
  });

  it("speaks the given text in place of the hidden visible value", () => {
    render(
      <MetricDelta tone="warning" value="−2" srText="−2 compared with the same days last month" />,
    );
    expect(screen.getByText("−2", { selector: "[aria-hidden='true']" })).toBeInTheDocument();
    expect(screen.getByText("−2 compared with the same days last month")).toHaveClass("sr-only");
  });
});
