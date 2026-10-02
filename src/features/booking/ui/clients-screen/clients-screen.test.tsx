import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const useMobileViewport = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));

const { ClientsScreen } = await import("./clients-screen");

describe("ClientsScreen", () => {
  const props = {
    workspaceId: "x",
    status: "ACTIVE" as const,
    count: 1,
    rows: [
      {
        id: "rina",
        name: "Rina",
        whatsappNumber: "6281234567890",
        socialLinks: [],
        isArchived: false,
      },
    ],
  };

  it("renders the desktop table tree", () => {
    useMobileViewport.mockReturnValue(false);
    render(<ClientsScreen {...props} />);
    expect(screen.getByRole("grid", { name: "Daftar klien" })).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup", { name: "Status klien" })).not.toBeInTheDocument();
  });

  it("renders the phone tabs and list tree", () => {
    useMobileViewport.mockReturnValue(true);
    render(<ClientsScreen {...props} />);
    expect(screen.getByRole("radiogroup", { name: "Status klien" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Daftar klien" })).toBeInTheDocument();
  });
});
