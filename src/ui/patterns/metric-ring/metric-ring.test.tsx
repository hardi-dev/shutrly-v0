import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricRing } from "./metric-ring";

const CIRCUMFERENCE = 2 * Math.PI * ((14 + 14 * 0.68) / 2);

/** The dash pattern of the filled arc, the second circle of the ring. */
function fillOf(): string | null {
  const arc = screen.getByRole("img").querySelectorAll("circle")[1];
  return arc.getAttribute("stroke-dasharray");
}

describe("MetricRing (C26, AC-DASH-035)", () => {
  it("AC-DASH-035 fills half the ring for one of two", () => {
    render(<MetricRing part={1} total={2} label="label" />);
    expect(fillOf()).toBe(`${String(CIRCUMFERENCE / 2)} ${String(CIRCUMFERENCE)}`);
  });

  it("AC-DASH-035 fills three quarters for three of four", () => {
    render(<MetricRing part={3} total={4} label="label" />);
    expect(fillOf()).toBe(`${String(CIRCUMFERENCE * 0.75)} ${String(CIRCUMFERENCE)}`);
  });

  it("AC-DASH-035 keeps an empty fill for a zero share", () => {
    render(<MetricRing part={0} total={2} label="label" />);
    expect(fillOf()).toBe(`0 ${String(CIRCUMFERENCE)}`);
  });

  it("is an image with its spoken label", () => {
    render(<MetricRing part={1} total={2} label="1 of 2 waiting 3 days or more" />);
    expect(screen.getByRole("img", { name: "1 of 2 waiting 3 days or more" })).toBeInTheDocument();
  });
});
