import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { LandingFooter } from "./landing-footer";

describe("LandingFooter copy", () => {
  it("AC-LND-011 links Privacy to the privacy note and Contact to the contact address in English", () => {
    renderInLocale(<LandingFooter />, "en");
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "#privacy");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "mailto:hello@shutrly.space",
    );
    expect(screen.getByRole("contentinfo")).toHaveTextContent("© 2026 Shutrly");
  });

  it("AC-L10N-002 renders the footer links in Indonesian", () => {
    renderInLocale(<LandingFooter />, "id");
    expect(screen.getByRole("link", { name: "Privasi" })).toHaveAttribute("href", "#privacy");
    expect(screen.getByRole("link", { name: "Kontak" })).toBeInTheDocument();
  });
});
