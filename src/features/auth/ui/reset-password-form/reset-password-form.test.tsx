import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { serverFormDom, submitButton } from "@tests/support/forms/server-form";
import { describe, expect, it, vi } from "vitest";

import { CONTROLLED_TEXT_FIELD_COPY } from "../controlled-text-field/controlled-text-field.copy";
import { ResetPasswordForm } from "./reset-password-form";
import { RESET_PASSWORD_FORM_COPY as COPY } from "./reset-password-form.copy";

async function submit(password: string, confirm: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(COPY.messages.id.password), password);
  await user.type(screen.getByLabelText(COPY.messages.id.confirm), confirm);
  await user.click(screen.getByRole("button", { name: COPY.messages.id.submit }));
}

describe("ResetPasswordForm (RFaNT)", () => {
  it("AC-AUTH-002 AC-AUTH-023 reports a mismatch on the confirmation", async () => {
    const action = vi.fn();
    render(<ResetPasswordForm token="t" action={action} />);
    await submit("new-horse-1", "new-horse-2");
    expect(
      await screen.findByText(CONTROLLED_TEXT_FIELD_COPY.messages.id.passwordMismatch),
    ).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("AC-AUTH-017 sends the link token with the new password", async () => {
    const action = vi.fn(() => Promise.resolve(undefined));
    render(<ResetPasswordForm token="tok" action={action} />);
    await submit("new-horse-1", "new-horse-1");
    expect(action).toHaveBeenCalledWith({
      token: "tok",
      password: "new-horse-1",
      confirm: "new-horse-1",
    });
  });
});

describe("ResetPasswordForm before and after the page is interactive (AC-SFX-001, AC-SFX-002)", () => {
  it("posts natively and keeps submit disabled until ready", () => {
    const dom = serverFormDom(<ResetPasswordForm token="t" action={vi.fn()} />);
    expect(dom.querySelector("form")).toHaveAttribute("method", "post");
    expect(submitButton(dom)).toBeDisabled();
  });

  it("enables submit once the page is interactive", () => {
    const { container } = render(<ResetPasswordForm token="t" action={vi.fn()} />);
    expect(container.querySelector("form")).toHaveAttribute("method", "post");
    expect(submitButton(container)).toBeEnabled();
  });
});
