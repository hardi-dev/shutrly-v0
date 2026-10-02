import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { Button } from "@/ui/primitives/button/button";

import { Modal } from "./modal";

function ModalHarness({ isDestructive = false }: Readonly<{ isDestructive?: boolean }>) {
  const [isOpen, setIsOpen] = useState(false);

  function handleOpen() {
    setIsOpen(true);
  }

  function handleOpenChange(nextIsOpen: boolean) {
    setIsOpen(nextIsOpen);
  }

  return (
    <>
      <Button onPress={handleOpen}>Buka modal</Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        title="Buat workspace"
        description="Tambahkan workspace baru untuk tim Anda."
        size="md"
        isDestructive={isDestructive}
        actions={<Button onPress={handleOpen}>Simpan</Button>}
      >
        <p>Isi modal</p>
      </Modal>
    </>
  );
}

describe("Modal (C31)", () => {
  it("opens with the approved sections and returns focus to its trigger on close", async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);

    const trigger = screen.getByRole("button", { name: "Buka modal" });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Buat workspace" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog.parentElement).toHaveClass("max-w-[min(calc(100%_-_32px),_560px)]");
    expect(screen.getByText("Tambahkan workspace baru untuk tim Anda.")).toBeInTheDocument();
    expect(screen.getByText("Isi modal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tutup" })).toBeInTheDocument();
    expect(screen.getByText("Simpan")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tutup" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("uses alertdialog semantics for destructive confirmation", async () => {
    const user = userEvent.setup();
    render(<ModalHarness isDestructive />);

    await user.click(screen.getByRole("button", { name: "Buka modal" }));

    expect(screen.getByRole("alertdialog", { name: "Buat workspace" })).toBeInTheDocument();
    expect(screen.queryByText("Isi modal")).toBeNull();
  });
});
