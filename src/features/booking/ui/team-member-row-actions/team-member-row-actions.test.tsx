import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useMobileViewport = vi.fn();

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));

const { TeamMemberRowActions } = await import("./team-member-row-actions");

const MEMBER = {
  id: "m1",
  name: "Dimas Pratama",
  whatsappNumber: "6281298765432",
  email: null,
  roles: [
    { id: "r1", name: "Fotografer" },
    { id: "r2", name: "Videografer" },
  ],
  isArchived: false,
};

function setup(member = MEMBER) {
  const handlers = {
    onEdit: vi.fn(),
    onArchive: vi.fn(),
    onRestore: vi.fn(),
    onDelete: vi.fn(),
  };
  render(<TeamMemberRowActions member={member} {...handlers} />);
  return handlers;
}

describe("TeamMemberRowActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMobileViewport.mockReturnValue(false);
  });

  it("AC-TEAM-007 offers Ubah, Buka WhatsApp, Arsipkan and Hapus on the Aktif tab", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk Dimas Pratama" }));
    const names = screen.getAllByRole("menuitem").map((item) => item.textContent);
    expect(names).toEqual(["Ubah", "Buka WhatsApp", "Arsipkan", "Hapus"]);
  });

  it("AC-TEAM-007 offers Pulihkan instead of Arsipkan on the Arsip tab", async () => {
    const { onRestore } = setup({ ...MEMBER, isArchived: true });
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk Dimas Pratama" }));
    expect(screen.queryByRole("menuitem", { name: "Arsipkan" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("menuitem", { name: "Pulihkan" }));
    expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ id: "m1" }));
  });

  it("ADR-006 C-106 opens WhatsApp as a plain wa.me link in a new tab without text", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk Dimas Pratama" }));
    const link = screen.getByRole("menuitem", { name: "Buka WhatsApp" });
    expect(link).toHaveAttribute("href", "https://wa.me/6281298765432");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("AC-TEAM-007 calls the handlers for Ubah, Arsipkan and Hapus", async () => {
    const { onEdit, onArchive, onDelete } = setup();
    const open = () =>
      userEvent.click(screen.getByRole("button", { name: "Aksi untuk Dimas Pratama" }));
    await open();
    await userEvent.click(screen.getByRole("menuitem", { name: "Ubah" }));
    expect(onEdit).toHaveBeenCalledOnce();
    await open();
    await userEvent.click(screen.getByRole("menuitem", { name: "Arsipkan" }));
    expect(onArchive).toHaveBeenCalledOnce();
    await open();
    await userEvent.click(screen.getByRole("menuitem", { name: "Hapus" }));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("AC-TEAM-007 shows the number and roles in the phone sheet and closes it before acting", async () => {
    useMobileViewport.mockReturnValue(true);
    const { onArchive } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk Dimas Pratama" }));
    const sheet = screen.getByRole("dialog");
    expect(
      within(sheet).getByText("+62 812-9876-5432 · Fotografer, Videografer"),
    ).toBeInTheDocument();
    await userEvent.click(within(sheet).getByRole("button", { name: "Arsipkan" }));
    expect(onArchive).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
