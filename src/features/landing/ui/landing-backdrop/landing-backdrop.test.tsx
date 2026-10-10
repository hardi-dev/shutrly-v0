import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LandingBackdrop } from "./landing-backdrop";

describe("LandingBackdrop", () => {
  it("AC-LND-003 stays out of the accessibility tree and lets clicks through", () => {
    render(<LandingBackdrop />);
    const backdrop = screen.getByTestId("landing-backdrop");
    expect(backdrop).toHaveAttribute("aria-hidden", "true");
    expect(backdrop).toHaveClass("pointer-events-none");
  });
});
