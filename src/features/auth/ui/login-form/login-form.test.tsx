import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AUTH_ERROR_COPY } from "../auth-error-alert/auth-error-alert.copy";
import { LoginForm } from "./login-form";
import { LOGIN_FORM_COPY as COPY } from "./login-form.copy";

async function submit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(COPY.email), "owner@example.com");
  await user.type(screen.getByLabelText(COPY.password), "correct-horse");
  await user.click(screen.getByRole("button", { name: COPY.submit }));
}

describe("LoginForm", () => {
  it("AC-AUTH-008 AC-AUTH-023 shows the generic error as a focused, title-only alert", async () => {
    const action = vi.fn(() =>
      Promise.resolve({ ok: false, code: "INVALID_CREDENTIALS" } as const),
    );
    render(<LoginForm action={action} />);
    await submit();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(AUTH_ERROR_COPY.INVALID_CREDENTIALS);
    expect(alert.querySelectorAll("p")).toHaveLength(1);
    await waitFor(() => {
      expect(alert).toHaveFocus();
    });
  });

  it("AC-AUTH-008 shows the processing label and disables submit while signing in (U9laqq)", async () => {
    const action = vi.fn(() => new Promise<undefined>(() => undefined));
    render(<LoginForm action={action} />);
    await submit();
    expect(await screen.findByRole("button", { name: COPY.submitting })).toBeDisabled();
  });

  it("AC-AUTH-029 shows a Google error from the redirect", () => {
    render(<LoginForm action={vi.fn()} initialError="GOOGLE_CANCELLED" />);
    expect(screen.getByRole("alert")).toHaveTextContent(AUTH_ERROR_COPY.GOOGLE_CANCELLED);
  });

  it("AC-AUTH-016 links to password recovery", () => {
    render(<LoginForm action={vi.fn()} />);
    expect(screen.getByRole("link", { name: COPY.forgot })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });
});
