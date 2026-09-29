import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { toastQueue, ToastRegion } from "@/ui/patterns/toast/toast";

import { SettingsScreen } from "./settings-screen";

const profile = {
  name: "QA Mobile Workspace",
  brandName: "QA Mobile Workspace",
  contactEmail: "owner@example.com",
  phone: "+62 81234567890",
  address: "Jl. Kemang Raya",
  invoicePrefix: "QMW",
  currency: "IDR",
};

describe("SettingsScreen", () => {
  afterEach(() => {
    toastQueue.clear();
  });

  it("renders the fixed currency as muted and non-interactive", () => {
    render(<SettingsScreen action={vi.fn()} profile={profile} />);

    expect(screen.getByRole("textbox", { name: "Mata uang" })).toBeDisabled();
    expect(screen.getByText("Saat ini Shutrly hanya mendukung mata uang IDR.")).toBeInTheDocument();
  });

  it("shows the design-system prefix error and skips submit for an invalid prefix", async () => {
    const user = userEvent.setup();
    const action = vi.fn(() => Promise.resolve());

    render(<SettingsScreen action={action} profile={profile} />);

    const prefix = screen.getByRole("textbox", { name: "Prefiks invoice" });
    await user.clear(prefix);
    await user.type(prefix, "A");
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));

    expect(await screen.findByText("Prefiks harus 2–6 huruf atau angka.")).toBeInTheDocument();
    expect(screen.getByTestId("input-icon-trailing")).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("shows the design-system email error and skips submit for an invalid email", async () => {
    const user = userEvent.setup();
    const action = vi.fn(() => Promise.resolve());

    render(<SettingsScreen action={action} profile={profile} />);

    const email = screen.getByRole("textbox", { name: "Email kontak" });
    await user.clear(email);
    await user.type(email, "not-an-email");
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));

    expect(
      await screen.findByText("Masukkan email yang valid, mis. halo@studio.id"),
    ).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("shows a success toast after the settings action resolves", async () => {
    const user = userEvent.setup();
    const action = vi.fn(() => Promise.resolve());

    render(
      <>
        <SettingsScreen action={action} profile={profile} />
        <ToastRegion />
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));

    expect(await screen.findByRole("alertdialog")).toHaveTextContent("Perubahan tersimpan");
  });
});
