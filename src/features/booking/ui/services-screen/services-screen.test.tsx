import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

import { ServicesScreen } from "./services-screen";

describe("ServicesScreen", () => {
  it("AC-SETUP-005 opens Add service from the link and drops the query when closed", async () => {
    const replaceState = vi.spyOn(window.history, "replaceState");
    render(
      <ServicesScreen workspaceId="ws-1" groups={[]} addServiceAction={vi.fn()} openAddOnLoad />,
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(replaceState).toHaveBeenCalledWith(null, "", "/w/ws-1/services");
    replaceState.mockRestore();
  });

  it("AC-SETUP-005 keeps Add service closed without the link", () => {
    render(<ServicesScreen workspaceId="ws-1" groups={[]} addServiceAction={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders an empty state inside every category section without services", () => {
    render(
      <ServicesScreen
        workspaceId="ws-1"
        groups={[
          { categoryId: "category-1", categoryName: "Wisuda", isActive: true, services: [] },
          { categoryId: "category-2", categoryName: "Wedding", isActive: true, services: [] },
        ]}
      />,
    );

    expect(screen.getAllByTestId("empty-state")).toHaveLength(2);
    expect(screen.getAllByRole("heading", { name: "Belum ada layanan" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Tambah layanan" })).toHaveLength(2);
    expect(screen.getByRole("main")).toHaveClass(
      "gap-(--space-4)",
      "md:gap-(--component-panel-app-content-gap)",
    );
  });

  it("shows an archived chip on an archived category section", () => {
    render(
      <ServicesScreen
        workspaceId="ws-1"
        groups={[
          { categoryId: "category-1", categoryName: "Studio Lama", isActive: false, services: [] },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Studio Lama" })).toBeInTheDocument();
    expect(screen.getByText("Diarsipkan")).toBeInTheDocument();
  });

  it("hides the row chevron for service links", () => {
    render(
      <ServicesScreen
        workspaceId="ws-1"
        groups={[
          {
            categoryId: "category-1",
            categoryName: "Wisuda",
            isActive: true,
            services: [
              {
                id: "service-1",
                name: "Wisuda Basic",
                categoryId: "category-1",
                basePrice: "750000",
                isActive: true,
                items: [],
                priceLabel: "Rp 750.000",
                summary: "Belum ada item paket",
              },
            ],
          },
        ]}
      />,
    );

    const serviceLink = screen.getByRole("link", { name: "Wisuda Basic" });
    expect(serviceLink).toHaveClass("absolute", "inset-0");
    expect(screen.getByRole("listitem").querySelectorAll("svg")).toHaveLength(1);
  });
});
