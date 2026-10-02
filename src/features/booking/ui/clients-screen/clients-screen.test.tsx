import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const useMobileViewport = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));

const { ClientsScreen } = await import("./clients-screen");

function updateAction() {
  return Promise.resolve(undefined);
}

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

  it("AC-CLI-012 opens the edit dialog when a desktop row is selected", async () => {
    useMobileViewport.mockReturnValue(false);
    render(
      <ClientsScreen
        {...props}
        updateAction={updateAction}
      />,
    );
    await userEvent.click(screen.getByText("Rina"));
    expect(screen.getByRole("dialog", { name: "Ubah klien" })).toBeInTheDocument();
  });

  it("AC-CLI-004 renders the no-match state for a query with no rows", () => {
    useMobileViewport.mockReturnValue(false);
    render(<ClientsScreen {...props} rows={[]} count={1} q="zzz" />);
    expect(screen.getByRole("heading", { name: "Tidak ada klien yang cocok" })).toBeVisible();
  });
});
