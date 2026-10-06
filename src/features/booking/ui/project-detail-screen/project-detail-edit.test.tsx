import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProjectDetailView } from "@/features/booking/application/use-cases/get-project-detail/get-project-detail.types";
import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";

import { projectDetailView } from "../../../../../tests/support/booking/project-detail-view";
import { ProjectDetailScreen } from "./project-detail-screen";

const { refresh, showToast } = vi.hoisted(() => ({ refresh: vi.fn(), showToast: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh, push: vi.fn() }) }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));
vi.mock("@/ui/patterns/page-actions/page-actions", () => ({
  PageActions: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/ui/patterns/compact-bar/compact-bar-actions", () => ({
  CompactBarActions: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const DEFINITIONS = [
  {
    id: "d3",
    name: "Foto cetak",
    unit: "foto",
    valueType: "NUMBER",
    selectionRequired: true,
    pickMode: "QUANTITY",
    allowsPickNotes: false,
  },
] as const;

function setup(status: ProjectStatus, overrides: Partial<ProjectDetailView> = {}) {
  const edit = {
    addItemAction: vi.fn(() => Promise.resolve(undefined)),
    updateItemAction: vi.fn(() => Promise.resolve(undefined)),
    removeItemAction: vi.fn(() => Promise.resolve(undefined)),
    updateFieldsAction: vi.fn(() => Promise.resolve(undefined)),
    addSessionAction: vi.fn(() => Promise.resolve(undefined)),
    updateSessionAction: vi.fn(() => Promise.resolve(undefined)),
    deleteSessionAction: vi.fn(() => Promise.resolve(undefined)),
  };
  const menu = {
    advanceAction: vi.fn(() =>
      Promise.resolve({ ok: false as const, code: "SESSION_REQUIRED" as const }),
    ),
    updateInfoAction: vi.fn(),
    cancelAction: vi.fn(),
    deleteDraftAction: vi.fn(),
    loadDetailAction: vi.fn(),
    loadClientAction: vi.fn(),
    updateClientAction: vi.fn(),
  };
  render(
    <ProjectDetailScreen
      workspaceId="ws"
      project={projectDetailView(status, overrides)}
      menuActions={menu}
      editActions={edit}
      assignableMembers={[]}
      addAssignmentAction={vi.fn()}
      removeAssignmentAction={vi.fn()}
      definitions={DEFINITIONS}
    />,
  );
  return { edit, menu };
}

describe("detail edit controls", () => {
  beforeEach(() => {
    refresh.mockClear();
    showToast.mockClear();
  });

  it.each(["DRAFT", "BOOKED"] as const)("AC-PRJ-017 shows every edit control in %s", (status) => {
    setup(status);
    expect(screen.getByRole("button", { name: "Tambah item" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aksi untuk item Foto edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah sesi" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Ubah" })).toHaveLength(1);
  });

  it("AC-PRJ-018 hides the deal controls from SHOOTING on but keeps the schedule's", () => {
    setup("SHOOTING");
    expect(screen.queryByRole("button", { name: "Tambah item" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Aksi untuk item/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ubah" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah sesi" })).toBeInTheDocument();
  });

  it("AC-PRJ-018 hides every edit control when cancelled", () => {
    setup("CANCELLED");
    expect(screen.queryByRole("button", { name: "Tambah sesi" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Aksi untuk sesi/ })).not.toBeInTheDocument();
  });

  it("AC-PRJ-017 adds an item and confirms with a toast and a refresh", async () => {
    const { edit } = setup("BOOKED");
    await userEvent.click(screen.getByRole("button", { name: "Tambah item" }));
    const dialog = screen.getByRole("dialog", { name: "Tambah item" });
    await userEvent.click(within(dialog).getByRole("button", { name: /Item/ }));
    await userEvent.click(screen.getByRole("option", { name: /Foto cetak/ }));
    await userEvent.type(within(dialog).getByRole("textbox", { name: "Jumlah" }), "10");
    await userEvent.click(within(dialog).getByRole("button", { name: "Tambah item" }));
    expect(edit.addItemAction).toHaveBeenCalledWith("ws", "p1", {
      definitionId: "d3",
      value: { type: "NUMBER", value: "10" },
    });
    expect(showToast).toHaveBeenCalledWith({ tone: "success", title: "Perubahan disimpan" });
    expect(refresh).toHaveBeenCalled();
  });

  it("AC-PRJ-017 edits an item value from its menu", async () => {
    const { edit } = setup("BOOKED");
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk item Foto edit" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Ubah nilai" }));
    const dialog = screen.getByRole("dialog", { name: "Ubah nilai · Foto edit" });
    const field = within(dialog).getByRole("textbox", { name: "Jumlah" });
    await userEvent.clear(field);
    await userEvent.type(field, "30");
    await userEvent.click(within(dialog).getByRole("button", { name: "Simpan" }));
    expect(edit.updateItemAction).toHaveBeenCalledWith("ws", "p1", "i1", {
      value: { type: "NUMBER", value: "30" },
    });
  });

  it("AC-PRJ-019 shows the locked toast and reloads when the deal was locked meanwhile", async () => {
    const { edit } = setup("BOOKED");
    edit.removeItemAction.mockResolvedValueOnce({ ok: false, code: "DEAL_LOCKED" } as never);
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk item Foto edit" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Hapus" }));
    expect(screen.getByText("Hapus Foto edit?")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Hapus item" }));
    expect(showToast).toHaveBeenCalledWith({
      tone: "danger",
      title: "Detail paket tidak bisa diubah lagi",
      body: "Proyek sudah dalam pemotretan. Data terbaru sudah dimuat.",
    });
    expect(refresh).toHaveBeenCalled();
  });

  it("AC-PRJ-029 disables deleting the last session of a booked project and says why", async () => {
    const one = projectDetailView("BOOKED").sessions.slice(0, 1);
    setup("BOOKED", { sessions: one });
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk sesi Foto keluarga" }));
    const remove = screen.getByRole("menuitem", { name: /Hapus sesi/ });
    expect(remove).toHaveAttribute("aria-disabled", "true");
    expect(
      within(screen.getByRole("menu")).getByText(
        "Proyek yang sudah dibooking butuh minimal satu sesi.",
      ),
    ).toBeInTheDocument();
  });

  it("AC-PRJ-029 deletes a session after confirming", async () => {
    const { edit } = setup("BOOKED");
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk sesi Foto keluarga" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Hapus sesi" }));
    expect(screen.getByText("Hapus sesi Foto keluarga?")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Hapus sesi" }));
    expect(edit.deleteSessionAction).toHaveBeenCalledWith("ws", "p1", "s1");
  });

  it("AC-TEAM-020 names the team in the delete confirmation of a staffed session", async () => {
    const assignments = ["a1", "a2"].map((id) => ({
      id,
      sessionId: "s1",
      memberId: `m-${id}`,
      memberName: `Anggota ${id}`,
      isMemberArchived: false,
      roleName: "Asisten",
    }));
    const { edit } = setup("BOOKED", { assignments });
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk sesi Foto keluarga" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Hapus sesi" }));
    expect(screen.getByText("Hapus sesi Foto keluarga?")).toBeInTheDocument();
    expect(
      screen.getByText("Sesi ini punya 2 anggota tim. Penugasan mereka ikut terhapus."),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Hapus sesi" }));
    expect(edit.deleteSessionAction).toHaveBeenCalledWith("ws", "p1", "s1");
  });

  it("AC-TEAM-020 keeps the plain delete body for a session without a team, even when another has one", async () => {
    const assignments = [
      {
        id: "a1",
        sessionId: "s2",
        memberId: "m1",
        memberName: "Dimas",
        isMemberArchived: false,
        roleName: "Fotografer",
      },
    ];
    setup("BOOKED", { assignments });
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk sesi Foto keluarga" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Hapus sesi" }));
    expect(screen.getByText("Sesi dihapus dari jadwal proyek ini.")).toBeInTheDocument();
    expect(screen.queryByText(/anggota tim/)).not.toBeInTheDocument();
  });

  it("AC-PRJ-009 opens Tambah sesi after Konfirmasi booking finds no session", async () => {
    const { menu } = setup("DRAFT", { sessions: [], shownSession: null });
    await userEvent.click(screen.getByRole("button", { name: "Konfirmasi booking" }));
    expect(menu.advanceAction).toHaveBeenCalled();
    expect(await screen.findByRole("dialog", { name: "Tambah sesi" })).toBeInTheDocument();
  });

  it("AC-PRJ-017 saves booking field values from Ubah", async () => {
    const { edit } = setup("BOOKED");
    await userEvent.click(screen.getByRole("button", { name: "Ubah" }));
    const dialog = screen.getByRole("dialog", { name: "Ubah field booking" });
    const campus = within(dialog).getByRole("textbox", { name: /Nama kampus/ });
    await userEvent.clear(campus);
    await userEvent.type(campus, "ITB");
    await userEvent.click(within(dialog).getByRole("button", { name: "Simpan" }));
    expect(edit.updateFieldsAction).toHaveBeenCalledWith("ws", "p1", {
      values: { nama_kampus: "ITB", ukuran_toga: null },
    });
  });
});
