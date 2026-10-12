import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it, vi } from "vitest";

import { VerifyPendingScreen } from "./verify-pending-screen";

describe("VerifyPendingScreen copy", () => {
  it("AC-L10N-002 renders the pending verification screen in English", () => {
    renderInLocale(<VerifyPendingScreen canResend={false} resendAction={vi.fn()} />, "en");
    expect(screen.getByRole("heading", { name: "Check your email" })).toBeInTheDocument();
    expect(screen.getByText("The link is valid for 24 hours")).toBeInTheDocument();
  });

  it("AC-L10N-002 renders the pending verification screen in Indonesian", () => {
    renderInLocale(<VerifyPendingScreen canResend={false} resendAction={vi.fn()} />, "id");
    expect(screen.getByRole("heading", { name: "Cek emailmu" })).toBeInTheDocument();
    expect(screen.getByText("Tautan berlaku 24 jam")).toBeInTheDocument();
  });
});
