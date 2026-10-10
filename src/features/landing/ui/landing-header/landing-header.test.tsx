import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LANDING_PAGE_COPY as COPY } from "../landing-page/landing-page.copy";
import { LandingHeader } from "./landing-header";

describe("LandingHeader", () => {
  it("shows the wordmark and the launch status in a banner", () => {
    render(<LandingHeader />);
    const banner = screen.getByRole("banner");
    expect(banner).toHaveTextContent(COPY.wordmark);
    expect(banner).toHaveTextContent(COPY.comingSoon);
  });
});
