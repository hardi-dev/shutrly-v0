import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { LandingHeader } from "./landing-header";

describe("LandingHeader copy", () => {
  it("shows the wordmark and the launch status in English", () => {
    renderInLocale(<LandingHeader />, "en");
    const banner = screen.getByRole("banner");
    expect(banner).toHaveTextContent("shutrly");
    expect(banner).toHaveTextContent("Coming soon");
  });

  it("shows the launch status in Indonesian", () => {
    renderInLocale(<LandingHeader />, "id");
    expect(screen.getByRole("banner")).toHaveTextContent("Segera hadir");
  });
});
