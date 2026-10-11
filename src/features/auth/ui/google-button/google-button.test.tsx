import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it, vi } from "vitest";

import { GoogleButton } from "./google-button";

describe("GoogleButton copy", () => {
  it("AC-L10N-002 labels the Google button in English", () => {
    renderInLocale(<GoogleButton action={vi.fn()} />, "en");
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeInTheDocument();
  });

  it("AC-L10N-002 labels the Google button in Indonesian", () => {
    renderInLocale(<GoogleButton action={vi.fn()} />, "id");
    expect(screen.getByRole("button", { name: "Lanjutkan dengan Google" })).toBeInTheDocument();
  });
});
