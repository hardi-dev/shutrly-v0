import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { showToast } from "@/ui/patterns/toast/toast";

import { WORKSPACE_FIELD_ERROR_COPY as SETTINGS_FIELD_ERROR_COPY } from "../workspace-field-error/workspace-field-error.copy";
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

function renderScreen(action = vi.fn().mockResolvedValue(undefined)) {
  render(<SettingsScreen action={action} profile={profile} />);
  return action;
}

function save() {
  return userEvent.click(screen.getByRole("button", { name: SETTINGS_COPY.save }));
}

describe("SettingsScreen", () => {
  it("AC-WS-016 groups the fields in three titled sections and shows IDR read-only", () => {
    renderScreen();
    for (const title of [
      SETTINGS_COPY.brandTitle,
      SETTINGS_COPY.contactTitle,
      SETTINGS_COPY.invoiceTitle,
    ]) {
      expect(screen.getByRole("region", { name: title })).toBeInTheDocument();
    }
    expect(screen.getByRole("textbox", { name: SETTINGS_COPY.currency })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: SETTINGS_COPY.currency })).toHaveValue(
      SETTINGS_COPY.currencyValue,
    );
  });

  it("AC-WS-016 saves the edited values, uppercasing the prefix, and confirms with a toast", async () => {
    const action = renderScreen();
    const prefix = screen.getByRole("textbox", { name: SETTINGS_COPY.prefix });
    await userEvent.clear(prefix);
    await userEvent.type(prefix, "as");
    await save();
    expect(action).toHaveBeenCalledWith(expect.objectContaining({ invoicePrefix: "AS" }));
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ tone: "success", title: SETTINGS_COPY.saved }),
    );
  });

  it("AC-WS-017 shows client field errors and does not submit", async () => {
    const action = renderScreen();
    const email = screen.getByRole("textbox", { name: /Email kontak/u });
    await userEvent.clear(email);
    await userEvent.type(email, "halo@aster");
    await save();
    expect(screen.getByText(SETTINGS_FIELD_ERROR_COPY["email.invalid"])).toBeInTheDocument();
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
    expect(screen.getByText(SETTINGS_FIELD_ERROR_COPY["name.duplicate"])).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: SETTINGS_COPY.name })).toHaveFocus();
  });

  it("AC-WS-024 keeps the values and shows a retryable server error when the save fails", async () => {
    renderScreen(vi.fn().mockRejectedValue(new Error("offline")));
    await save();
    expect(screen.getByText(SETTINGS_COPY.serverErrorTitle)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: SETTINGS_COPY.name })).toHaveValue(profile.name);
    expect(screen.getByRole("button", { name: SETTINGS_COPY.save })).toBeEnabled();
  });
});
