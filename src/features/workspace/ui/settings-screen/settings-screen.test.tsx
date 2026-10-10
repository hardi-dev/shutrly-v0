import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it, vi } from "vitest";

import type { AppLocale } from "@/shared/locale/locale.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { SettingsScreen } from "./settings-screen";
import { SETTINGS_COPY } from "./settings-screen.copy";

vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const profile = {
  name: "Aster Wedding",
  brandName: "Aster Wedding Studio",
  contactEmail: "halo@asterwedding.id",
  phone: "+62 812 3456 7890",
  address: "Jl. Kemang Raya No. 12",
  invoicePrefix: "AW",
  currency: "IDR",
};

const copy = SETTINGS_COPY.messages.id;

function renderScreen(action = vi.fn().mockResolvedValue(undefined), locale: AppLocale = "id") {
  renderInLocale(<SettingsScreen action={action} profile={profile} />, locale);
  return action;
}

function save() {
  return userEvent.click(screen.getByRole("button", { name: copy.save }));
}

describe("SettingsScreen", () => {
  it("AC-L10N-002 labels the sections and the read-only currency in English", () => {
    renderScreen(undefined, "en");
    expect(screen.getByRole("region", { name: "Brand identity" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Contact details" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Invoices" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Currency" })).toHaveValue(
      "IDR — Indonesian rupiah",
    );
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("AC-WS-016 groups the fields in three titled sections and shows IDR read-only", () => {
    renderScreen();
    for (const title of [copy.brandTitle, copy.contactTitle, copy.invoiceTitle]) {
      expect(screen.getByRole("region", { name: title })).toBeInTheDocument();
    }
    expect(screen.getByRole("textbox", { name: copy.currency })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: copy.currency })).toHaveValue(copy.currencyValue);
  });

  it("AC-WS-016 saves the edited values, uppercasing the prefix, and confirms with a toast", async () => {
    const action = renderScreen();
    const prefix = screen.getByRole("textbox", { name: copy.prefix });
    await userEvent.clear(prefix);
    await userEvent.type(prefix, "as");
    await save();
    expect(action).toHaveBeenCalledWith(expect.objectContaining({ invoicePrefix: "AS" }));
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ tone: "success", title: copy.saved }),
    );
  });

  it("AC-WS-017 shows client field errors and does not submit", async () => {
    const action = renderScreen();
    const email = screen.getByRole("textbox", { name: /Email kontak/u });
    await userEvent.clear(email);
    await userEvent.type(email, "halo@aster");
    await save();
    expect(
      screen.getByText("Masukkan email yang valid, misalnya halo@studio.id."),
    ).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("AC-WS-017 A-2 puts the server's duplicate-name error on the name field", async () => {
    renderScreen(
      vi.fn().mockResolvedValue({
        ok: false,
        code: "DUPLICATE_NAME",
        fieldErrors: { name: "name.duplicate" },
      }),
    );
    await save();
    expect(screen.getByText("Kamu sudah punya ruang kerja dengan nama ini.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: copy.name })).toHaveFocus();
  });

  it("AC-WS-024 keeps the values and shows a retryable server error when the save fails", async () => {
    renderScreen(vi.fn().mockRejectedValue(new Error("offline")));
    await save();
    expect(screen.getByText(copy.serverErrorTitle)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: copy.name })).toHaveValue(profile.name);
    expect(screen.getByRole("button", { name: copy.save })).toBeEnabled();
  });
});
