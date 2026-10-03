import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const useMobileViewport = vi.fn();
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));
vi.mock("@/ui/primitives/icon/icon", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

const { DeleteClientDialog } = await import("./delete-client-dialog");
const client = { id: "c1", name: "Rina", whatsappNumber: null, socialLinks: [], isArchived: false };

describe("DeleteClientDialog", () => {
  it("AC-CLI-014 confirms deletion before calling its action", async () => {
    useMobileViewport.mockReturnValue(false);
    const action = vi.fn().mockResolvedValue({ ok: true });
    const onOpenChange = vi.fn();
    render(
      <DeleteClientDialog
        client={client}
        workspaceId="w1"
        action={action}
        onOpenChange={onOpenChange}
      />,
    );
    expect(screen.getByRole("alertdialog", { name: 'Hapus klien "Rina"?' })).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Hapus klien" }));
    expect(action).toHaveBeenCalledWith("w1", "c1");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("AC-CLI-015 keeps the dialog open when a client is in use", async () => {
    useMobileViewport.mockReturnValue(false);
    const action = vi.fn().mockResolvedValue({ ok: false, code: "IN_USE" });
    render(
      <DeleteClientDialog
        client={client}
        workspaceId="w1"
        action={action}
        onOpenChange={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Hapus klien" }));
    expect(await screen.findByText("Klien ini punya proyek. Arsipkan saja.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Hapus klien" })).toBeDisabled();
  });
});
