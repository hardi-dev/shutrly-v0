import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { Button } from "@/ui/primitives/button/button";

import { Modal } from "./modal";

const noop = () => undefined;

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

function StackedHarness() {
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const [isSecondOpen, setIsSecondOpen] = useState(false);
  function handleOpenSecond() {
    setIsSecondOpen(true);
  }
  return (
    <Modal isOpen={isFirstOpen} onOpenChange={setIsFirstOpen} title="Tambah sesi">
      <Button onPress={handleOpenSecond}>Tambah anggota</Button>
      <Modal isOpen={isSecondOpen} onOpenChange={setIsSecondOpen} title="Tambah anggota tim">
        <p>Form anggota</p>
      </Modal>
    </Modal>
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

  it("D-17 sizes xl to the content width at a fixed height", () => {
    render(
      <Modal isOpen onOpenChange={noop} title="Semua foto" size="xl">
        <p>Isi</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog", { name: "Semua foto" });
    expect(dialog.parentElement?.className).toContain("var(--size-content-max)");
    expect(dialog.className).toContain("h-full");
  });

  it("Revision OT #1 #2 stacks a modal over another: Escape closes only the top one and focus returns below", async () => {
    const user = userEvent.setup();
    render(<StackedHarness />);
    const trigger = screen.getByRole("button", { name: "Tambah anggota" });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "Tambah anggota tim" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Tambah anggota tim" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Tambah sesi" })).toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
