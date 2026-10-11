import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
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
