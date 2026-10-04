import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RadioGroup } from "./radio-group";

const OPTIONS = [
  { value: "NONE", label: "Tidak ada kedaluwarsa" },
  { value: "DATE", label: "Sampai tanggal" },
  { value: "DAYS", label: "Selama beberapa hari" },
];

describe("RadioGroup (C06)", () => {
  it("AC-GAL-026 names the group and selects from a label click", async () => {
    const onChange = vi.fn();
    render(<RadioGroup label="Kedaluwarsa" options={OPTIONS} value="NONE" onChange={onChange} />);
    expect(screen.getByRole("radiogroup", { name: "Kedaluwarsa" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Tidak ada kedaluwarsa" })).toBeChecked();
    await userEvent.click(screen.getByText("Sampai tanggal"));
    expect(onChange).toHaveBeenLastCalledWith("DATE");
  });

  it("AC-GAL-026 moves the selection with the arrow keys", async () => {
    const onChange = vi.fn();
    render(<RadioGroup label="Kedaluwarsa" options={OPTIONS} value="NONE" onChange={onChange} />);
    screen.getByRole("radio", { name: "Tidak ada kedaluwarsa" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(onChange).toHaveBeenLastCalledWith("DATE");
  });
});
