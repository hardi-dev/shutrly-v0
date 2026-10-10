import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it, vi } from "vitest";

import { LoginScreen } from "./login-screen";

const props = { action: vi.fn(), googleAction: vi.fn(), initialError: null };

describe("LoginScreen copy", () => {
  it("AC-L10N-002 renders the sign-in screen in English", () => {
    renderInLocale(<LoginScreen {...props} />, "en");
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("AC-L10N-002 renders the sign-in screen in Indonesian", () => {
    renderInLocale(<LoginScreen {...props} />, "id");
    expect(screen.getByRole("heading", { name: "Selamat datang kembali" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Buat akun" })).toHaveAttribute("href", "/register");
  });
});
