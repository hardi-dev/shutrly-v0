import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useMobileViewport = vi.fn();
const showToast = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace }) }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));

const { TeamMembersScreen } = await import("./team-members-screen");

const FOTOGRAFER = { id: "r1", name: "Fotografer" };
const VIDEOGRAFER = { id: "r2", name: "Videografer" };
const ASISTEN = { id: "r3", name: "Asisten" };

const AYU = {
  id: "m1",
  name: "Ayu Kirana",
  whatsappNumber: "6281244102231",
  email: null,
  roles: [ASISTEN],
  isArchived: false,
};
const DIMAS = {
  id: "m2",
  name: "Dimas Pratama",
  whatsappNumber: "6281298765432",
  email: null,
  roles: [FOTOGRAFER, VIDEOGRAFER],
  isArchived: false,
};

function setup(overrides = {}) {
  const loadMoreAction = vi.fn().mockResolvedValue({ items: [], nextCursor: null });
  render(
    <>
      <div id="owner-page-actions" />
      <TeamMembersScreen
        workspaceId="ws"
        status="ACTIVE"
        count={2}
        q=""
        initialPage={{ items: [AYU, DIMAS], nextCursor: null }}
        loadMoreAction={loadMoreAction}
        roles={[FOTOGRAFER, VIDEOGRAFER, ASISTEN]}
        addAction={vi.fn()}
        updateAction={vi.fn()}
        addRoleAction={vi.fn()}
        setArchivedAction={vi.fn().mockResolvedValue(undefined)}
        deleteAction={vi.fn().mockResolvedValue({ ok: true })}
        {...overrides}
      />
    </>,
  );
  return { loadMoreAction };
}

