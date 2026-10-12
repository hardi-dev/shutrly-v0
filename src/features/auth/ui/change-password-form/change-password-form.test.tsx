import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { serverFormDom, submitButton } from "@tests/support/forms/server-form";
import { describe, expect, it, vi } from "vitest";

import { ChangePasswordForm } from "./change-password-form";

describe("ChangePasswordForm copy", () => {
  it("AC-L10N-002 labels the password change in English", () => {
    renderInLocale(<ChangePasswordForm action={vi.fn()} />, "en");
    expect(screen.getByLabelText("Current password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm new password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change password" })).toBeInTheDocument();
  });

  it("AC-L10N-002 labels the password change in Indonesian", () => {
    renderInLocale(<ChangePasswordForm action={vi.fn()} initialDone />, "id");
    expect(screen.getByLabelText("Kata sandi saat ini")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Kata sandi diganti. Sesi di perangkat lain sudah dikeluarkan.",
    );
  });
});

describe("ChangePasswordForm before and after the page is interactive (AC-SFX-001, AC-SFX-002)", () => {
  it("posts natively and keeps submit disabled until ready", () => {
    const dom = serverFormDom(<ChangePasswordForm action={vi.fn()} />);
    expect(dom.querySelector("form")).toHaveAttribute("method", "post");
    expect(submitButton(dom)).toBeDisabled();
  });

  it("enables submit once the page is interactive", () => {
    const { container } = renderInLocale(<ChangePasswordForm action={vi.fn()} />, "id");
    expect(container.querySelector("form")).toHaveAttribute("method", "post");
    expect(submitButton(container)).toBeEnabled();
  });
});
