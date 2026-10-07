import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { JoinWaitlistResult } from "@/features/landing/application/use-cases/join-waitlist/join-waitlist.types";

import { WaitlistForm } from "./waitlist-form";
import { WAITLIST_FORM_COPY as COPY } from "./waitlist-form.copy";

function answer(result: JoinWaitlistResult) {
  return vi.fn(() => Promise.resolve(result));
}

async function submit(email: string) {
  const user = userEvent.setup();
  if (email) await user.type(screen.getByLabelText(COPY.emailLabel), email);
  // One submit button; its long and short labels are switched by CSS, which jsdom doesn't apply.
  await user.click(screen.getByRole("button"));
  return user;
}

describe("WaitlistForm", () => {
  it("AC-LND-003 gives the email field an accessible label and keeps the placeholder", () => {
    render(<WaitlistForm action={vi.fn()} />);
    expect(screen.getByLabelText(COPY.emailLabel)).toHaveAttribute(
      "placeholder",
      COPY.emailPlaceholder,
    );
  });

  it("AC-LND-006 shows the error under the field, keeps the value and focuses the field", async () => {
    const action = vi.fn();
    render(<WaitlistForm action={action} />);
    await submit("rina@");
    expect(await screen.findByText(COPY.errors["email.invalid"])).toBeInTheDocument();
    const field = screen.getByLabelText(COPY.emailLabel);
    expect(field).toHaveValue("rina@");
    expect(field).toHaveFocus();
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(action).not.toHaveBeenCalled();
  });

  it("AC-LND-006 asks for an email when the field is empty", async () => {
    render(<WaitlistForm action={vi.fn()} />);
    await submit("");
    expect(await screen.findByText(COPY.errors["email.required"])).toBeInTheDocument();
  });

  it("AC-LND-005 sends the typed email with an empty bot field and shows the success message", async () => {
    const action = answer({ status: "JOINED" });
    render(<WaitlistForm action={action} />);
    await submit(" Rina@Example.com ");
    expect(await screen.findByText(COPY.successTitle)).toBeInTheDocument();
    expect(action).toHaveBeenCalledWith({ email: "Rina@Example.com", website: "" });
    expect(screen.queryByLabelText(COPY.emailLabel)).not.toBeInTheDocument();
    expect(screen.getByText(COPY.privacy)).toHaveAttribute("id", "privacy");
  });

  it("AC-LND-005 disables the button while the request runs", async () => {
    let finish: (result: JoinWaitlistResult) => void = vi.fn();
    const pending = new Promise<JoinWaitlistResult>((resolve) => (finish = resolve));
    render(<WaitlistForm action={vi.fn(() => pending)} />);
    await submit("rina@example.com");
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(COPY.submitting);
    finish({ status: "JOINED" });
    expect(await screen.findByText(COPY.successTitle)).toBeInTheDocument();
  });

  it("AC-LND-006 shows a field error the server returns", async () => {
    render(
      <WaitlistForm
        action={answer({ status: "INVALID", field: "email", error: "email.tooLong" })}
      />,
    );
    await submit("rina@example.com");
    expect(await screen.findByText(COPY.errors["email.tooLong"])).toBeInTheDocument();
  });

  it("AC-LND-010 keeps the email and asks to try again when the server fails", async () => {
    render(<WaitlistForm action={answer({ status: "FAILED" })} />);
    await submit("rina@example.com");
    expect(await screen.findByRole("alert")).toHaveTextContent(COPY.failed);
    expect(screen.getByLabelText(COPY.emailLabel)).toHaveValue("rina@example.com");
  });

  it("AC-LND-010 treats a network error like a server failure", async () => {
    render(<WaitlistForm action={vi.fn(() => Promise.reject(new Error("offline")))} />);
    await submit("rina@example.com");
    expect(await screen.findByRole("alert")).toHaveTextContent(COPY.failed);
  });

  it("AC-LND-008 asks to try again in a moment when rate limited", async () => {
    render(<WaitlistForm action={answer({ status: "RATE_LIMITED" })} />);
    await submit("rina@example.com");
    expect(await screen.findByRole("alert")).toHaveTextContent(COPY.rateLimited);
  });

  it("AC-LND-003 keeps the bot field out of the tab order and away from assistive tech", () => {
    const { container } = render(<WaitlistForm action={vi.fn()} />);
    const bot = container.querySelector('input[name="website"]');
    expect(bot).toHaveAttribute("tabindex", "-1");
    expect(bot?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("AC-LND-011 shows the privacy note under the button", () => {
    render(<WaitlistForm action={vi.fn()} />);
    expect(screen.getByText(COPY.privacy)).toBeInTheDocument();
  });
});
