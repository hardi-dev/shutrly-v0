// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { ClientUnavailable } from "./client-unavailable";

describe("ClientUnavailable (D-7)", () => {
  it("AC-ACC-004 says only that the gallery is unavailable", () => {
    render(<ClientUnavailable />);
    expect(screen.getByRole("main")).toHaveTextContent(
      "Galeri ini tidak tersediaHubungi fotografermu untuk bantuan.",
    );
  });

  it("AC-L10N-001 renders the English copy under an English provider", () => {
    renderInLocale(<ClientUnavailable />, "en");
    expect(screen.getByText("This gallery isn’t available")).toBeVisible();
    expect(screen.getByText("Contact your photographer for help.")).toBeVisible();
  });
});
