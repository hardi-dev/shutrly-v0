import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OptionListEditor } from "./option-list-editor";

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
});
