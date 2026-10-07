import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WAITLIST_FORM_COPY } from "../waitlist-form/waitlist-form.copy";
import { LandingPage } from "./landing-page";
import { LANDING_PAGE_COPY as COPY } from "./landing-page.copy";

describe("LandingPage", () => {
  it("AC-LND-001 shows the promise, the heading and the waitlist form in the hero", () => {
    render(<LandingPage />);
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText(COPY.audience)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText(WAITLIST_FORM_COPY.emailLabel)).toBeInTheDocument();
  });

  it("AC-LND-002 carries both product mockups, one per device size", () => {
    render(<LandingPage />);
    expect(screen.getByAltText(COPY.phoneAlt)).toBeInTheDocument();
    expect(screen.getByAltText(COPY.laptopAlt)).toBeInTheDocument();
  });

  it("marks the page as English inside the Indonesian app shell", () => {
    const { container } = render(<LandingPage />);
    expect(container.firstElementChild).toHaveAttribute("lang", "en");
  });
});
