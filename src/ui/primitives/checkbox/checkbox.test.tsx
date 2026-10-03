import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "./checkbox";

describe("Checkbox (C05)", () => {
  it("AC-PRJ-028 toggles from the label and the keyboard", async () => {
    const onChange = vi.fn();
    render(
      <Checkbox label="Sertakan proyek tanpa jadwal" isSelected={false} onChange={onChange} />,
    );
    const box = screen.getByRole("checkbox", { name: "Sertakan proyek tanpa jadwal" });
    expect(box).not.toBeChecked();
    await userEvent.click(screen.getByText("Sertakan proyek tanpa jadwal"));
    expect(onChange).toHaveBeenLastCalledWith(true);
    box.focus();
    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("AC-PRJ-028 shows the checked state and ignores a disabled box", async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Pilih" isSelected onChange={onChange} isDisabled />);
    const box = screen.getByRole("checkbox", { name: "Pilih" });
    expect(box).toBeChecked();
    expect(box).toBeDisabled();
    await userEvent.click(screen.getByText("Pilih"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
