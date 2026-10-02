// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

const { CategoryDialog } = await import("./category-dialog");

describe("CategoryDialog", () => {
  it("AC-CAT-009 submits a new category", async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    render(<CategoryDialog isOpen workspaceId="ws-1" onOpenChange={vi.fn()} action={action} />);
    await userEvent.type(screen.getByRole("textbox", { name: "Nama kategori" }), "Wisuda");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(action).toHaveBeenCalledWith("ws-1", { name: "Wisuda" });
  });

  it("renders a server name error", async () => {
    const action = vi.fn().mockResolvedValue({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { name: "NAME_TAKEN" },
    });
    render(<CategoryDialog isOpen workspaceId="ws-1" onOpenChange={vi.fn()} action={action} />);
    await userEvent.type(screen.getByRole("textbox", { name: "Nama kategori" }), "Wisuda");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(await screen.findByText("Nama ini sudah dipakai.")).toBeInTheDocument();
  });

  it("resets the add form after a successful submit when reopened", async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    function ControlledDialog() {
      const [isOpen, setIsOpen] = useState(true);
      function openDialog(): void {
        setIsOpen(true);
      }
      return (
        <>
          <button type="button" onClick={openDialog}>
            Buka dialog
          </button>
          <CategoryDialog
            isOpen={isOpen}
            workspaceId="ws-1"
            onOpenChange={setIsOpen}
            action={action}
          />
        </>
      );
    }

    render(<ControlledDialog />);
    await userEvent.type(screen.getByRole("textbox", { name: "Nama kategori" }), "Wisuda");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => {
      expect(screen.queryByRole("textbox", { name: "Nama kategori" })).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "Buka dialog" }));
    expect(screen.getByRole("textbox", { name: "Nama kategori" })).toHaveValue("");
  });
});
