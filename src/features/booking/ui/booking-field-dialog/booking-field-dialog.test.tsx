// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

    await user.type(screen.getByRole("textbox", { name: "Nama field" }), "Nama kampus");
    await user.click(screen.getByRole("button", { name: /Tipe/ }));
    await user.click(screen.getByRole("option", { name: "Pilihan" }));
    await user.click(screen.getByRole("button", { name: "Tambah pilihan" }));
    await user.type(screen.getByRole("textbox", { name: "Pilihan 1" }), "Kampus A");
    await user.click(screen.getByRole("switch", { name: "Wajib diisi" }));
    await user.click(screen.getByRole("button", { name: "Tambah" }));

    await waitFor(() => {
      expect(action).toHaveBeenCalledOnce();
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Buka tambah field" }));
    expect(screen.getByRole("textbox", { name: "Nama field" })).toHaveValue("");
    expect(screen.getByRole("button", { name: /Tipe/ })).toHaveTextContent("Teks");
    expect(screen.getByRole("switch", { name: "Wajib diisi" })).not.toBeChecked();
    expect(screen.queryByRole("textbox", { name: "Pilihan 1" })).not.toBeInTheDocument();
  });
});
