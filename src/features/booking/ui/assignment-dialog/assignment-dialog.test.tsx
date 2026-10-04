import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useMobileViewport = vi.fn();
const showToast = vi.fn();
const push = vi.fn();
const refresh = vi.fn();

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

const { AssignmentDialog } = await import("./assignment-dialog");

const SESSION = {
  id: "s2",
  name: "Resepsi",
  date: "2026-11-10",
  startTime: "07:30",
  endTime: "10:00",
  location: "Balairung UI, Depok",
  createdAt: "2026-10-01T00:00:01Z",
};
const DIMAS = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Dimas Pratama",
  roles: [
    { id: "r1", name: "Fotografer" },
    { id: "r2", name: "Videografer" },
  ],
};
const AYU = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Ayu Kirana",
  roles: [{ id: "r3", name: "Asisten" }],
};

function setup(overrides = {}) {
  const addAction = vi.fn().mockResolvedValue({ ok: true });
  const onOpenChange = vi.fn();
  const onSaved = vi.fn();
  render(
    <AssignmentDialog
      isOpen
      workspaceId="ws"
      projectId="p1"
      session={SESSION}
      members={[AYU, DIMAS]}
      onOpenChange={onOpenChange}
      onSaved={onSaved}
      addAction={addAction}
      {...overrides}
    />,
  );
  return { addAction, onOpenChange, onSaved };
}

async function pick(label: RegExp, option: string) {
  await userEvent.click(screen.getByRole("button", { name: label }));
  await userEvent.click(screen.getByRole("option", { name: option }));
}

describe("AssignmentDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMobileViewport.mockReturnValue(false);
  });

  it("AC-TEAM-011 shows the session in the header and preselects the member's first role", async () => {
    setup();
    expect(screen.getByRole("dialog", { name: "Tambah anggota · Resepsi" })).toBeInTheDocument();
    expect(screen.getByText(/Balairung UI, Depok/)).toBeInTheDocument();
    expect(screen.getByText("Hanya anggota aktif yang belum ada di sesi ini.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah" })).toBeDisabled();
    await pick(/^Anggota/, "Dimas Pratama");
    expect(screen.getByRole("button", { name: /^Peran/ })).toHaveTextContent("Fotografer");
    expect(screen.getByText("Peran yang dimiliki Dimas Pratama.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah" })).toBeEnabled();
  });

  it("AC-TEAM-011 saves the changed role, shows the toast and reports the save", async () => {
    const { addAction, onSaved } = setup();
    await pick(/^Anggota/, "Dimas Pratama");
    await pick(/^Peran/, "Videografer");
    await userEvent.click(screen.getByRole("button", { name: "Tambah" }));
    await waitFor(() => {
      expect(addAction).toHaveBeenCalledWith("ws", "p1", "s2", {
        memberId: DIMAS.id,
        roleId: "r2",
      });
    });
    expect(showToast).toHaveBeenCalledWith({
      tone: "success",
      title: "Anggota ditambahkan",
      body: "Dimas Pratama bertugas di Resepsi sebagai Videografer.",
    });
    expect(refresh).toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalledOnce();
  });

  it("AC-TEAM-011 resets the role when another member is picked", async () => {
    setup();
    await pick(/^Anggota/, "Dimas Pratama");
    await pick(/^Peran/, "Videografer");
    await pick(/^Anggota/, "Ayu Kirana");
    expect(screen.getByRole("button", { name: /^Peran/ })).toHaveTextContent("Asisten");
  });

  it.each([
    ["ALREADY_ASSIGNED", "Dimas Pratama sudah ada di sesi ini."],
    ["MEMBER_ARCHIVED", "Dimas Pratama sudah diarsipkan."],
    ["ROLE_NOT_HELD", "Dimas Pratama tidak punya peran ini lagi."],
  ])("AC-TEAM-013 shows %s as a form error and keeps the dialog open", async (code, text) => {
    const { onSaved, onOpenChange } = setup({
      addAction: vi.fn().mockResolvedValue({ ok: false, code }),
    });
    await pick(/^Anggota/, "Dimas Pratama");
    await userEvent.click(screen.getByRole("button", { name: "Tambah" }));
    expect(await screen.findByText(text)).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Tambah anggota · Resepsi" })).toBeInTheDocument();
  });

  it("AC-TEAM-015 shows a danger toast, refreshes and closes when the project was cancelled", async () => {
    const { onOpenChange } = setup({
      addAction: vi.fn().mockResolvedValue({ ok: false, code: "PROJECT_CANCELLED" }),
    });
    await pick(/^Anggota/, "Dimas Pratama");
    await userEvent.click(screen.getByRole("button", { name: "Tambah" }));
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith({
        tone: "danger",
        title: "Proyek dibatalkan; tim tidak bisa diubah.",
      });
    });
    expect(refresh).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("AC-TEAM-023 shows a danger toast and keeps the choices when the save throws", async () => {
    setup({ addAction: vi.fn().mockRejectedValue(new Error("boom")) });
    await pick(/^Anggota/, "Dimas Pratama");
    await userEvent.click(screen.getByRole("button", { name: "Tambah" }));
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ tone: "danger", title: "Perubahan belum tersimpan" }),
      );
    });
    expect(screen.getByRole("button", { name: /^Anggota/ })).toHaveTextContent("Dimas Pratama");
  });

  it("AC-TEAM-027 shows the empty state with a disabled Tambah and Buka Tim when no member can be added", async () => {
    setup({ members: [] });
    expect(screen.getByText("Belum ada anggota tim aktif")).toBeInTheDocument();
    expect(
      screen.getByText("Tambahkan anggota di halaman Tim dulu, lalu kembali ke sini."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Buka Tim" }));
    expect(push).toHaveBeenCalledWith("/w/ws/team");
  });

  it("AC-TEAM-011 shows the form in a phone sheet", () => {
    useMobileViewport.mockReturnValue(true);
    setup();
    expect(screen.getByRole("dialog", { name: "Tambah anggota · Resepsi" })).toBeInTheDocument();
  });
});
