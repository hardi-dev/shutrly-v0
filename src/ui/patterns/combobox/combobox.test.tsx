import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Combobox } from "./combobox";

const CLIENTS = [
  { id: "c1", name: "Rina", note: "+62 812-3456-7890 · 2 proyek" },
  { id: "c2", name: "Rina Kartika", note: "Belum ada nomor WhatsApp" },
];

const renderClient = (client: (typeof CLIENTS)[number]) => ({
  label: client.name,
  description: client.note,
});

interface HarnessProps {
  readonly onSelect?: (id: string) => void;
  readonly onCreate?: (query: string) => void;
  readonly onInputChange?: (text: string) => void;
  readonly errorMessage?: string;
}

function Harness({ onSelect, onCreate, onInputChange, errorMessage }: Readonly<HarnessProps>) {
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const handleInput = (value: string) => {
    setText(value);
    onInputChange?.(value);
  };
  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect?.(id);
  };
  return (
    <Combobox
      label="Klien"
      placeholder="Cari atau tambah klien"
      items={CLIENTS}
      selectedId={selected}
      inputValue={text}
      onInputChange={handleInput}
      onSelect={handleSelect}
      renderItem={renderClient}
      groupLabel="KLIEN · 2 COCOK"
      createLabel="Tambah klien baru “Rin”"
      onCreate={onCreate}
      description="Pilih klien"
      errorMessage={errorMessage}
    />
  );
}

describe("Combobox (C36)", () => {
  it("AC-PRJ-006 reports what is typed", async () => {
    const onInputChange = vi.fn();
    render(<Harness onInputChange={onInputChange} />);
    await userEvent.type(screen.getByRole("combobox", { name: "Klien" }), "Ri");
    expect(onInputChange).toHaveBeenLastCalledWith("Ri");
  });

  it("AC-PRJ-006 shows the group label, the matches with their note and the create row", async () => {
    render(<Harness onCreate={vi.fn()} />);
    await userEvent.type(screen.getByRole("combobox", { name: "Klien" }), "Rin");
    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByText("KLIEN · 2 COCOK")).toBeInTheDocument();
    expect(within(listbox).getByRole("option", { name: /Rina.*2 proyek/ })).toBeInTheDocument();
    expect(
      within(listbox).getByRole("option", { name: /Belum ada nomor WhatsApp/ }),
    ).toBeInTheDocument();
    expect(
      within(listbox).getByRole("option", { name: "Tambah klien baru “Rin”" }),
    ).toBeInTheDocument();
  });

  it("AC-PRJ-006 picks a match with the arrow keys and Enter, then closes", async () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    const input = screen.getByRole("combobox", { name: "Klien" });
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith("c2");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("AC-PRJ-006 Escape closes the menu and keeps the query", async () => {
    render(<Harness />);
    const input = screen.getByRole("combobox", { name: "Klien" });
    await userEvent.type(input, "Rin");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
    expect(input).toHaveValue("Rin");
  });

  it("AC-PRJ-013 the create row calls onCreate with the query and selects nothing", async () => {
    const onCreate = vi.fn();
    const onSelect = vi.fn();
    render(<Harness onCreate={onCreate} onSelect={onSelect} />);
    const input = screen.getByRole("combobox", { name: "Klien" });
    await userEvent.type(input, "Rin");
    await userEvent.click(screen.getByRole("option", { name: "Tambah klien baru “Rin”" }));
    expect(onCreate).toHaveBeenCalledWith("Rin");
    expect(onSelect).not.toHaveBeenCalled();
    expect(input).toHaveValue("Rin");
  });

  it("AC-PRJ-012 shows the error instead of the helper", () => {
    render(<Harness errorMessage="Klien ini sudah diarsipkan. Pilih klien lain." />);
    expect(screen.getByText("Klien ini sudah diarsipkan. Pilih klien lain.")).toBeInTheDocument();
    expect(screen.queryByText("Pilih klien")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Klien" })).toHaveAttribute("aria-invalid", "true");
  });

  it("opens the menu inline under the field at phone width", async () => {
    window.innerWidth = 390;
    render(<Harness />);
    await userEvent.click(screen.getByRole("combobox", { name: "Klien" }));
    expect(screen.getByRole("listbox").parentElement).toHaveClass("w-(--trigger-width)");
  });
});
