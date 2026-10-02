// @vitest-environment jsdom

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import type { ItemDefinitionRecord } from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";

import { ServiceItemDialog } from "./service-item-dialog";
import type { ServiceItemDialogProps } from "./service-item-dialog.types";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

const DEFINITION: ItemDefinitionRecord = {
  id: "definition-1",
  name: "Foto edit",
  unit: "foto",
  isActive: true,
  usageCount: 0,
  valueType: "NUMBER",
  selectionRequired: true,
  selectionType: "EDIT",
};

function AddItemHarness({ action }: { readonly action: ServiceItemDialogProps["action"] }) {
  const [isOpen, setIsOpen] = useState(true);
  function open(): void {
    setIsOpen(true);
  }
  return (
    <>
      <button type="button" onClick={open}>
        Buka tambah item
      </button>
      <ServiceItemDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        workspaceId="workspace-1"
        serviceId="service-1"
        definitions={[DEFINITION]}
        items={[]}
        action={action}
      />
    </>
  );
}

describe("ServiceItemDialog", () => {
  it("resets the add form after save before it is opened again", async () => {
    const user = userEvent.setup();
    const action: ServiceItemDialogProps["action"] = vi.fn().mockResolvedValue({ ok: true });
    render(<AddItemHarness action={action} />);

    await user.click(screen.getByRole("button", { name: /Item paket/ }));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByRole("option", { name: /Foto edit/ }));
    await user.type(screen.getByRole("textbox", { name: "Nilai" }), "25");
    await user.click(screen.getByRole("button", { name: "Tambah" }));

    await waitFor(() => {
      expect(action).toHaveBeenCalledOnce();
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Buka tambah item" }));
    expect(screen.getByRole("button", { name: /Item paket/ })).toHaveTextContent("Item paket");
    expect(screen.getByRole("textbox", { name: "Nilai" })).toHaveValue("");
  });
});
