import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, type SubmitEvent } from "react";
import { describe, expect, it, vi } from "vitest";

import { TextField } from "./text-field";
import type { TextFieldProps } from "./text-field.types";

function renderField(props: Partial<TextFieldProps> = {}) {
  const onChange = vi.fn();
  const onBlur = vi.fn();
  render(
    <TextField
      label="Email"
      name="email"
      type="email"
      value=""
      onChange={onChange}
      onBlur={onBlur}
      {...props}
    />,
  );
  return { input: screen.getByLabelText("Email"), onChange, onBlur };
}

describe("TextField", () => {
  it("renders the optional suffix and helper using the C18 anatomy", () => {
    renderField({ description: "Gunakan email aktif.", isOptional: true });

    expect(screen.getByText("(opsional)")).toBeInTheDocument();
    expect(screen.getByText("Gunakan email aktif.")).toBeInTheDocument();
  });

  it("supports C03 input configurations inside the field", () => {
    renderField({ prefix: "Rp", iconLeading: "search", iconTrailing: "eye" });

    expect(screen.getByText("Rp")).toBeInTheDocument();
    expect(screen.getByTestId("input-icon-leading")).toBeInTheDocument();
    expect(screen.getByTestId("input-icon-trailing")).toBeInTheDocument();
  });

  it("forwards clickable leading and trailing icon actions to C03", async () => {
    const user = userEvent.setup();
    const onLeadingPress = vi.fn();
    const onTrailingPress = vi.fn();
    renderField({
      iconLeading: "search",
      iconLeadingAction: { label: "Cari", onPress: onLeadingPress },
      iconTrailing: "eye",
      iconTrailingAction: { label: "Tampilkan password", onPress: onTrailingPress },
    });

    await user.click(screen.getByRole("button", { name: "Cari" }));
    await user.click(screen.getByRole("button", { name: "Tampilkan password" }));

    expect(onLeadingPress).toHaveBeenCalledTimes(1);
    expect(onTrailingPress).toHaveBeenCalledTimes(1);
  });

  it("AC-FND-014 labels the input and forwards name, type and autoComplete", () => {
    const { input } = renderField({ autoComplete: "email", placeholder: "rina@studio.id" });
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("autocomplete", "email");
    expect(input).toHaveAttribute("placeholder", "rina@studio.id");
  });

  it("AC-FND-014 describes the input with the helper text and is not invalid", () => {
    const { input } = renderField({ description: "Kami kirim tautan ke email ini." });
    expect(input).toHaveAccessibleDescription("Kami kirim tautan ke email ini.");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("AC-FND-014 replaces the helper with the error and sets aria-invalid", () => {
    const { input } = renderField({
      description: "Kami kirim tautan ke email ini.",
      errorMessage: "Masukkan email yang valid",
    });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Masukkan email yang valid");
    expect(screen.queryByText("Kami kirim tautan ke email ini.")).toBeNull();
  });

  it("AC-FND-014 reports string values and blur", async () => {
    const user = userEvent.setup();
    const { input, onChange, onBlur } = renderField();
    await user.type(input, "a");
    expect(onChange).toHaveBeenCalledWith("a");
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("AC-FND-014 forwards inputRef to the <input>", () => {
    const inputRef = createRef<HTMLInputElement>();
    const { input } = renderField({ inputRef });
    expect(inputRef.current).toBe(input);
  });

  it("AC-FND-014 does not block form submission while invalid (validationBehavior=aria)", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: SubmitEvent) => {
      event.preventDefault();
    });
    render(
      <form onSubmit={onSubmit}>
        <TextField
          label="Email"
          name="email"
          value=""
          onChange={vi.fn()}
          onBlur={vi.fn()}
          errorMessage="Wajib diisi"
        />
        <button type="submit">Kirim</button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Kirim" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
