import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const useMobileViewport = vi.fn();

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));

const { ClientDialog } = await import("./client-dialog");

describe("ClientDialog", () => {
  it("AC-CLI-006 sends raw add values and closes after a successful save", async () => {
    useMobileViewport.mockReturnValue(false);
    const submit = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();
    render(<ClientDialog isOpen workspaceId="x" onOpenChange={onOpenChange} onSubmit={submit} />);

    await userEvent.type(screen.getByLabelText("Nama klien"), " Rina Wedding ");
    await userEvent.type(screen.getByLabelText("Nomor WhatsApp"), "0812-3456-7890");
    await userEvent.click(screen.getByRole("button", { name: "Tambah klien" }));

    expect(submit).toHaveBeenCalledWith("x", {
      name: " Rina Wedding ",
      whatsappNumber: "0812-3456-7890",
      socialLinks: [{ platform: "INSTAGRAM", value: "" }],
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("blocks an empty name before calling the action", async () => {
    useMobileViewport.mockReturnValue(false);
    const submit = vi.fn();
    render(<ClientDialog isOpen workspaceId="x" onOpenChange={vi.fn()} onSubmit={submit} />);
    await userEvent.click(screen.getByRole("button", { name: "Tambah klien" }));
    expect(await screen.findByText("Isi nama klien.")).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it("adds and removes only the selected social row", async () => {
    useMobileViewport.mockReturnValue(false);
    render(<ClientDialog isOpen workspaceId="x" onOpenChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getAllByRole("button", { name: "Hapus media sosial" })).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: "Tambah media sosial" }));
    expect(screen.getAllByRole("button", { name: "Hapus media sosial" })).toHaveLength(2);
    await userEvent.click(screen.getAllByRole("button", { name: "Hapus media sosial" })[1]);
    expect(screen.getAllByRole("button", { name: "Hapus media sosial" })).toHaveLength(1);
  });

  it("uses the form sheet with no cancel button on phones", () => {
    useMobileViewport.mockReturnValue(true);
    render(<ClientDialog isOpen workspaceId="x" onOpenChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByRole("dialog", { name: "Tambah klien" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Batal" })).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("@nama atau tautan")).toBeInTheDocument();
  });
});
