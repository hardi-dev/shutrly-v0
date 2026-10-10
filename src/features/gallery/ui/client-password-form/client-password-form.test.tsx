// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ClientPasswordForm } from "./client-password-form";
import type { ClientPasswordFormProps } from "./client-password-form.types";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

function renderForm(result: Awaited<ReturnType<ClientPasswordFormProps["action"]>>) {
  const action = vi.fn<ClientPasswordFormProps["action"]>().mockResolvedValue(result);
  render(<ClientPasswordForm action={action} />);
  return action;
}

async function submit(password: string) {
  const user = userEvent.setup();
  if (password) await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Buka galeri" }));
}

describe("ClientPasswordForm (D-5)", () => {
  it("AC-ACC-001 sends the typed password", async () => {
    const action = renderForm({ kind: "WRONG_PASSWORD" });
    await submit("mawar-4821");
    await waitFor(() => {
      expect(action).toHaveBeenCalledWith({ password: "mawar-4821" });
    });
  });

  it("AC-ACC-002 shows Password salah", async () => {
    renderForm({ kind: "WRONG_PASSWORD" });
    await submit("mawar-0000");
    expect(await screen.findByText("Password salah. Periksa lagi, lalu coba lagi.")).toBeVisible();
  });

  it("AC-ACC-003 shows the wait time and locks the form", async () => {
    renderForm({ kind: "TOO_MANY_ATTEMPTS", minutes: 12 });
    await submit("mawar-0000");
    expect(await screen.findByText("Terlalu banyak percobaan")).toBeVisible();
    expect(screen.getByText("Coba lagi dalam 12 menit.")).toBeVisible();
    expect(screen.getByLabelText("Password")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Buka galeri" })).toBeDisabled();
  });

  it("asks for a password before calling the server", async () => {
    const action = renderForm({ kind: "WRONG_PASSWORD" });
    await submit("");
    expect(await screen.findByText("Isi password dari fotografer.")).toBeVisible();
    expect(action).not.toHaveBeenCalled();
  });

  it("AC-ACC-004 reloads to the neutral page when the link stopped working", async () => {
    renderForm({ kind: "NEUTRAL" });
    await submit("mawar-4821");
    await waitFor(() => {
      expect(refresh).toHaveBeenCalled();
    });
  });
});
