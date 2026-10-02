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
      "min-h-(--component-textarea-min-height)",
      "border-(--component-input-border)",
      "bg-(--component-input-background)",
    );
    expect(screen.getByText("Maksimal 500 karakter")).toBeInTheDocument();
  });

  it("associates an error message and disables input", () => {
    render(<Textarea label="Catatan" errorMessage="Wajib diisi" isDisabled />);

    expect(screen.getByRole("textbox", { name: "Catatan" })).toHaveAccessibleErrorMessage(
      "Wajib diisi",
    );
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

  it("uses an aria-label without rendering a label", () => {
    const { container } = render(<Textarea aria-label="Isi pesan" errorMessage="Wajib diisi" />);

    expect(screen.getByRole("textbox", { name: "Isi pesan" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Isi pesan" })).toHaveAccessibleErrorMessage(
      "Wajib diisi",
    );
    expect(container.querySelector("label")).toBeNull();
  });

  it("shows a trailing meta beside the helper and honours rows", () => {
    render(<Textarea label="Isi" helperText="Bantuan" trailingMeta="12 / 2.000" rows={10} />);

    expect(screen.getByRole("textbox", { name: "Isi" })).toHaveAttribute("rows", "10");
    expect(screen.getByText("12 / 2.000")).toBeInTheDocument();
    expect(screen.getByText("Bantuan")).toBeInTheDocument();
  });
});
