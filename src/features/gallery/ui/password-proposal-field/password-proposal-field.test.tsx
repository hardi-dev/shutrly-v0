import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PasswordProposalField } from "./password-proposal-field";

function renderField(overrides: Partial<Parameters<typeof PasswordProposalField>[0]> = {}) {
  const props = {
    label: "Password galeri",
    description: "Dibuat otomatis, mudah diketik klien.",
    field: {
      name: "password",
      value: "mawar-4821",
      onChange: vi.fn(),
      onBlur: vi.fn(),
      ref: vi.fn(),
    },
    errorMessage: undefined,
    isRegenerating: false,
    onRegenerate: vi.fn(),
    ...overrides,
  };
  render(<PasswordProposalField {...props} />);
  return props;
}

describe("PasswordProposalField", () => {
  it("AC-GAL-001 shows the proposal with its helper and a Buat ulang button", async () => {
    const props = renderField();
    expect(screen.getByRole("textbox", { name: "Password galeri" })).toHaveValue("mawar-4821");
    expect(screen.getByText("Dibuat otomatis, mudah diketik klien.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Buat ulang" }));
    expect(props.onRegenerate).toHaveBeenCalled();
  });

  it("AC-GAL-001 puts the button inside the input, so it never drifts from it", () => {
    renderField();
    const button = screen.getByRole("button", { name: "Buat ulang" });
    const input = screen.getByRole("textbox", { name: "Password galeri" });
    expect(input.parentElement?.contains(button)).toBe(true);
  });

  it("C-007 disables the button while a new proposal is loading", () => {
    renderField({ isRegenerating: true });
    expect(screen.getByRole("button", { name: "Buat ulang" })).toBeDisabled();
  });

  it("AC-GAL-002 shows a field error in place of the helper, and keeps the button that fixes it", () => {
    renderField({ errorMessage: "Minimal 6 karakter." });
    expect(screen.getByText("Minimal 6 karakter.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buat ulang" })).toBeEnabled();
  });

  it("C-007 leaves the field itself editable while a new proposal is loading", () => {
    renderField({ isRegenerating: true });
    expect(screen.getByRole("textbox", { name: "Password galeri" })).toBeEnabled();
  });
});
