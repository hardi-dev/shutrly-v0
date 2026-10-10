import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it, vi } from "vitest";

import { ForgotPasswordForm } from "./forgot-password-form";

describe("ForgotPasswordForm copy", () => {
  it("AC-L10N-002 labels the reset form in English", () => {
    renderInLocale(<ForgotPasswordForm action={vi.fn()} />, "en");
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send reset link" })).toBeInTheDocument();
  });

  it("AC-L10N-002 labels the reset form in Indonesian", () => {
    renderInLocale(<ForgotPasswordForm action={vi.fn()} />, "id");
    expect(screen.getByRole("button", { name: "Kirim tautan atur ulang" })).toBeInTheDocument();
  });
});
