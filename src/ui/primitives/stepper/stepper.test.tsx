// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Stepper } from "./stepper";

function renderStepper(value: number, max = 4, onChange = vi.fn()) {
  render(<Stepper label="Jumlah cetak" value={value} onChange={onChange} max={max} />);
  return onChange;
}

describe("Stepper (C08)", () => {
  it("AC-SEL-018 is a spinbutton with its value and bounds", () => {
    renderStepper(2);
    const field = screen.getByRole("textbox", { name: "Jumlah cetak" });
    expect(field.getAttribute("aria-valuenow") ?? (field as HTMLInputElement).value).toBe("2");
  });

  it("AC-SEL-018 raises and lowers the value by one", async () => {
    const onChange = renderStepper(2);
    await userEvent.click(screen.getByRole("button", { name: "Tambah" }));
    expect(onChange).toHaveBeenLastCalledWith(3);
    await userEvent.click(screen.getByRole("button", { name: "Kurangi" }));
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it("A-9 disables − at the minimum and + at the places left", () => {
    renderStepper(1, 1);
    expect(screen.getByRole("button", { name: "Kurangi" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Tambah" }).hasAttribute("disabled")).toBe(true);
  });

  it("A-9 never offers a value above the maximum", async () => {
    const onChange = renderStepper(2, 2);
    await userEvent.click(screen.getByRole("button", { name: "Tambah" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
