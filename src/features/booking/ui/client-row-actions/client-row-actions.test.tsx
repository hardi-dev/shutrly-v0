import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const useMobileViewport = vi.fn();
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));
vi.mock("@/ui/primitives/icon/icon", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

const { ClientRowActions } = await import("./client-row-actions");

const client = {
  id: "c1",
  name: "Rina",
  whatsappNumber: "6281234567890",
  socialLinks: [],
  isArchived: false,
} as const;

describe("ClientRowActions", () => {
  it("AC-CLI-016 exposes a safe WhatsApp link on desktop", async () => {
    useMobileViewport.mockReturnValue(false);
    render(<ClientRowActions client={client} status="ACTIVE" onEdit={vi.fn()} onArchive={vi.fn()} onRestore={vi.fn()} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk Rina" }));
    expect(screen.getByRole("menuitem", { name: "Buka WhatsApp" })).toHaveAttribute("href", "https://wa.me/6281234567890");
    expect(screen.getByRole("menuitem", { name: "Buka WhatsApp" })).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("AC-CLI-002 renders restore on archived clients", async () => {
    useMobileViewport.mockReturnValue(false);
    render(<ClientRowActions client={client} status="ARCHIVED" onEdit={vi.fn()} onArchive={vi.fn()} onRestore={vi.fn()} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk Rina" }));
    expect(screen.getByRole("menuitem", { name: "Pulihkan" })).toBeVisible();
  });
});
