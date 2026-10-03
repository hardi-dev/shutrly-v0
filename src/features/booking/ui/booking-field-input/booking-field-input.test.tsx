import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const useMobileViewport = vi.hoisted(() => vi.fn(() => false));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));

const { BookingFieldInput } = await import("./booking-field-input");

const field = (overrides: Record<string, unknown>) => ({
  key: "k",
  name: "Nama kampus",
  fieldType: "TEXT" as const,
  isRequired: true,
  options: null,
  ...overrides,
});

describe("BookingFieldInput (A-3)", () => {
  it("A-3 renders a text field and reports what is typed", async () => {
    const onChange = vi.fn();
    render(<BookingFieldInput field={field({})} value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox", { name: "Nama kampus" }), "U");
    expect(onChange).toHaveBeenCalledWith("U");
  });

  it("A-3 marks an optional field and shows its error", () => {
    render(
      <BookingFieldInput
        field={field({ isRequired: false })}
        value=""
        onChange={vi.fn()}
        errorMessage="Isi Nama kampus."
      />,
    );
    expect(screen.getByText("(opsional)")).toBeInTheDocument();
    expect(screen.getByText("Isi Nama kampus.")).toBeInTheDocument();
  });

  it("A-3 renders a long text field", () => {
    render(
      <BookingFieldInput
        field={field({ fieldType: "TEXTAREA", name: "Catatan" })}
        value="halo"
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("textbox", { name: /Catatan/ })).toHaveValue("halo");
  });

  it("A-3 renders a date field as 10 Nov 2026 and reports an ISO date", async () => {
    const onChange = vi.fn();
    render(
      <BookingFieldInput
        field={field({ fieldType: "DATE", name: "Tanggal wisuda" })}
        value="2026-11-10"
        onChange={onChange}
      />,
    );
    const trigger = screen.getByRole("button", { name: /Tanggal wisuda/ });
    expect(trigger).toHaveTextContent("10 Nov 2026");
    await userEvent.click(trigger);
    await userEvent.click(screen.getByText("12"));
    expect(onChange).toHaveBeenCalledWith("2026-11-12");
  });

  it("A-3 renders a choice field from its options with a Pilih placeholder", async () => {
    const onChange = vi.fn();
    render(
      <BookingFieldInput
        field={field({
          fieldType: "SELECT",
          name: "Ukuran toga",
          options: ["S", "M", "L"],
          isRequired: false,
        })}
        value=""
        onChange={onChange}
      />,
    );
    const trigger = screen.getByRole("button", { name: /Ukuran toga/ });
    expect(trigger).toHaveTextContent("Pilih ukuran toga");
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("option", { name: "M" }));
    expect(onChange).toHaveBeenCalledWith("M");
  });

  it("A-3 renders a yes/no field with no default and reports a boolean", async () => {
    const onChange = vi.fn();
    render(
      <BookingFieldInput
        field={field({ fieldType: "BOOLEAN", name: "Pakai toga" })}
        value={null}
        onChange={onChange}
      />,
    );
    const trigger = screen.getByRole("button", { name: /Pakai toga/ });
    expect(trigger).toHaveTextContent("Pilih pakai toga");
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("option", { name: "Ya" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
