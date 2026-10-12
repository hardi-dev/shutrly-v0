// @vitest-environment jsdom

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { pressEnterInField } from "@tests/support/forms/implicit-submit";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import type { ItemDefinitionRecord } from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";

import { ServiceItemDialog } from "./service-item-dialog";
import type { ServiceItemDialogProps } from "./service-item-dialog.types";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

const DEFINITION: ItemDefinitionRecord = {
  defaultKey: null,
  id: "definition-1",
  name: "Foto edit",
  unit: "foto",
  isActive: true,
  usageCount: 0,
  valueType: "NUMBER",
  selectionRequired: true,
  pickMode: "COUNT",
  allowsPickNotes: true,
};

const RANGE_DEFINITION: ItemDefinitionRecord = {
  ...DEFINITION,
  id: "definition-range",
  name: "Jumlah orang",
  unit: "orang",
  valueType: "RANGE",
  selectionRequired: false,
  pickMode: null,
  allowsPickNotes: false,
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

    await user.click(screen.getByRole("button", { name: /Isi paket/ }));
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
    expect(screen.getByRole("button", { name: /Isi paket/ })).toHaveTextContent("Isi paket");
    expect(screen.getByRole("textbox", { name: "Nilai" })).toHaveValue("");
  });

  it("shows placeholders for a range value", async () => {
    const user = userEvent.setup();
    const action: ServiceItemDialogProps["action"] = vi.fn().mockResolvedValue({ ok: true });
    render(<AddItemHarness action={action} definitions={[RANGE_DEFINITION]} />);

    await user.click(screen.getByRole("button", { name: /Isi paket/ }));
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

describe("ServiceItemDialog submits on Enter (AC-SFX-009, AC-SFX-010)", () => {
  const props = {
    isOpen: true,
    onOpenChange: vi.fn(),
    workspaceId: "workspace-1",
    serviceId: "service-1",
    definitions: [DEFINITION],
    items: [],
  } as const;

  async function chooseDefinitionAndType(value: string) {
    await userEvent.click(screen.getByRole("button", { name: /Isi paket/ }));
    await userEvent.click(
      within(await screen.findByRole("listbox")).getByRole("option", { name: /Foto edit/ }),
    );
    const field = screen.getByRole("textbox", { name: "Nilai" });
    await userEvent.type(field, value);
    return field;
  }

  it("AC-SFX-009 Enter in the value field saves once with the same input as Add", async () => {
    const action: ServiceItemDialogProps["action"] = vi.fn().mockResolvedValue({ ok: true });
    render(<ServiceItemDialog {...props} action={action} />);
    const field = await chooseDefinitionAndType("25");
    pressEnterInField(field, screen.getByRole("button", { name: "Tambah" }));
    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(1);
    });
    expect(action).toHaveBeenCalledWith("workspace-1", "service-1", {
      definitionId: "definition-1",
      value: { type: "NUMBER", value: "25" },
    });
  });

  it("AC-SFX-010 a second Enter while saving sends no second save", async () => {
    const action: ServiceItemDialogProps["action"] = vi.fn(
      () => new Promise<never>(() => undefined),
    );
    render(<ServiceItemDialog {...props} action={action} />);
    const field = await chooseDefinitionAndType("25");
    const primary = screen.getByRole("button", { name: "Tambah" });
    pressEnterInField(field, primary);
    pressEnterInField(field, primary);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("AC-SFX-009 Enter shows the same field error as Add", async () => {
    const action: ServiceItemDialogProps["action"] = vi.fn().mockResolvedValue({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { definitionId: "DUPLICATE_DEFINITION" },
    });
    render(<ServiceItemDialog {...props} action={action} />);
    const field = await chooseDefinitionAndType("25");
    pressEnterInField(field, screen.getByRole("button", { name: "Tambah" }));
    // The same message shows in the picker and in the field-error line, as after a click.
    expect((await screen.findAllByText("Item ini sudah ada di layanan.")).length).toBeGreaterThan(
      0,
    );
  });
});
