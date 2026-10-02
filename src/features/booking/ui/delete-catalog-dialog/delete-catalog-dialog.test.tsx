// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

const { DeleteCatalogDialog } = await import("./delete-catalog-dialog");

const entry = { id: "category-1", name: "Prewedding" };

describe("DeleteCatalogDialog", () => {
  it("AC-CAT-018 confirms deletion for an unused entry", async () => {
    const removeAction = vi.fn().mockResolvedValue({ ok: true });
    render(
      <DeleteCatalogDialog
        isOpen
        workspaceId="ws-1"
        kind="category"
        entry={entry}
        isInUse={false}
        onOpenChange={vi.fn()}
        removeAction={removeAction}
        setActiveAction={vi.fn()}
      />,
    );
    expect(screen.getByText("Hapus kategori “Prewedding”?")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Hapus" }));
    expect(removeAction).toHaveBeenCalledWith("ws-1", "category", "category-1");
  });

  it("AC-CAT-018 archives an entry that is in use", async () => {
    const setActiveAction = vi.fn().mockResolvedValue(undefined);
    render(
      <DeleteCatalogDialog
        isOpen
        workspaceId="ws-1"
        kind="category"
        entry={entry}
        isInUse
        onOpenChange={vi.fn()}
        removeAction={vi.fn()}
        setActiveAction={setActiveAction}
      />,
    );
    expect(screen.getByText("Tidak bisa dihapus")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Arsipkan" }));
    expect(setActiveAction).toHaveBeenCalledWith("ws-1", "category", "category-1", false);
  });
});
