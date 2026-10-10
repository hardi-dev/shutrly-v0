import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { InvalidResetLinkScreen } from "./invalid-reset-link-screen";

describe("InvalidResetLinkScreen copy", () => {
  it("AC-L10N-002 renders the expired reset link in English", () => {
    renderInLocale(<InvalidResetLinkScreen />, "en");
    expect(
      screen.getByRole("heading", { name: "This reset link is no longer valid" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request reset link" })).toBeInTheDocument();
  });

  it("AC-L10N-002 renders the expired reset link in Indonesian", () => {
    renderInLocale(<InvalidResetLinkScreen />, "id");
    expect(
      screen.getByRole("heading", { name: "Tautan atur ulang ini sudah tidak berlaku" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Minta tautan atur ulang" })).toBeInTheDocument();
  });
});
