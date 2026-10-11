import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it, vi } from "vitest";

import { RegisterScreen } from "./register-screen";

describe("RegisterScreen copy", () => {
  it("AC-L10N-002 renders the registration screen in English", () => {
    renderInLocale(<RegisterScreen action={vi.fn()} googleAction={vi.fn()} />, "en");
    expect(screen.getByRole("heading", { name: "Create your account" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
  });

  it("AC-L10N-002 renders the registration screen in Indonesian", () => {
    renderInLocale(<RegisterScreen action={vi.fn()} googleAction={vi.fn()} />, "id");
    expect(screen.getByRole("heading", { name: "Buat akunmu" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute("href", "/login");
  });
});
