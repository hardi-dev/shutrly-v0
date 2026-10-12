// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { pressEnterInField } from "@tests/support/forms/implicit-submit";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { BookingFieldDialog } from "./booking-field-dialog";
import type { BookingFieldDialogProps } from "./booking-field-dialog.types";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

function AddFieldHarness({ action }: { readonly action: BookingFieldDialogProps["action"] }) {
  const [isOpen, setIsOpen] = useState(true);
  function open(): void {
    setIsOpen(true);
  }
  return (
    <>
      <button type="button" onClick={open}>
        Buka tambah field
      </button>
      <BookingFieldDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        workspaceId="workspace-1"
        serviceId="service-1"
        action={action}
      />
    </>
  );
}

describe("BookingFieldDialog", () => {
  it("resets the add form after save before it is opened again", async () => {
    const user = userEvent.setup();
    const action: BookingFieldDialogProps["action"] = vi.fn().mockResolvedValue({ ok: true });
    render(<AddFieldHarness action={action} />);

    expect(screen.getByRole("textbox", { name: "Nama kolom" })).toHaveAttribute(
      "placeholder",
      "Contoh: Nama kampus",
    );
    await user.type(screen.getByRole("textbox", { name: "Nama kolom" }), "Nama kampus");
    await user.click(screen.getByRole("button", { name: /Tipe/ }));
    await user.click(screen.getByRole("option", { name: "Pilihan" }));
    await user.click(screen.getByRole("button", { name: "Tambah pilihan" }));
    expect(screen.getByRole("textbox", { name: "Pilihan 1" })).toHaveAttribute(
      "placeholder",
      "Contoh: Kampus A",
    );
    await user.type(screen.getByRole("textbox", { name: "Pilihan 1" }), "Kampus A");
    await user.click(screen.getByRole("switch", { name: "Wajib diisi" }));
    await user.click(screen.getByRole("button", { name: "Tambah" }));

    await waitFor(() => {
      expect(action).toHaveBeenCalledOnce();
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Buka tambah field" }));
    expect(screen.getByRole("textbox", { name: "Nama kolom" })).toHaveValue("");
    expect(screen.getByRole("button", { name: /Tipe/ })).toHaveTextContent("Teks");
    expect(screen.getByRole("switch", { name: "Wajib diisi" })).not.toBeChecked();
    expect(screen.queryByRole("textbox", { name: "Pilihan 1" })).not.toBeInTheDocument();
  });
});

describe("BookingFieldDialog submits on Enter (AC-SFX-009, AC-SFX-010)", () => {
  const props = {
    isOpen: true,
    onOpenChange: vi.fn(),
    workspaceId: "workspace-1",
    serviceId: "service-1",
  } as const;

  it("AC-SFX-009 Enter in the name field saves once with the same input as Add", async () => {
    const action: BookingFieldDialogProps["action"] = vi.fn().mockResolvedValue({ ok: true });
    render(<BookingFieldDialog {...props} action={action} />);
    const name = screen.getByRole("textbox", { name: "Nama kolom" });
    await userEvent.type(name, "Nama kampus");
    pressEnterInField(name, screen.getByRole("button", { name: "Tambah" }));
    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(1);
    });
    expect(action).toHaveBeenCalledWith("workspace-1", "service-1", {
      name: "Nama kampus",
      fieldType: "TEXT",
      isRequired: false,
      options: null,
    });
  });

  it("AC-SFX-010 a second Enter while saving sends no second save", async () => {
    const action: BookingFieldDialogProps["action"] = vi.fn(
      () => new Promise<never>(() => undefined),
    );
    render(<BookingFieldDialog {...props} action={action} />);
    const name = screen.getByRole("textbox", { name: "Nama kolom" });
    await userEvent.type(name, "Nama kampus");
    const primary = screen.getByRole("button", { name: "Tambah" });
    pressEnterInField(name, primary);
    pressEnterInField(name, primary);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("AC-SFX-009 Enter shows the same server field error as Add", async () => {
    const action: BookingFieldDialogProps["action"] = vi.fn().mockResolvedValue({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { name: "NAME_TAKEN" },
    });
    render(<BookingFieldDialog {...props} action={action} />);
    const name = screen.getByRole("textbox", { name: "Nama kolom" });
    await userEvent.type(name, "Nama kampus");
    pressEnterInField(name, screen.getByRole("button", { name: "Tambah" }));
    expect(await screen.findByText("Nama ini sudah dipakai.")).toBeInTheDocument();
  });

  it("AC-SFX-010 Enter in a choice option row submits, it does not add a line", async () => {
    const action: BookingFieldDialogProps["action"] = vi.fn().mockResolvedValue({ ok: true });
    render(<BookingFieldDialog {...props} action={action} />);
    await userEvent.type(screen.getByRole("textbox", { name: "Nama kolom" }), "Nama kampus");
    await userEvent.click(screen.getByRole("button", { name: /Tipe/ }));
    await userEvent.click(screen.getByRole("option", { name: "Pilihan" }));
    await userEvent.click(screen.getByRole("button", { name: "Tambah pilihan" }));
    const option = screen.getByRole("textbox", { name: "Pilihan 1" });
    await userEvent.type(option, "Kampus A");
    pressEnterInField(option, screen.getByRole("button", { name: "Tambah" }));
    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(1);
    });
    expect(action).toHaveBeenCalledWith(
      "workspace-1",
      "service-1",
      expect.objectContaining({ fieldType: "SELECT", options: ["Kampus A"] }),
    );
  });
});
