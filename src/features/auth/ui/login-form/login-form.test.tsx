import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { serverFormDom, submitButton } from "@tests/support/forms/server-form";
import { describe, expect, it, vi } from "vitest";

import { AUTH_ERROR_COPY } from "../auth-error-alert/auth-error-alert.copy";
import { LoginForm } from "./login-form";
import { LOGIN_FORM_COPY as COPY } from "./login-form.copy";

async function submit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(COPY.messages.id.email), "owner@example.com");
  await user.type(screen.getByLabelText(COPY.messages.id.password), "correct-horse");
  await user.click(screen.getByRole("button", { name: COPY.messages.id.submit }));
}

describe("LoginForm", () => {
  it("AC-AUTH-008 AC-AUTH-023 shows the generic error as a focused, title-only alert", async () => {
    const action = vi.fn(() =>
      Promise.resolve({ ok: false, code: "INVALID_CREDENTIALS" } as const),
    );
    render(<LoginForm action={action} />);
    await submit();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(AUTH_ERROR_COPY.messages.id.INVALID_CREDENTIALS);
    expect(alert.querySelectorAll("p")).toHaveLength(1);
    await waitFor(() => {
      expect(alert).toHaveFocus();
    });
  });

  it("AC-AUTH-008 shows the processing label and disables submit while signing in (U9laqq)", async () => {
    const action = vi.fn(() => new Promise<undefined>(() => undefined));
    render(<LoginForm action={action} />);
    await submit();
    expect(await screen.findByRole("button", { name: COPY.messages.id.submitting })).toBeDisabled();
  });

  it("AC-AUTH-029 shows a Google error from the redirect", () => {
    render(<LoginForm action={vi.fn()} initialError="GOOGLE_CANCELLED" />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      AUTH_ERROR_COPY.messages.id.GOOGLE_CANCELLED,
    );
  });

  it("AC-AUTH-016 links to password recovery", () => {
    render(<LoginForm action={vi.fn()} />);
    expect(screen.getByRole("link", { name: COPY.messages.id.forgot })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });
});

describe("LoginForm before and after the page is interactive (AC-SFX-001, AC-SFX-002)", () => {
  it("posts natively and keeps submit disabled until ready", () => {
    const dom = serverFormDom(<LoginForm action={vi.fn()} />);
    expect(dom.querySelector("form")).toHaveAttribute("method", "post");
    expect(submitButton(dom)).toBeDisabled();
  });

  it("enables submit once the page is interactive", () => {
    const { container } = render(<LoginForm action={vi.fn()} />);
    expect(container.querySelector("form")).toHaveAttribute("method", "post");
    expect(submitButton(container)).toBeEnabled();
  });
});
