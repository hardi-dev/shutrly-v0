import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VerifyPendingScreen } from "../verify-pending-screen/verify-pending-screen";
import { VERIFY_PENDING_SCREEN_COPY } from "../verify-pending-screen/verify-pending-screen.copy";
import { InvalidVerifyLinkScreen } from "./invalid-verify-link-screen";
import { INVALID_VERIFY_LINK_SCREEN_COPY as COPY } from "./invalid-verify-link-screen.copy";

const resend = vi.fn();

describe("verification screens", () => {
  it("AC-AUTH-003 the pending screen shows static guidance, not a live announcement", () => {
    render(<VerifyPendingScreen canResend resendAction={resend} />);
    expect(screen.getByText(VERIFY_PENDING_SCREEN_COPY.alertTitle)).toBeInTheDocument();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("AC-AUTH-005 the invalid-link screen offers resend when an email is known", () => {
    render(<InvalidVerifyLinkScreen canResend resendAction={resend} />);
    expect(screen.getByRole("button", { name: COPY.action })).toBeInTheDocument();
  });

  it("AC-AUTH-005 without a known email it sends the visitor to sign in", () => {
    render(<InvalidVerifyLinkScreen canResend={false} resendAction={resend} />);
    expect(screen.getByRole("link", { name: COPY.action })).toHaveAttribute("href", "/login");
  });
});
