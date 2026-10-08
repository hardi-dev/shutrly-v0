import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LANDING_PAGE_COPY as COPY } from "../landing-page/landing-page.copy";
import { LandingFooter } from "./landing-footer";

describe("LandingFooter", () => {
  it("AC-LND-011 links Privacy to the privacy note under the form", () => {
    render(<LandingFooter />);
    expect(screen.getByRole("link", { name: COPY.privacy })).toHaveAttribute("href", "#privacy");
  });

  it("AC-LND-011 links Contact to the removal and contact address", () => {
    render(<LandingFooter />);
    expect(screen.getByRole("link", { name: COPY.contact })).toHaveAttribute(
      "href",
      `mailto:${COPY.contactEmail}`,
    );
  });

  it("shows the copyright year", () => {
    render(<LandingFooter />);
    expect(screen.getByRole("contentinfo")).toHaveTextContent(COPY.copyright);
  });
});
