import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useMobileViewport = vi.fn();
const showToast = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));

const { TeamRolesScreen } = await import("./team-roles-screen");

const ROLES = [
  { id: "asisten", name: "Asisten", usage: 3 },
  { id: "drone", name: "Drone", usage: 0 },
];

function setup(overrides = {}) {
  const addAction = vi.fn().mockResolvedValue({ ok: true, role: { id: "new", name: "Editor" } });
  const renameAction = vi.fn().mockResolvedValue(undefined);
  const deleteAction = vi.fn().mockResolvedValue({ ok: true });
  render(
    <>
      <div id="owner-page-actions" />
      <TeamRolesScreen
        workspaceId="ws"
        roles={ROLES}
        addAction={addAction}
        renameAction={renameAction}
        deleteAction={deleteAction}
        {...overrides}
      />
    </>,
  );
  return { addAction, renameAction, deleteAction };
}

describe("TeamRolesScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMobileViewport.mockReturnValue(false);
  });

  it("AC-TEAM-009 shows each role with its usage in the desktop table", () => {
    setup();
    expect(screen.getByRole("grid", { name: "Daftar peran" })).toBeInTheDocument();
    expect(screen.getByText("2 peran · dipilih saat menambah anggota")).toBeInTheDocument();
    expect(screen.getByText("3 anggota")).toBeInTheDocument();
    expect(screen.getByText("Belum dipakai")).toBeInTheDocument();
  });

  it("AC-TEAM-009 shows the phone list with the usage as meta", () => {
    useMobileViewport.mockReturnValue(true);
    setup();
    expect(screen.getByRole("radiogroup", { name: "Bagian tim" })).toBeInTheDocument();
    expect(screen.getByText("2 peran")).toBeInTheDocument();
    expect(screen.getByText("3 anggota")).toBeInTheDocument();
  });

  it("C-007 shows an empty state when there are no roles", () => {
    setup({ roles: [] });
    expect(screen.getByText("Belum ada peran")).toBeInTheDocument();
  });

  it("AC-TEAM-009 shows the duplicate name under the field and keeps the dialog open", async () => {
    const { addAction } = setup({
      addAction: vi.fn().mockResolvedValue({
        ok: false,
        code: "VALIDATION_FAILED",
        fieldErrors: { name: "DUPLICATE" },
      }),
    });
    await userEvent.click(screen.getByRole("button", { name: "Tambah peran" }));
    await userEvent.type(screen.getByLabelText("Nama peran"), "videografer");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(await screen.findByText("Peran ini sudah ada.")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama peran")).toHaveValue("videografer");
    expect(addAction).not.toHaveBeenCalled();
  });

  it("AC-TEAM-009 validates an empty name before calling the server", async () => {
    const { addAction } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Tambah peran" }));
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(await screen.findByText("Isi nama peran.")).toBeInTheDocument();
    expect(addAction).not.toHaveBeenCalled();
  });

  it("AC-TEAM-009 adds a role and shows the success toast", async () => {
    const { addAction } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Tambah peran" }));
    await userEvent.type(screen.getByLabelText("Nama peran"), "Editor");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(addAction).toHaveBeenCalledWith("ws", { name: "Editor" });
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ tone: "success", title: "Peran ditambahkan" }),
    );
  });

  it("AC-TEAM-009 opens the blocked dialog for a used role, offering only Tutup", async () => {
    const { deleteAction } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk Asisten" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Hapus" }));
    expect(await screen.findByText("Peran Asisten tidak bisa dihapus")).toBeInTheDocument();
    expect(screen.getByText("Peran ini masih dipakai 3 anggota.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Hapus" })).not.toBeInTheDocument();
    // The modal header's close button shares the name; the footer button is the last one.
    await userEvent.click(screen.getAllByRole("button", { name: "Tutup" }).at(-1) as HTMLElement);
    expect(deleteAction).not.toHaveBeenCalled();
  });

  it("AC-TEAM-009 deletes an unused role after confirmation", async () => {
    const { deleteAction } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk Drone" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Hapus" }));
    expect(await screen.findByText('Hapus peran "Drone"?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Hapus" }));
    expect(deleteAction).toHaveBeenCalledWith("ws", "drone");
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ tone: "success", title: "Peran dihapus" }),
    );
  });

  it("AC-TEAM-009 flips to the blocked dialog when the server reports the role in use", async () => {
    setup({ deleteAction: vi.fn().mockResolvedValue({ ok: false, code: "IN_USE", usage: 1 }) });
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk Drone" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Hapus" }));
    await userEvent.click(screen.getByRole("button", { name: "Hapus" }));
    expect(await screen.findByText("Peran ini masih dipakai 1 anggota.")).toBeInTheDocument();
  });

  it("AC-TEAM-023 shows the retryable failure toast and keeps the input when saving throws", async () => {
    setup({ addAction: vi.fn().mockRejectedValue(new Error("boom")) });
    await userEvent.click(screen.getByRole("button", { name: "Tambah peran" }));
    await userEvent.type(screen.getByLabelText("Nama peran"), "Editor");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: "danger",
        title: "Perubahan belum tersimpan",
        action: expect.objectContaining({ label: "Coba lagi" }) as unknown,
      }),
    );
    expect(screen.getByLabelText("Nama peran")).toHaveValue("Editor");
  });

  it("C-008 returns focus to the row's ⋯ trigger when the dialog closes", async () => {
    setup();
    const trigger = screen.getByRole("button", { name: "Aksi untuk Asisten" });
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("menuitem", { name: "Hapus" }));
    await screen.findByText("Peran Asisten tidak bisa dihapus");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });
});
