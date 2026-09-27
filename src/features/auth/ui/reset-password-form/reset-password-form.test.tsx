import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FIELD_ERROR_COPY } from "../controlled-text-field/controlled-text-field.copy";
import { ResetPasswordForm } from "./reset-password-form";
import { RESET_PASSWORD_FORM_COPY as COPY } from "./reset-password-form.copy";

async function submit(password: string, confirm: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(COPY.password), password);
  await user.type(screen.getByLabelText(COPY.confirm), confirm);
  await user.click(screen.getByRole("button", { name: COPY.submit }));
}

describe("ResetPasswordForm (RFaNT)", () => {
  it("AC-AUTH-002 AC-AUTH-023 reports a mismatch on the confirmation", async () => {
    const action = vi.fn();
    render(<ResetPasswordForm token="t" action={action} />);
    await submit("new-horse-1", "new-horse-2");
    expect(await screen.findByText(FIELD_ERROR_COPY["password.mismatch"])).toBeInTheDocument();
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
