import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { serverFormDom, submitButton } from "@tests/support/forms/server-form";
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

describe("ForgotPasswordForm before and after the page is interactive (AC-SFX-001, AC-SFX-002)", () => {
  it("posts natively and keeps submit disabled until ready", () => {
    const dom = serverFormDom(<ForgotPasswordForm action={vi.fn()} />);
    expect(dom.querySelector("form")).toHaveAttribute("method", "post");
    expect(submitButton(dom)).toBeDisabled();
  });

  it("enables submit once the page is interactive", () => {
    const { container } = renderInLocale(<ForgotPasswordForm action={vi.fn()} />, "id");
    expect(container.querySelector("form")).toHaveAttribute("method", "post");
    expect(submitButton(container)).toBeEnabled();
  });
});
