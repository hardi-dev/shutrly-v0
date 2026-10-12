import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { serverFormDom, submitButton } from "@tests/support/forms/server-form";
import { describe, expect, it, vi } from "vitest";

import type { JoinWaitlistResult } from "@/features/landing/application/use-cases/join-waitlist/join-waitlist.types";
import type { AppLocale } from "@/shared/locale/locale.types";

import type { WaitlistAction } from "../use-waitlist-form/use-waitlist-form.types";
import { WaitlistForm } from "./waitlist-form";

function answer(result: JoinWaitlistResult) {
  return vi.fn(() => Promise.resolve(result));
}

async function submit(email: string, label: string) {
  const user = userEvent.setup();
  if (email) await user.type(screen.getByLabelText(label), email);
  // One submit button; its long and short labels are switched by CSS, which jsdom doesn't apply.
  await user.click(screen.getByRole("button"));
  return user;
}

function renderForm(action: WaitlistAction, locale: AppLocale = "en") {
  renderInLocale(<WaitlistForm action={action} />, locale);
}

describe("WaitlistForm", () => {
  it("AC-LND-003 gives the email field an accessible label and keeps the placeholder", () => {
    renderForm(vi.fn());
    expect(screen.getByLabelText("Email address")).toHaveAttribute(
      "placeholder",
      "Enter your email",
    );
  });

  it("AC-LND-006 shows the error under the field, keeps the value and focuses the field", async () => {
    const action = vi.fn();
    renderForm(action);
    await submit("rina@", "Email address");
    expect(
      await screen.findByText("Enter a valid email address, like name@example.com."),
    ).toBeInTheDocument();
    const field = screen.getByLabelText("Email address");
    expect(field).toHaveValue("rina@");
    expect(field).toHaveFocus();
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(action).not.toHaveBeenCalled();
  });

  it("AC-LND-006 asks for an email when the field is empty", async () => {
    renderForm(vi.fn());
    await submit("", "Email address");
    expect(await screen.findByText("Enter your email address.")).toBeInTheDocument();
  });

  it("AC-LND-005 sends the typed email with an empty bot field and shows the success message", async () => {
    const action = answer({ status: "JOINED" });
    renderForm(action);
    await submit(" Rina@Example.com ", "Email address");
    expect(await screen.findByText("You’re on the list.")).toBeInTheDocument();
    expect(action).toHaveBeenCalledWith({ email: "Rina@Example.com", website: "" });
    expect(screen.queryByLabelText("Email address")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "hello@shutrly.space" })).toBeInTheDocument();
  });

  it("AC-LND-005 disables the button while the request runs", async () => {
    let finish: (result: JoinWaitlistResult) => void = vi.fn();
    const pending = new Promise<JoinWaitlistResult>((resolve) => (finish = resolve));
    renderForm(vi.fn(() => pending));
    await submit("rina@example.com", "Email address");
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Joining…");
    finish({ status: "JOINED" });
    expect(await screen.findByText("You’re on the list.")).toBeInTheDocument();
  });

  it("AC-LND-006 shows a field error the server returns", async () => {
    renderForm(answer({ status: "INVALID", field: "email", error: "email.tooLong" }));
    await submit("rina@example.com", "Email address");
    expect(
      await screen.findByText("This email is too long. Use one with at most 254 characters."),
    ).toBeInTheDocument();
  });

  it("AC-LND-010 keeps the email and asks to try again when the server fails", async () => {
    renderForm(answer({ status: "FAILED" }));
    await submit("rina@example.com", "Email address");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That didn’t work. Please try again.",
    );
    expect(screen.getByLabelText("Email address")).toHaveValue("rina@example.com");
  });

  it("AC-LND-010 treats a network error like a server failure", async () => {
    renderForm(vi.fn(() => Promise.reject(new Error("offline"))));
    await submit("rina@example.com", "Email address");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That didn’t work. Please try again.",
    );
  });

  it("AC-LND-008 asks to try again in a moment when rate limited", async () => {
    renderForm(answer({ status: "RATE_LIMITED" }));
    await submit("rina@example.com", "Email address");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Too many attempts. Please try again in a moment.",
    );
  });

  it("AC-LND-003 keeps the bot field out of the tab order and away from assistive tech", () => {
    const { container } = renderInLocale(<WaitlistForm action={vi.fn()} />, "en");
    const bot = container.querySelector('input[name="website"]');
    expect(bot).toHaveAttribute("tabindex", "-1");
    expect(bot?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("AC-LND-011 shows the privacy note under the button with the removal contact", () => {
    renderForm(vi.fn());
    expect(screen.getByText(/We only use your email/)).toHaveAttribute("id", "privacy");
    expect(screen.getByRole("link", { name: "hello@shutrly.space" })).toHaveAttribute(
      "href",
      "mailto:hello@shutrly.space",
    );
  });

  it("AC-L10N-002 renders the form and its messages in Indonesian", async () => {
    renderForm(answer({ status: "RATE_LIMITED" }), "id");
    expect(screen.getByLabelText("Alamat email")).toHaveAttribute(
      "placeholder",
      "Masukkan emailmu",
    );
    expect(screen.getAllByText("Gabung daftar tunggu")).toHaveLength(2);
    await submit("rina@example.com", "Alamat email");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Terlalu banyak percobaan. Coba lagi sebentar.",
    );
  });
});

describe("WaitlistForm before and after the page is interactive (AC-SFX-001, AC-SFX-002)", () => {
  it("posts natively and keeps submit disabled until ready", () => {
    const dom = serverFormDom(<WaitlistForm action={vi.fn()} />, "en");
    expect(dom.querySelector("form")).toHaveAttribute("method", "post");
    expect(submitButton(dom)).toBeDisabled();
  });

  it("enables submit once the page is interactive", () => {
    const { container } = renderInLocale(<WaitlistForm action={vi.fn()} />, "en");
    expect(container.querySelector("form")).toHaveAttribute("method", "post");
    expect(submitButton(container)).toBeEnabled();
  });
});
