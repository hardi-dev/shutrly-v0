import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/ui/primitives/button/button";

const push = vi.fn();
const useMobileViewport = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));

const { CatalogTabsBar } = await import("./catalog-tabs-bar");

describe("CatalogTabsBar", () => {
  it("AC-CAT-003 renders mobile tabs and navigates to the selected route", async () => {
    useMobileViewport.mockReturnValue(true);
    render(<CatalogTabsBar workspaceId="ws" activeTab="services" />);
    await userEvent.click(screen.getByRole("radio", { name: "Kategori" }));
    expect(push).toHaveBeenCalledWith("/w/ws/services/categories");
  });

  it("renders nothing on desktop", () => {
    useMobileViewport.mockReturnValue(false);
    render(<CatalogTabsBar workspaceId="ws" activeTab="services" />);
    expect(screen.queryByRole("radiogroup", { name: "Bagian layanan" })).not.toBeInTheDocument();
  });

  it("renders the mobile primary action below the tabs", () => {
    useMobileViewport.mockReturnValue(true);

    render(
      <CatalogTabsBar
        workspaceId="ws"
        activeTab="services"
        action={<Button>Tambah layanan</Button>}
      />,
    );

    const tabs = screen.getByRole("radiogroup", { name: "Bagian layanan" });
    const action = screen.getByRole("button", { name: "Tambah layanan" });

    expect(action.parentElement?.parentElement).toHaveClass("gap-(--space-4)");
    expect(action.parentElement).toHaveClass("w-full");
    expect(tabs.compareDocumentPosition(action)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
