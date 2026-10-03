import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Combobox } from "./combobox";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => true,
}));

const CLIENTS = [{ id: "c1", name: "Rina", note: "+62 812-3456-7890 · 2 proyek" }];
const renderClient = (client: (typeof CLIENTS)[number]) => ({
  label: client.name,
  description: client.note,
});

function renderPicker(onSelect: (id: string) => void) {
  render(
    <Combobox
      label="Klien"
      placeholder="Cari atau tambah klien"
      items={CLIENTS}
      selectedId={null}
      inputValue=""
      onInputChange={vi.fn()}
      onSelect={onSelect}
      renderItem={renderClient}
      groupLabel="KLIEN · 1 COCOK"
    />,
  );
}

describe("Combobox on phones", () => {
  it("AC-PRJ-006 opens a bottom sheet with the matches and picks one", async () => {
    const onSelect = vi.fn();
    renderPicker(onSelect);
    await userEvent.click(screen.getByRole("button", { name: "Klien" }));
    const sheet = screen.getByRole("dialog");
    expect(within(sheet).getByText("KLIEN · 1 COCOK")).toBeInTheDocument();
    await userEvent.click(within(sheet).getByRole("button", { name: /Rina.*2 proyek/ }));
    expect(onSelect).toHaveBeenCalledWith("c1");
  });
});
