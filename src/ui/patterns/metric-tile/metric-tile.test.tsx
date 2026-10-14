import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricDelta } from "@/ui/primitives/metric-delta/metric-delta";

import { MetricTile } from "./metric-tile";

describe("MetricTile (C26, AC-DASH-033)", () => {
  it("reads the label, then the value, then the delta", () => {
    const { container } = render(
      <MetricTile
        label="New projects"
        value="4"
        delta={<MetricDelta tone="positive" value="+1" />}
      />,
    );
    const text = container.textContent;
    expect(text.indexOf("New projects")).toBeLessThan(text.indexOf("4"));
    expect(text.indexOf("4")).toBeLessThan(text.indexOf("+1"));
    expect(screen.getByText("New projects")).toBeInTheDocument();
  });

  it("renders the chart slot and leaves out an absent delta", () => {
    render(<MetricTile label="In editing" value="2" chart={<span>chart</span>} />);
    expect(screen.getByText("chart")).toBeInTheDocument();
    expect(screen.queryByText("+1")).not.toBeInTheDocument();
  });
});
