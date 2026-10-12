import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it, vi } from "vitest";

import { AccountUnavailableScreen } from "./account-unavailable-screen";

describe("AccountUnavailableScreen copy", () => {
  it("AC-L10N-002 renders the unavailable account screen in English", () => {
    renderInLocale(<AccountUnavailableScreen signOutAction={vi.fn()} />, "en");
    expect(screen.getByRole("heading", { name: "Account unavailable" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });

  it("AC-L10N-002 renders the unavailable account screen in Indonesian", () => {
    renderInLocale(<AccountUnavailableScreen signOutAction={vi.fn()} />, "id");
    expect(screen.getByRole("heading", { name: "Akun tidak tersedia" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keluar" })).toBeInTheDocument();
  });
});
