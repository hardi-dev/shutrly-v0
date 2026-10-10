import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it, vi } from "vitest";

import { ForgotPasswordScreen } from "./forgot-password-screen";

describe("ForgotPasswordScreen copy", () => {
  it("AC-L10N-002 renders the reset request screen in English", () => {
    renderInLocale(<ForgotPasswordScreen action={vi.fn()} />, "en");
    expect(screen.getByRole("heading", { name: "Reset your password" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to sign in" })).toBeInTheDocument();
  });

  it("AC-L10N-002 renders the reset request screen in Indonesian", () => {
    renderInLocale(<ForgotPasswordScreen action={vi.fn()} />, "id");
    expect(screen.getByRole("heading", { name: "Atur ulang kata sandi" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kembali ke halaman masuk" })).toBeInTheDocument();
  });
});
