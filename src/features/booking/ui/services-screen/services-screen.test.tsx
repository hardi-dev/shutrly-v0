import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

import { ServicesScreen } from "./services-screen";

describe("ServicesScreen", () => {
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
