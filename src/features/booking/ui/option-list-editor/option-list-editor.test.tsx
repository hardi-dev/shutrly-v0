import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { OptionListEditor } from "./option-list-editor";

function ControlledEditor() {
  const [options, setOptions] = useState<readonly string[]>([""]);
  return <OptionListEditor options={options} onChange={setOptions} />;
}

describe("OptionListEditor", () => {
  it("AC-CAT-014 adds an empty option and removes a named option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OptionListEditor options={["S"]} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Tambah pilihan" }));
    expect(onChange).toHaveBeenCalledWith(["S", ""]);

    await user.click(screen.getByRole("button", { name: "Hapus pilihan S" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("AC-CAT-015 renders an indexed option error", () => {
    render(
      <OptionListEditor
        options={["S", "s"]}
        errors={{ 1: "OPTION_DUPLICATE" }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Pilihan ini sudah ada.")).toBeInTheDocument();
  });

  it("keeps the same option field while typing, so focus stays in it (AC-SFX-009)", async () => {
    const user = userEvent.setup();
    render(<ControlledEditor />);
    const field = screen.getByRole("textbox", { name: "Pilihan 1" });
    await user.type(field, "Kampus A");
    expect(field.isConnected).toBe(true);
    expect(field).toHaveValue("Kampus A");
    expect(field).toHaveFocus();
  });
});
