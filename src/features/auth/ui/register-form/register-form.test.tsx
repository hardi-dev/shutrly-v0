import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AUTH_ERROR_COPY } from "../auth-error-alert/auth-error-alert.copy";
import { CONTROLLED_TEXT_FIELD_COPY } from "../controlled-text-field/controlled-text-field.copy";
import { RegisterForm } from "./register-form";
import { REGISTER_FORM_COPY as COPY } from "./register-form.copy";

async function fill(values: { name: string; email: string; password: string }) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(COPY.messages.id.name), values.name);
  await user.type(screen.getByLabelText(COPY.messages.id.email), values.email);
  await user.type(screen.getByLabelText(COPY.messages.id.password), values.password);
  await user.click(screen.getByRole("button", { name: COPY.messages.id.submit }));
}

const good = { name: "Alya", email: "a@b.co", password: "correct-horse" };

describe("RegisterForm", () => {
  it("AC-AUTH-023 labels every field", () => {
    render(<RegisterForm action={vi.fn()} />);
    for (const label of [
      COPY.messages.id.name,
      COPY.messages.id.email,
      COPY.messages.id.password,
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it("shows and hides the password when the eye button is pressed", async () => {
    const user = userEvent.setup();
    render(<RegisterForm action={vi.fn()} />);
    const password = screen.getByLabelText(COPY.messages.id.password);
    expect(password).toHaveAttribute("type", "password");
    await user.click(
      screen.getByRole("button", { name: CONTROLLED_TEXT_FIELD_COPY.messages.id.showPassword }),
    );
    expect(password).toHaveAttribute("type", "text");
    await user.click(
      screen.getByRole("button", { name: CONTROLLED_TEXT_FIELD_COPY.messages.id.hidePassword }),
    );
    expect(password).toHaveAttribute("type", "password");
  });

  it("AC-AUTH-002 AC-AUTH-023 validates on the client and focuses the first invalid field", async () => {
    const action = vi.fn();
    render(<RegisterForm action={action} />);
    await fill({ ...good, email: "not-an-email", password: "short" });
    expect(
      await screen.findByText(CONTROLLED_TEXT_FIELD_COPY.messages.id.emailInvalid),
    ).toBeInTheDocument();
    expect(
      screen.getByText(CONTROLLED_TEXT_FIELD_COPY.messages.id.passwordLength),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(COPY.messages.id.email)).toHaveFocus();
    expect(action).not.toHaveBeenCalled();
  });

  it("AC-AUTH-002 shows server field errors on their field", async () => {
    const fieldErrors = { email: "email.invalid" } as const;
    const action = vi.fn(() =>
      Promise.resolve({ ok: false, code: "VALIDATION_FAILED", fieldErrors } as const),
    );
    render(<RegisterForm action={action} />);
    await fill(good);
    expect(
      await screen.findByText(CONTROLLED_TEXT_FIELD_COPY.messages.id.emailInvalid),
    ).toBeInTheDocument();
  });

  it("AC-AUTH-010 AC-AUTH-023 announces and focuses a form-level error", async () => {
    const action = vi.fn(() => Promise.resolve({ ok: false, code: "RATE_LIMITED" } as const));
    render(<RegisterForm action={action} />);
    await fill(good);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(AUTH_ERROR_COPY.messages.id.RATE_LIMITED);
    await waitFor(() => {
      expect(alert).toHaveFocus();
    });
  });
});
