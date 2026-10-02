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

const RANGE_DEFINITION: ItemDefinitionRecord = {
  ...DEFINITION,
  id: "definition-range",
  name: "Jumlah orang",
  unit: "orang",
  valueType: "RANGE",
  selectionRequired: false,
  selectionType: null,
};

function AddItemHarness({
  action,
  definitions = [DEFINITION],
}: {
  readonly action: ServiceItemDialogProps["action"];
  readonly definitions?: readonly ItemDefinitionRecord[];
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
      <ServiceItemDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        workspaceId="workspace-1"
        serviceId="service-1"
        definitions={definitions}
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
    expect(screen.getByRole("textbox", { name: "Nilai" })).toHaveAttribute(
      "placeholder",
      "Contoh: 25",
    );
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

  it("shows placeholders for a range value", async () => {
    const user = userEvent.setup();
    const action: ServiceItemDialogProps["action"] = vi.fn().mockResolvedValue({ ok: true });
    render(<AddItemHarness action={action} definitions={[RANGE_DEFINITION]} />);

    await user.click(screen.getByRole("button", { name: /Item paket/ }));
    await user.click(
      within(await screen.findByRole("listbox")).getByRole("option", { name: /Jumlah orang/ }),
    );

    expect(screen.getByRole("textbox", { name: "Minimum" })).toHaveAttribute(
      "placeholder",
      "Contoh: 1",
    );
    expect(screen.getByRole("textbox", { name: "Maksimum" })).toHaveAttribute(
      "placeholder",
      "Contoh: 2",
    );
  });
});
