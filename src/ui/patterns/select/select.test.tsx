import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Select } from "./select";

const { useMobileViewport } = vi.hoisted(() => ({
  useMobileViewport: vi.fn(() => false),
}));

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport,
}));

const OPTIONS = [
  {
    id: "NUMBER",
    label: "Angka",
    description: "Satu nilai, mis. 25 foto atau 2 jam.",
    icon: "hash" as const,
  },
  {
    id: "RANGE",
    label: "Rentang",
    description: "Nilai minimum–maksimum, mis. 1–2 orang.",
    icon: "move-horizontal" as const,
  },
];

describe("Select (C19 + Menu Item/Rich)", () => {
  it("uses bottom-sheet menu rows for mobile pickers", async () => {
    useMobileViewport.mockReturnValue(true);
    const onChange = vi.fn();
    render(<Select label="Tipe nilai" options={OPTIONS} value="NUMBER" onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: /Tipe nilai/ }));

    const option = screen.getByRole("button", { name: /Angka/ });
    expect(option).toHaveClass("min-h-[52px]");
    expect(option).toHaveClass("border-t");
    expect(screen.queryByRole("option", { name: /Angka/ })).not.toBeInTheDocument();
    expect(screen.getByTestId("sheet-item-check")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Rentang/ }));
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Pilih" }));
    expect(onChange).toHaveBeenCalledWith("RANGE");
  });

  it("AC-CAT-006 shows the chosen option with its icon and changes value", async () => {
    useMobileViewport.mockReturnValue(false);
    const onChange = vi.fn();
    render(<Select label="Tipe nilai" options={OPTIONS} value="NUMBER" onChange={onChange} />);
    const trigger = screen.getByRole("button", { name: /Tipe nilai/ });
    expect(trigger).toHaveTextContent("Angka");
    expect(trigger.querySelector('[class*="component-menu-item-check"]')).toBeNull();
    await userEvent.click(trigger);
    const listbox = screen.getByRole("listbox");
    const popover = listbox.parentElement;
    expect(popover).toHaveClass("w-(--trigger-width)");
    expect(popover).not.toHaveClass("min-w-full");
    expect(within(listbox).getByRole("option", { name: /Angka.*Satu nilai/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.click(within(listbox).getByRole("option", { name: /Rentang/ }));
    expect(onChange).toHaveBeenCalledWith("RANGE");
  });

  it("AC-CAT-008 a disabled select shows its value and does not open", () => {
    useMobileViewport.mockReturnValue(false);
    render(
      <Select label="Tipe nilai" options={OPTIONS} value="NUMBER" onChange={vi.fn()} isDisabled />,
    );
    expect(screen.getByRole("button", { name: /Tipe nilai/ })).toBeDisabled();
  });

  it("shows a field error", () => {
    useMobileViewport.mockReturnValue(false);
    render(
      <Select
        label="Kategori"
        options={[]}
        value={null}
        placeholder="Pilih kategori"
        onChange={vi.fn()}
        errorMessage="Pilih kategori."
      />,
    );
    expect(screen.getByText("Pilih kategori.")).toBeInTheDocument();
  });
});
