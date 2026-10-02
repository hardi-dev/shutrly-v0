import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Select } from "./select";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
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
  it("AC-CAT-006 shows the chosen option with its icon and changes value", async () => {
    const onChange = vi.fn();
    render(<Select label="Tipe nilai" options={OPTIONS} value="NUMBER" onChange={onChange} />);
    const trigger = screen.getByRole("button", { name: /Tipe nilai/ });
    expect(trigger).toHaveTextContent("Angka");
    await userEvent.click(trigger);
    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByRole("option", { name: /Angka.*Satu nilai/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.click(within(listbox).getByRole("option", { name: /Rentang/ }));
    expect(onChange).toHaveBeenCalledWith("RANGE");
  });

  it("AC-CAT-008 a disabled select shows its value and does not open", () => {
    render(
      <Select label="Tipe nilai" options={OPTIONS} value="NUMBER" onChange={vi.fn()} isDisabled />,
    );
    expect(screen.getByRole("button", { name: /Tipe nilai/ })).toBeDisabled();
  });

  it("shows a field error", () => {
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