describe("TeamMembersScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMobileViewport.mockReturnValue(false);
  });

  it("AC-TEAM-001 shows each member's name, formatted number and roles, with no money", () => {
    setup();
    const table = screen.getByRole("grid", { name: "Daftar anggota" });
    expect(table).toBeInTheDocument();
    expect(screen.getByText("2 anggota aktif")).toBeInTheDocument();
    expect(screen.getByText("Dimas Pratama")).toBeInTheDocument();
    expect(screen.getByText("+62 812-9876-5432")).toBeInTheDocument();
    expect(screen.getByText("Fotografer, Videografer")).toBeInTheDocument();
    expect(screen.getByText("Asisten")).toBeInTheDocument();
    expect(table.textContent).not.toMatch(/Rp|fee|tarif/i);
  });

  it("AC-TEAM-001 shows the phone list with the roles as meta and the tab selector", () => {
    useMobileViewport.mockReturnValue(true);
    setup();
    expect(screen.getByRole("radiogroup", { name: "Bagian tim" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveAttribute("placeholder", "Cari nama atau nomor");
    expect(screen.getByText("Fotografer, Videografer")).toBeInTheDocument();
  });

  it("AC-TEAM-001 counts archived members on the Arsip tab", () => {
    setup({ status: "ARCHIVED", count: 1, initialPage: { items: [AYU], nextCursor: null } });
    expect(screen.getByText("1 anggota diarsipkan")).toBeInTheDocument();
  });

  it("AC-TEAM-002 shows the Aktif empty state", () => {
    setup({ count: 0, initialPage: { items: [], nextCursor: null } });
    expect(screen.getByText("Belum ada anggota tim")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Catat freelancer yang sering kamu ajak, lalu pilih mereka di jadwal proyek.",
      ),
    ).toBeInTheDocument();
  });

  it("AC-TEAM-002 shows the Arsip empty state", () => {
    setup({ status: "ARCHIVED", count: 0, initialPage: { items: [], nextCursor: null } });
    expect(screen.getByText("Belum ada anggota yang diarsipkan")).toBeInTheDocument();
  });

  it("AC-TEAM-003 shows the no-match state with Hapus pencarian, which drops q from the URL", async () => {
    setup({ q: "zzz", initialPage: { items: [], nextCursor: null } });
    expect(screen.getByText("Tidak ada anggota yang cocok")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveValue("zzz");
    // The search box's clear icon and the empty state's button share a name; the button is last.
    const [, emptyStateButton] = screen.getAllByRole("button", { name: "Hapus pencarian" });
    await userEvent.click(emptyStateButton);
    expect(replace).toHaveBeenCalledWith("/w/ws/team");
  });

  it("AC-TEAM-003 hides the footer without a next page and appends the next page when there is one", async () => {
    const { loadMoreAction } = setup({ initialPage: { items: [AYU], nextCursor: "m1" } });
    loadMoreAction.mockResolvedValue({ items: [DIMAS], nextCursor: null });
    await userEvent.click(screen.getByRole("button", { name: "Muat lebih banyak" }));
    expect(loadMoreAction).toHaveBeenCalledWith("ws", { status: "ACTIVE", q: "", afterId: "m1" });
    expect(await screen.findByText("Dimas Pratama")).toBeInTheDocument();
    expect(screen.getByText("Ayu Kirana")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Muat lebih banyak" })).not.toBeInTheDocument();
    });
  });

  it("AC-TEAM-003 shows no footer when nothing more can load", () => {
    setup();
    expect(screen.queryByRole("button", { name: "Muat lebih banyak" })).not.toBeInTheDocument();
  });

  it("AC-TEAM-023 keeps the rows and shows a retryable danger toast when loading more fails", async () => {
    const { loadMoreAction } = setup({ initialPage: { items: [AYU], nextCursor: "m1" } });
    loadMoreAction.mockRejectedValue(new Error("boom"));
    await userEvent.click(screen.getByRole("button", { name: "Muat lebih banyak" }));
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ tone: "danger", title: "Perubahan belum tersimpan" }),
      );
    });
    expect(screen.getByText("Ayu Kirana")).toBeInTheDocument();
  });

  it("AC-TEAM-004 opens the add dialog from the header button", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Tambah anggota" }));
    expect(await screen.findByRole("dialog", { name: "Tambah anggota" })).toBeInTheDocument();
  });

  it("AC-TEAM-004 opens Ubah with the member's values when a row is activated", async () => {
    setup();
    await userEvent.click(screen.getByText("Dimas Pratama"));
    expect(await screen.findByRole("dialog", { name: "Ubah anggota" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nama")).toHaveValue("Dimas Pratama");
  });

  it("AC-TEAM-002 offers Tambah anggota in the phone empty state", async () => {
    useMobileViewport.mockReturnValue(true);
    setup({ count: 0, initialPage: { items: [], nextCursor: null } });
    const buttons = screen.getAllByRole("button", { name: "Tambah anggota" });
    await userEvent.click(buttons[buttons.length - 1]);
    expect(await screen.findByRole("dialog", { name: "Tambah anggota" })).toBeInTheDocument();
  });

  it("AC-TEAM-007 archives from the row menu, offers Batalkan and restores on undo", async () => {
    const setArchivedAction = vi.fn().mockResolvedValue(undefined);
    setup({ setArchivedAction });
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk Dimas Pratama" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Arsipkan" }));
    await waitFor(() => {
      expect(setArchivedAction).toHaveBeenCalledWith("ws", "m2", true);
    });
    const toast = showToast.mock.calls.at(-1)?.[0] as {
      title: string;
      body: string;
      action: { label: string; onAction: () => void };
    };
    expect(toast.title).toBe("Dimas Pratama diarsipkan");
    expect(toast.body).toBe("Penugasannya tetap tersimpan.");
    expect(toast.action.label).toBe("Batalkan");
    toast.action.onAction();
    await waitFor(() => {
      expect(setArchivedAction).toHaveBeenLastCalledWith("ws", "m2", false);
    });
  });

  it("AC-TEAM-007 opens the blocked dialog when the member has assignments", async () => {
    const deleteAction = vi.fn().mockResolvedValue({ ok: false, code: "HAS_ASSIGNMENTS" });
    setup({ deleteAction });
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk Dimas Pratama" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Hapus" }));
    await userEvent.click(await screen.findByRole("button", { name: "Hapus" }));
    expect(await screen.findByText("Dimas Pratama tidak bisa dihapus")).toBeInTheDocument();
  });

  it("AC-TEAM-007 does not open Ubah when the row menu is used", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk Dimas Pratama" }));
    expect(screen.queryByRole("dialog", { name: "Ubah anggota" })).not.toBeInTheDocument();
  });
});
