import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

const { CatalogRowActions } = await import("./catalog-row-actions");

describe("CatalogRowActions", () => {
  it("AC-CAT-017 exposes edit, archive, and delete actions", async () => {
    const setActive = vi.fn().mockResolvedValue(undefined);
    render(
      <CatalogRowActions
        workspaceId="ws-1"
        kind="service"
        id="service-1"
        name="Wisuda Basic"
        isActive
        setActiveAction={setActive}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk Wisuda Basic" }));
    expect(screen.getByRole("menuitem", { name: "Ubah" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Arsipkan" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Hapus" })).toBeInTheDocument();
  });

  it("calls setActive without confirmation", async () => {
    const setActive = vi.fn().mockResolvedValue(undefined);
    render(
      <CatalogRowActions
        workspaceId="ws-1"
        kind="service"
        id="service-1"
        name="Wisuda Basic"
        isActive
        setActiveAction={setActive}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk Wisuda Basic" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Arsipkan" }));
    expect(setActive).toHaveBeenCalledWith("ws-1", "service", "service-1", false);
  });
});
