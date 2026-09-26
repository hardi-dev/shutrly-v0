import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AUTH_ERROR_COPY } from "../auth-error-alert/auth-error-alert.copy";
import { FIELD_ERROR_COPY } from "../controlled-text-field/controlled-text-field.copy";
import { RegisterForm } from "./register-form";
import { REGISTER_FORM_COPY as COPY } from "./register-form.copy";

async function fill(values: { name: string; email: string; password: string }) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(COPY.name), values.name);
  await user.type(screen.getByLabelText(COPY.email), values.email);
  await user.type(screen.getByLabelText(COPY.password), values.password);
  await user.click(screen.getByRole("button", { name: COPY.submit }));
}

const good = { name: "Alya", email: "a@b.co", password: "correct-horse" };

describe("RegisterForm", () => {
  it("AC-AUTH-023 labels every field", () => {
    render(<RegisterForm action={vi.fn()} />);
    for (const label of [COPY.name, COPY.email, COPY.password]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it("AC-AUTH-002 AC-AUTH-023 validates on the client and focuses the first invalid field", async () => {
    const action = vi.fn();
    render(<RegisterForm action={action} />);
    await fill({ ...good, email: "not-an-email", password: "short" });
    expect(await screen.findByText(FIELD_ERROR_COPY["email.invalid"])).toBeInTheDocument();
    expect(screen.getByText(FIELD_ERROR_COPY["password.length"])).toBeInTheDocument();
    expect(screen.getByLabelText(COPY.email)).toHaveFocus();
    expect(action).not.toHaveBeenCalled();
  });

  it("AC-AUTH-002 shows server field errors on their field", async () => {
    const fieldErrors = { email: "email.invalid" } as const;
    const action = vi.fn(() =>
      Promise.resolve({ ok: false, code: "VALIDATION_FAILED", fieldErrors } as const),
    );
    render(<RegisterForm action={action} />);
    await fill(good);
    expect(await screen.findByText(FIELD_ERROR_COPY["email.invalid"])).toBeInTheDocument();
  });

  it("AC-AUTH-010 AC-AUTH-023 announces and focuses a form-level error", async () => {
    const action = vi.fn(() => Promise.resolve({ ok: false, code: "RATE_LIMITED" } as const));
    render(<RegisterForm action={action} />);
    await fill(good);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(AUTH_ERROR_COPY.RATE_LIMITED);
    await waitFor(() => {
      expect(alert).toHaveFocus();
    });
  });
});
