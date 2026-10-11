import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { AuthErrorAlert } from "./auth-error-alert";

describe("AuthErrorAlert copy", () => {
  it("AC-L10N-002 shows the invalid credentials message in English", () => {
    renderInLocale(<AuthErrorAlert code="INVALID_CREDENTIALS" />, "en");
    expect(screen.getByRole("alert")).toHaveTextContent("The email or password is incorrect.");
  });

  it("AC-L10N-002 shows the invalid credentials message in Indonesian", () => {
    renderInLocale(<AuthErrorAlert code="INVALID_CREDENTIALS" />, "id");
    expect(screen.getByRole("alert")).toHaveTextContent("Email atau kata sandi salah.");
  });
});
