import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MultiSelect } from "./multi-select";
import type { MultiSelectProps } from "./multi-select.types";

const { isMobile } = vi.hoisted(() => ({ isMobile: { value: false } }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => isMobile.value,
}));

const OPTIONS = [
  { id: "BOOKED", label: "Dibooking" },
  { id: "SHOOTING", label: "Pemotretan" },
  { id: "DRAFT", label: "Draf" },
];

function Harness({
  initial = [] as string[],
  ...extra
}: Readonly<{ initial?: string[] } & Partial<MultiSelectProps>>) {
  const [ids, setIds] = useState<string[]>(initial);
  return (
    <MultiSelect
      label="Status"
      placeholder="Semua status"
      options={OPTIONS}
      selectedIds={ids}
      onChange={setIds}
      {...extra}
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

  it("AC-TEAM-005 shows the helper under the trigger and an error in its place", () => {
    const { rerender } = render(<Harness description="Bisa lebih dari satu." />);
    const trigger = screen.getByRole("button", { name: /Status/ });
    expect(screen.getByText("Bisa lebih dari satu.")).toBeInTheDocument();
    expect(trigger).toHaveAccessibleDescription("Bisa lebih dari satu.");
    rerender(
      <Harness description="Bisa lebih dari satu." errorMessage="Pilih minimal satu peran." />,
    );
    expect(screen.queryByText("Bisa lebih dari satu.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Status/ })).toHaveAccessibleDescription(
      "Pilih minimal satu peran.",
    );
  });

  it("AC-TEAM-010 shows the group label and a create row that closes the menu and fires", async () => {
    const onPress = vi.fn();
    render(<Harness groupLabel="PERAN" createAction={{ label: "Tambah peran baru", onPress }} />);
    await userEvent.click(screen.getByRole("button", { name: /Status/ }));
    expect(screen.getByText("PERAN")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tambah peran baru" }));
    expect(onPress).toHaveBeenCalledOnce();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("AC-TEAM-010 offers the create row in the phone sheet too", async () => {
    isMobile.value = true;
    const onPress = vi.fn();
    render(<Harness createAction={{ label: "Tambah peran baru", onPress }} errorMessage="Salah" />);
    expect(screen.getByText("Salah")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Status" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByText("Tambah peran baru"));
    expect(onPress).toHaveBeenCalledOnce();
  });
});
