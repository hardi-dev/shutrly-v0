import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useMobileViewport = vi.fn();
const showToast = vi.fn();
const refresh = vi.fn();

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh }) }));

const { SessionTeamDialog } = await import("./session-team-dialog");

const SESSION = {
  id: "s2",
  name: "Wisuda",
  date: "2026-11-10",
  startTime: "07:30",
  endTime: "10:00",
  location: "Balairung UI, Depok",
  createdAt: "2026-10-01T00:00:01Z",
};
const ASSIGNMENTS = [
  {
    id: "a1",
    sessionId: "s2",
    memberId: "m1",
    memberName: "Dimas Pratama",
    isMemberArchived: false,
    roleName: "Fotografer",
  },
  {
    id: "a2",
    sessionId: "s2",
    memberId: "m2",
    memberName: "Sari Lestari",
    isMemberArchived: true,
    roleName: "Asisten",
  },
];

function setup(overrides = {}) {
  const removeAction = vi.fn().mockResolvedValue({ ok: true });
  const onOpenChange = vi.fn();
  const onAddMember = vi.fn();
  render(
    <SessionTeamDialog
      isOpen
      workspaceId="ws"
      projectId="p1"
      session={SESSION}
      assignments={ASSIGNMENTS}
      canEdit
      onOpenChange={onOpenChange}
      onAddMember={onAddMember}
      removeAction={removeAction}
      {...overrides}
    />,
  );
  return { removeAction, onOpenChange, onAddMember };
}

describe("SessionTeamDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMobileViewport.mockReturnValue(false);
  });

  it("AC-TEAM-014 lists the team with roles and the session line, and has no Ubah penugasan", () => {
    setup();
    const dialog = screen.getByRole("dialog", { name: "Tim · Wisuda" });
    expect(
      within(dialog).getByText("Sel, 10 Nov 2026 · 07.30–10.00 · Balairung UI, Depok"),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Dimas Pratama")).toBeInTheDocument();
    expect(within(dialog).getByText("Fotografer")).toBeInTheDocument();
    expect(within(dialog).getByText("Sari Lestari (diarsipkan)")).toBeInTheDocument();
    expect(within(dialog).getAllByRole("button", { name: "Hapus dari sesi" })).toHaveLength(2);
    expect(screen.queryByText(/Ubah penugasan/)).not.toBeInTheDocument();
  });

  it("AC-TEAM-014 asks before removing, naming the member and the session", async () => {
    const { removeAction } = setup();
    await userEvent.click(screen.getAllByRole("button", { name: "Hapus dari sesi" })[1]);
    const confirm = await screen.findByRole("alertdialog", {
      name: "Hapus Sari Lestari dari Wisuda?",
    });
    expect(
      within(confirm).getByText("Penugasannya dihapus dari sesi ini. Sari tetap ada di Tim."),
    ).toBeInTheDocument();
    expect(removeAction).not.toHaveBeenCalled();
    await userEvent.click(within(confirm).getByRole("button", { name: "Batal" }));
    expect(removeAction).not.toHaveBeenCalled();
  });

  it("AC-TEAM-014 removes the member, shows the toast and refreshes", async () => {
    const { removeAction } = setup();
    await userEvent.click(screen.getAllByRole("button", { name: "Hapus dari sesi" })[0]);
    const confirm = await screen.findByRole("alertdialog");
    await userEvent.click(within(confirm).getByRole("button", { name: "Hapus dari sesi" }));
    await waitFor(() => {
      expect(removeAction).toHaveBeenCalledWith("ws", "p1", "a1");
    });
    expect(showToast).toHaveBeenCalledWith({
      tone: "success",
      title: "Anggota dihapus dari sesi",
      body: "Dimas Pratama tidak lagi bertugas di Wisuda.",
    });
    expect(refresh).toHaveBeenCalled();
  });

  it("AC-TEAM-015 explains and refreshes when the project turned out to be cancelled", async () => {
    const removeAction = vi.fn().mockResolvedValue({ ok: false, code: "PROJECT_CANCELLED" });
    setup({ removeAction });
    await userEvent.click(screen.getAllByRole("button", { name: "Hapus dari sesi" })[0]);
    const confirm = await screen.findByRole("alertdialog");
    await userEvent.click(within(confirm).getByRole("button", { name: "Hapus dari sesi" }));
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith({
        tone: "danger",
        title: "Proyek dibatalkan; tim tidak bisa diubah.",
      });
    });
    expect(refresh).toHaveBeenCalled();
  });

  it("AC-TEAM-023 shows the danger toast when the save fails", async () => {
    const removeAction = vi.fn().mockRejectedValue(new Error("boom"));
    setup({ removeAction });
    await userEvent.click(screen.getAllByRole("button", { name: "Hapus dari sesi" })[0]);
    const confirm = await screen.findByRole("alertdialog");
    await userEvent.click(within(confirm).getByRole("button", { name: "Hapus dari sesi" }));
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ tone: "danger", title: "Perubahan belum tersimpan" }),
      );
    });
  });

  it("AC-TEAM-014 Tambah anggota hands over to the host, Selesai closes", async () => {
    const { onAddMember, onOpenChange } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Tambah anggota" }));
    expect(onAddMember).toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Selesai" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("AC-TEAM-015 is read-only on a cancelled project: the note, no actions, only Tutup", () => {
    setup({ canEdit: false });
    const dialog = screen.getByRole("dialog", { name: "Tim · Wisuda" });
    expect(
      within(dialog).getByText("Proyek dibatalkan, tim tidak bisa diubah."),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Dimas Pratama")).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: "Hapus dari sesi" }),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: "Tambah anggota" }),
    ).not.toBeInTheDocument();
    expect(within(dialog).getAllByRole("button", { name: "Tutup" }).length).toBeGreaterThan(0);
  });

  it("AC-TEAM-014 on a phone shows Tambah anggota only, as the sheet is drawn", () => {
    useMobileViewport.mockReturnValue(true);
    setup();
    expect(screen.getByRole("button", { name: "Tambah anggota" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Selesai" })).not.toBeInTheDocument();
  });
});
