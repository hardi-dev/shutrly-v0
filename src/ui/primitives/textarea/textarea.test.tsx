import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Textarea } from "./textarea";

describe("Textarea (C04)", () => {
  it("renders a labelled multiline field with helper text", () => {
    render(<Textarea label="Catatan" helperText="Maksimal 500 karakter" />);

    const textarea = screen.getByRole("textbox", { name: "Catatan" });
    expect(textarea).toHaveAttribute("rows", "3");
    expect(textarea).toHaveClass(
      "min-h-24",
      "border-(--component-input-border)",
      "bg-(--component-input-background)",
    );
    expect(screen.getByText("Maksimal 500 karakter")).toBeInTheDocument();
  });

  it("associates an error message and disables input", () => {
    render(<Textarea label="Catatan" errorMessage="Wajib diisi" isDisabled />);

    expect(screen.getByRole("textbox", { name: "Catatan" })).toBeDisabled();
    expect(screen.getByText("Wajib diisi")).toBeInTheDocument();
  });

  it("reports value changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea label="Catatan" onChange={onChange} />);

    await user.type(screen.getByRole("textbox", { name: "Catatan" }), "Halo");
    expect(onChange).toHaveBeenLastCalledWith("Halo");
  });
});
