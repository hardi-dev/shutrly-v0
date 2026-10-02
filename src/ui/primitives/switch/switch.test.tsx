import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "./switch";

describe("Switch (C07)", () => {
  it("AC-CAT-007 toggles and reports the new value", async () => {
    const onChange = vi.fn();
    render(
      <Switch label="Dipakai untuk pilihan foto klien" isSelected={false} onChange={onChange} />,
    );
    const control = screen.getByRole("switch", { name: "Dipakai untuk pilihan foto klien" });
    expect(control).not.toBeChecked();
    await userEvent.click(control);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("AC-CAT-008 a disabled switch cannot change", async () => {
    const onChange = vi.fn();
    render(
      <Switch label="Dipakai untuk pilihan foto klien" isSelected isDisabled onChange={onChange} />,
    );
    expect(screen.getByRole("switch")).toBeDisabled();
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
