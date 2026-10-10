// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ItemDefinitionDialog } from "./item-definition-dialog";
import type { ItemDefinitionDialogProps } from "./item-definition-dialog.types";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

function AddDefinitionHarness({
  action,
}: {
  readonly action: ItemDefinitionDialogProps["action"];
}) {
  const [isOpen, setIsOpen] = useState(true);
  function open(): void {
    setIsOpen(true);
  }
  return (
    <>
      <button type="button" onClick={open}>
        Buka tambah item
      </button>
      <ItemDefinitionDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        workspaceId="workspace-1"
        action={action}
      />
    </>
  );
}

describe("ItemDefinitionDialog", () => {
  it("resets the add form after save before it is opened again", async () => {
    const user = userEvent.setup();
    const action: ItemDefinitionDialogProps["action"] = vi.fn().mockResolvedValue({ ok: true });
    render(<AddDefinitionHarness action={action} />);

    expect(screen.getByRole("textbox", { name: "Nama item" })).toHaveAttribute(
      "placeholder",
      "Contoh: Jumlah orang",
    );
    expect(screen.getByRole("textbox", { name: "Satuan" })).toHaveAttribute(
      "placeholder",
      "Contoh: orang",
    );
    await user.type(screen.getByRole("textbox", { name: "Nama item" }), "Jumlah orang");
    await user.type(screen.getByRole("textbox", { name: "Satuan" }), "orang");
    await user.click(screen.getByRole("button", { name: /Tipe nilai/ }));
    await user.click(screen.getByRole("option", { name: /Rentang/ }));
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(action).toHaveBeenCalledOnce();
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Buka tambah item" }));
    expect(screen.getByRole("textbox", { name: "Nama item" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Satuan" })).toHaveValue("");
    expect(screen.getByRole("button", { name: /Tipe nilai/ })).toHaveTextContent("Angka");
  });

  it("AC-CAT-001 hides the pick settings while the item is not used for client selection", () => {
    render(<AddDefinitionHarness action={vi.fn()} />);
    expect(screen.queryByRole("radiogroup", { name: "Cara klien memilih" })).toBeNull();
    expect(screen.queryByRole("switch", { name: "Klien bisa memberi catatan" })).toBeNull();
  });

  it("AC-CAT-001 sends a quantity pick mode with notes off for a studio's own item", async () => {
    const user = userEvent.setup();
    const action: ItemDefinitionDialogProps["action"] = vi.fn().mockResolvedValue({ ok: true });
    render(<AddDefinitionHarness action={action} />);
    await user.type(screen.getByRole("textbox", { name: "Nama item" }), "Bingkai");
    await user.click(screen.getByRole("switch", { name: "Dipakai untuk pilihan foto klien" }));
    await user.click(screen.getByRole("radio", { name: /Jumlah per foto/ }));
    await user.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => {
      expect(action).toHaveBeenCalledWith(
        "workspace-1",
        expect.objectContaining({
          selectionRequired: true,
          pickMode: "QUANTITY",
          allowsPickNotes: false,
        }),
      );
    });
  });

  it("AC-CAT-001 AC-SEL-021 sends count mode with client notes on", async () => {
    const user = userEvent.setup();
    const action: ItemDefinitionDialogProps["action"] = vi.fn().mockResolvedValue({ ok: true });
    render(<AddDefinitionHarness action={action} />);
    await user.type(screen.getByRole("textbox", { name: "Nama item" }), "Foto album");
    await user.click(screen.getByRole("switch", { name: "Dipakai untuk pilihan foto klien" }));
    expect(screen.getByRole("radio", { name: /Hitung foto/ })).toBeChecked();
    await user.click(screen.getByRole("switch", { name: "Klien bisa memberi catatan" }));
    await user.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => {
      expect(action).toHaveBeenCalledWith(
        "workspace-1",
        expect.objectContaining({ pickMode: "COUNT", allowsPickNotes: true }),
      );
    });
  });

  it("AC-CAT-001 BR-CAT-010 locks the pick settings of an item in use", () => {
    render(
      <ItemDefinitionDialog
        isOpen
        onOpenChange={vi.fn()}
        workspaceId="workspace-1"
        action={vi.fn()}
        definition={{
          id: "definition-1",
          name: "Foto cetak",
          valueType: "NUMBER",
          unit: "lembar",
          selectionRequired: true,
          pickMode: "QUANTITY",
          allowsPickNotes: false,
          isActive: true,
          usageCount: 2,
        }}
      />,
    );
    expect(screen.getByText("Pengaturan pilihan dikunci")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Jumlah per foto/ })).toBeDisabled();
    expect(screen.getByRole("switch", { name: "Klien bisa memberi catatan" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Nama item" })).toBeEnabled();
  });
});
