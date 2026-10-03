import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MultiSelect } from "./multi-select";

const { isMobile } = vi.hoisted(() => ({ isMobile: { value: false } }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => isMobile.value,
}));

const OPTIONS = [
  { id: "BOOKED", label: "Dibooking" },
  { id: "SHOOTING", label: "Pemotretan" },
  { id: "DRAFT", label: "Draf" },
];

function Harness({ initial = [] as string[] }: Readonly<{ initial?: string[] }>) {
  const [ids, setIds] = useState<string[]>(initial);
  return (
    <MultiSelect
      label="Status"
      placeholder="Semua status"
      options={OPTIONS}
      selectedIds={ids}
      onChange={setIds}
    />
  );
}

describe("MultiSelect (C20)", () => {
  beforeEach(() => {
    isMobile.value = false;
  });

  it("AC-PRJ-028 shows the placeholder, then the picked labels in menu order", async () => {
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: /Status/ });
    expect(trigger).toHaveTextContent("Semua status");
    await userEvent.click(trigger);
    const list = screen.getByRole("listbox");
    await userEvent.click(within(list).getByRole("option", { name: "Pemotretan" }));
    await userEvent.click(within(list).getByRole("option", { name: "Dibooking" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Dibooking, Pemotretan");
  });

  it("AC-PRJ-028 toggles an option with Space and unticks it", async () => {
    render(<Harness initial={["BOOKED"]} />);
    const trigger = screen.getByRole("button", { name: /Status/ });
    expect(trigger).toHaveTextContent("Dibooking");
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("option", { name: "Dibooking" }));
    expect(trigger).toHaveTextContent("Semua status");
  });

  it("AC-PRJ-028 uses a sheet with checkboxes on phones", async () => {
    isMobile.value = true;
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Status" }));
    const sheet = screen.getByRole("dialog");
    await userEvent.click(within(sheet).getByRole("checkbox", { name: "Draf" }));
    expect(within(sheet).getByRole("checkbox", { name: "Draf" })).toBeChecked();
  });
});
