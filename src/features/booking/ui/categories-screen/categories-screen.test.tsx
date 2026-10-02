import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

import { CategoriesScreen } from "./categories-screen";

describe("CategoriesScreen", () => {
  it("renders an empty state when there are no categories", () => {
    render(<CategoriesScreen workspaceId="ws-1" categories={[]} />);

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Belum ada kategori" })).toBeInTheDocument();
    expect(
      screen.getByText("Buat kategori seperti Wisuda atau Wedding untuk mengelompokkan layanan."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah kategori" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveClass(
      "gap-(--space-4)",
      "md:gap-(--component-panel-app-content-gap)",
    );
  });

  it("shows an archived chip for inactive categories", () => {
    render(
      <CategoriesScreen
        workspaceId="ws-1"
        categories={[
          {
            id: "category-1",
            name: "Studio Lama",
            isActive: false,
            serviceCount: 0,
            archivedServiceCount: 0,
          },
        ]}
      />,
    );

    expect(screen.getByText("Studio Lama")).toBeInTheDocument();
    expect(screen.getByText("Diarsipkan")).toBeInTheDocument();
  });
});
