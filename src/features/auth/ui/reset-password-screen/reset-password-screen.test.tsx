import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it, vi } from "vitest";

import { ResetPasswordScreen } from "./reset-password-screen";

describe("ResetPasswordScreen copy", () => {
  it("AC-L10N-002 renders the new password screen in English", () => {
    renderInLocale(<ResetPasswordScreen token="t" action={vi.fn()} />, "en");
    expect(screen.getByRole("heading", { name: "Set a new password" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to sign in" })).toBeInTheDocument();
  });

  it("AC-L10N-002 renders the new password screen in Indonesian", () => {
    renderInLocale(<ResetPasswordScreen token="t" action={vi.fn()} />, "id");
    expect(screen.getByRole("heading", { name: "Buat kata sandi baru" })).toBeInTheDocument();
  });
});
