import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useMobileViewport = vi.fn();
const showToast = vi.fn();

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));

const { DeleteTeamMemberDialog } = await import("./delete-team-member-dialog");

const MEMBER = {
  id: "m1",
  name: "Dimas Pratama",
  whatsappNumber: "6281298765432",
  email: null,
  roles: [],
  isArchived: false,
};

function setup(action = vi.fn().mockResolvedValue({ ok: true })) {
  const onOpenChange = vi.fn();
  render(
    <DeleteTeamMemberDialog
      member={MEMBER}
      workspaceId="ws"
      onOpenChange={onOpenChange}
      action={action}
    />,
  );
  return { action, onOpenChange };
}

describe("DeleteTeamMemberDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMobileViewport.mockReturnValue(false);
  });

  it("AC-TEAM-007 confirms, deletes and shows the success toast", async () => {
    const { action, onOpenChange } = setup();
    expect(screen.getByText('Hapus anggota "Dimas Pratama"?')).toBeInTheDocument();
    expect(
      screen.getByText("Nama, nomor WhatsApp, email, dan perannya dihapus permanen."),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Hapus" }));
    await waitFor(() => {
      expect(action).toHaveBeenCalledWith("ws", "m1");
    });
    expect(showToast).toHaveBeenCalledWith({ tone: "success", title: "Dimas Pratama dihapus" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("AC-TEAM-007 explains an assigned member cannot be deleted and offers only Tutup", async () => {
    setup(vi.fn().mockResolvedValue({ ok: false, code: "HAS_ASSIGNMENTS" }));
    await userEvent.click(screen.getByRole("button", { name: "Hapus" }));
    expect(await screen.findByText("Dimas Pratama tidak bisa dihapus")).toBeInTheDocument();
    expect(screen.getByText("Anggota ini punya penugasan. Arsipkan saja.")).toBeInTheDocument();
    // The modal's close icon shares the name with the footer button.
    expect(screen.getAllByRole("button", { name: "Tutup" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Hapus" })).not.toBeInTheDocument();
  });

  it("AC-TEAM-023 shows a danger toast and keeps the dialog open when the delete fails", async () => {
    const { onOpenChange } = setup(vi.fn().mockRejectedValue(new Error("boom")));
    await userEvent.click(screen.getByRole("button", { name: "Hapus" }));
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ tone: "danger", title: "Perubahan belum tersimpan" }),
      );
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("AC-TEAM-007 renders as a phone sheet with the destructive row", () => {
    useMobileViewport.mockReturnValue(true);
    setup();
    expect(screen.getByRole("button", { name: "Hapus" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Batal" })).toBeInTheDocument();
  });
});
