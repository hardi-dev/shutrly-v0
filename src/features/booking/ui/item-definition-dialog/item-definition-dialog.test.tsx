// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { pressEnterInField } from "@tests/support/forms/implicit-submit";
import { useLocale } from "next-intl";
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
    await user.click(screen.getByRole("button", { name: /Format nilai/ }));
    await user.click(screen.getByRole("option", { name: /Rentang/ }));
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(action).toHaveBeenCalledOnce();
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Buka tambah item" }));
    expect(screen.getByRole("textbox", { name: "Nama item" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Satuan" })).toHaveValue("");
    expect(screen.getByRole("button", { name: /Format nilai/ })).toHaveTextContent("Angka");
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
    await user.click(screen.getByRole("radio", { name: /Foto untuk dicetak/ }));
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
    expect(screen.getByRole("radio", { name: /Foto untuk diedit/ })).toBeChecked();
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
          defaultKey: null,
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
    expect(screen.getByRole("radio", { name: /Foto untuk dicetak/ })).toBeDisabled();
    expect(screen.getByRole("switch", { name: "Klien bisa memberi catatan" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Nama item" })).toBeEnabled();
  });

  it("D-18 saving an unchanged keyed label submits the stored name, not a rename", async () => {
    vi.mocked(useLocale).mockReturnValue("en");
    try {
      const updateAction = vi.fn().mockResolvedValue({ ok: true });
      render(
        <ItemDefinitionDialog
          isOpen
          onOpenChange={vi.fn()}
          workspaceId="workspace-1"
          action={vi.fn()}
          updateAction={updateAction}
          definition={{
            id: "definition-1",
            defaultKey: "EDITED_PHOTOS",
            name: "Foto edit",
            valueType: "NUMBER",
            unit: "foto",
            selectionRequired: true,
            pickMode: "COUNT",
            allowsPickNotes: true,
            isActive: true,
            usageCount: 0,
          }}
        />,
      );
      expect(screen.getByDisplayValue("Edited photos")).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
      await waitFor(() => {
        expect(updateAction).toHaveBeenCalledWith(
          "workspace-1",
          "definition-1",
          expect.objectContaining({ name: "Foto edit", unit: "foto" }),
        );
      });
    } finally {
      vi.mocked(useLocale).mockReturnValue("id");
    }
  });
});

describe("ItemDefinitionDialog submits on Enter (AC-SFX-009, AC-SFX-010)", () => {
  it("AC-SFX-009 Enter in the name field saves with the same input as Save", async () => {
    const clicked: ItemDefinitionDialogProps["action"] = vi.fn().mockResolvedValue({ ok: true });
    const first = render(
      <ItemDefinitionDialog
        isOpen
        onOpenChange={vi.fn()}
        workspaceId="workspace-1"
        action={clicked}
      />,
    );
    await userEvent.type(screen.getByRole("textbox", { name: "Nama item" }), "Jumlah orang");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => {
      expect(clicked).toHaveBeenCalledTimes(1);
    });
    first.unmount();

    const entered: ItemDefinitionDialogProps["action"] = vi.fn().mockResolvedValue({ ok: true });
    render(
      <ItemDefinitionDialog
        isOpen
        onOpenChange={vi.fn()}
        workspaceId="workspace-1"
        action={entered}
      />,
    );
    const name = screen.getByRole("textbox", { name: "Nama item" });
    await userEvent.type(name, "Jumlah orang");
    pressEnterInField(name, screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => {
      expect(entered).toHaveBeenCalledTimes(1);
    });
    expect(entered).toHaveBeenCalledWith(...vi.mocked(clicked).mock.calls[0]);
  });

  it("AC-SFX-010 a second Enter while saving sends no second save", async () => {
    const action: ItemDefinitionDialogProps["action"] = vi.fn(
      () => new Promise<never>(() => undefined),
    );
    render(
      <ItemDefinitionDialog
        isOpen
        onOpenChange={vi.fn()}
        workspaceId="workspace-1"
        action={action}
      />,
    );
    const name = screen.getByRole("textbox", { name: "Nama item" });
    await userEvent.type(name, "Jumlah orang");
    const primary = screen.getByRole("button", { name: "Simpan" });
    pressEnterInField(name, primary);
    pressEnterInField(name, primary);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("AC-SFX-009 Enter shows the same server field error as Save", async () => {
    const action: ItemDefinitionDialogProps["action"] = vi.fn().mockResolvedValue({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { name: "NAME_TAKEN" },
    });
    render(
      <ItemDefinitionDialog
        isOpen
        onOpenChange={vi.fn()}
        workspaceId="workspace-1"
        action={action}
      />,
    );
    const name = screen.getByRole("textbox", { name: "Nama item" });
    await userEvent.type(name, "Jumlah orang");
    pressEnterInField(name, screen.getByRole("button", { name: "Simpan" }));
    expect((await screen.findAllByText(/sudah/)).length).toBeGreaterThan(0);
  });
});
