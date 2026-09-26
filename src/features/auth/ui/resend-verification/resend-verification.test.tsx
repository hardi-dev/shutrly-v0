import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_ERROR_COPY } from "../auth-error-alert/auth-error-alert.copy";
import { ResendVerification } from "./resend-verification";
import { RESEND_VERIFICATION_COPY as COPY } from "./resend-verification.copy";

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  vi.useRealTimers();
});

async function press() {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  await user.click(screen.getByRole("button", { name: COPY.resend }));
}

describe("ResendVerification", () => {
  it("AC-AUTH-006 disables the button for 60 seconds after a resend (A-6)", async () => {
    render(<ResendVerification action={vi.fn(() => Promise.resolve({ ok: true } as const))} />);
    await press();
    expect(await screen.findByText(/60/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: COPY.resend })).toBeDisabled();
    // The countdown re-arms a one-second timer after each render.
    for (let second = 0; second < 60; second++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1_000);
      });
    }
    expect(screen.getByRole("button", { name: COPY.resend })).toBeEnabled();
  });

  it("AC-AUTH-022 shows a retryable delivery failure", async () => {
    const failed = { ok: false, code: "EMAIL_DELIVERY_FAILED" } as const;
    render(<ResendVerification action={vi.fn(() => Promise.resolve(failed))} />);
    await press();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      AUTH_ERROR_COPY.EMAIL_DELIVERY_FAILED,
    );
    expect(screen.getByRole("button", { name: COPY.resend })).toBeEnabled();
  });
});
