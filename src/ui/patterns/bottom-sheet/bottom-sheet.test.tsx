import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { Button } from "@/ui/primitives/button/button";

import { BottomSheet } from "./bottom-sheet";

function BottomSheetHarness({
  variant = "actions",
}: Readonly<{ variant?: "actions" | "form" | "menu" }>) {
  const [isOpen, setIsOpen] = useState(false);

  function handleOpen() {
    setIsOpen(true);
  }

  function handleOpenChange(nextIsOpen: boolean) {
    setIsOpen(nextIsOpen);
  }

  return (
    <>
      <Button onPress={handleOpen}>Buka sheet</Button>
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        variant={variant}
        title="Foto proyek"
        meta={variant === "actions" ? "IMG_2041.jpg" : undefined}
        description={variant === "form" ? "Pilih tindakan untuk foto ini." : undefined}
        actions={variant === "form" ? <Button onPress={handleOpen}>Simpan</Button> : undefined}
      >
        <Button onPress={handleOpen}>Unduh foto</Button>
      </BottomSheet>
    </>
  );
}

describe("BottomSheet (C32)", () => {
  it("spans the viewport up to the tablet breakpoint and caps its content at the desktop modal width", async () => {
    const user = userEvent.setup();
    render(<BottomSheetHarness variant="form" />);

    await user.click(screen.getByRole("button", { name: "Buka sheet" }));

    const dialog = await screen.findByRole("dialog", { name: "Foto proyek" });
    const surface = dialog.parentElement;
    expect(surface).toHaveClass("w-full");
    expect(surface?.className).not.toMatch(/max-w-/);
    for (const part of [
      screen.getByRole("heading", { name: "Foto proyek" }).closest("header"),
      screen.getByRole("button", { name: "Unduh foto" }).parentElement,
      screen.getByRole("button", { name: "Simpan" }).parentElement,
    ])
      expect(part).toHaveClass("mx-auto", "max-w-[560px]");
  });

  it("renders an actions sheet with a decorative grabber and returns focus on Escape", async () => {
    const user = userEvent.setup();
    render(<BottomSheetHarness />);

    const trigger = screen.getByRole("button", { name: "Buka sheet" });
    await user.click(trigger);

    const sheet = screen.getByRole("dialog", { name: "Foto proyek" });
    expect(sheet).toHaveAttribute("aria-modal", "true");
    expect(sheet).toHaveClass("max-h-[90dvh]");
    expect(sheet.parentElement).toHaveClass(
      "data-[entering]:animate-[bottom-sheet-in_300ms_ease-out]",
      "data-[exiting]:animate-[bottom-sheet-out_300ms_ease-in]",
    );
    expect(sheet.querySelector("div[aria-hidden='true']")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("IMG_2041.jpg")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it("renders a form sheet with description, close control and footer actions", async () => {
    const user = userEvent.setup();
    render(<BottomSheetHarness variant="form" />);

    await user.click(screen.getByRole("button", { name: "Buka sheet" }));

    expect(screen.getByRole("dialog", { name: "Foto proyek" })).toBeInTheDocument();
    expect(screen.getByText("Pilih tindakan untuk foto ini.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tutup" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simpan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simpan" }).closest("footer")).toHaveClass(
      "bg-(--component-sheet-footer-background)",
    );
    expect(
      screen.getByRole("button", { name: "Simpan" }).closest("footer")?.nextElementSibling,
    ).toHaveClass("h-[env(safe-area-inset-bottom)]", "bg-(--component-sheet-footer-background)");
  });
});
