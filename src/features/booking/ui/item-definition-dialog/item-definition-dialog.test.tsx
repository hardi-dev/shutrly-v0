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
});
