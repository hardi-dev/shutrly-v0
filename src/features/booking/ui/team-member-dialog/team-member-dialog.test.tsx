import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useMobileViewport = vi.fn();
const showToast = vi.fn();

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));

const { TeamMemberDialog } = await import("./team-member-dialog");

const FOTOGRAFER = { id: "6f1c1b0e-8a5d-4a43-a3b6-3c2f7c0f1a11", name: "Fotografer" };
const VIDEOGRAFER = { id: "0b7d5c0c-2f7e-4a1b-9c7e-5a3c1f2d9e22", name: "Videografer" };
const MUA = { id: "9c5a3f0e-1d2b-4c6a-8e7f-2b1a0d9c8e77", name: "MUA" };

function setup(overrides = {}) {
  const addAction = vi.fn().mockResolvedValue({ ok: true, member: { id: "m", name: "Rina" } });
  const updateAction = vi.fn().mockResolvedValue(undefined);
  const addRoleAction = vi.fn().mockResolvedValue({ ok: true, role: MUA });
  const onOpenChange = vi.fn();
  render(
    <TeamMemberDialog
      isOpen
      workspaceId="ws"
      onOpenChange={onOpenChange}
      roles={[FOTOGRAFER, VIDEOGRAFER]}
      addAction={addAction}
      updateAction={updateAction}
      addRoleAction={addRoleAction}
      {...overrides}
    />,
  );
  return { addAction, updateAction, addRoleAction, onOpenChange };
}

async function pickRole(name: string) {
  await userEvent.click(screen.getByRole("button", { name: /^Peran/ }));
  await userEvent.click(screen.getByRole("option", { name: name }));
  await userEvent.keyboard("{Escape}");
}

async function fillValid() {
  await userEvent.type(screen.getByLabelText("Nama"), "  Rina  ");
  await userEvent.type(screen.getByLabelText("Nomor WhatsApp"), "0812-3456-7890");
  await userEvent.type(screen.getByLabelText(/^Email/), "Rina@Example.com");
  await pickRole("Fotografer");
}

describe("TeamMemberDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMobileViewport.mockReturnValue(false);
  });

  it("AC-TEAM-004 adds a member with the typed values and shows the success toast", async () => {
    const { addAction, onOpenChange } = setup();
    expect(screen.getByRole("dialog", { name: "Tambah anggota" })).toBeInTheDocument();
    expect(screen.getByText("Contoh: 0812 3456 7890")).toBeInTheDocument();
    await fillValid();
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => {
      expect(addAction).toHaveBeenCalledWith("ws", {
        name: "  Rina  ",
        whatsappNumber: "0812-3456-7890",
        email: "Rina@Example.com",
        roleIds: [FOTOGRAFER.id],
      });
    });
    expect(showToast).toHaveBeenCalledWith({
      tone: "success",
      title: "Anggota ditambahkan",
      body: "Rina siap dipilih di jadwal proyek.",
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Revision OT #1 #2 hands the new member with their roles to onAdded", async () => {
    const onAdded = vi.fn();
    setup({ onAdded });
    await fillValid();
    await pickRole("Videografer");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => {
      expect(onAdded).toHaveBeenCalledWith({
        id: "m",
        name: "Rina",
        roles: [FOTOGRAFER, VIDEOGRAFER],
      });
    });
  });

  it("AC-TEAM-004 prefills an edit and saves it through the update action", async () => {
    const { updateAction, addAction } = setup({
      member: {
        id: "m1",
        name: "Dimas Pratama",
        whatsappNumber: "6281298765432",
        email: null,
        roles: [FOTOGRAFER, VIDEOGRAFER],
        isArchived: false,
      },
    });
    expect(screen.getByRole("dialog", { name: "Ubah anggota" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nama")).toHaveValue("Dimas Pratama");
    expect(screen.getByLabelText("Nomor WhatsApp")).toHaveValue("+62 812-9876-5432");
    expect(screen.getByRole("button", { name: /^Peran/ })).toHaveTextContent(
      "Fotografer, Videografer",
    );
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => {
      expect(updateAction).toHaveBeenCalledWith("ws", "m1", {
        name: "Dimas Pratama",
        whatsappNumber: "+62 812-9876-5432",
        email: "",
        roleIds: [FOTOGRAFER.id, VIDEOGRAFER.id],
      });
    });
    expect(addAction).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Perubahan disimpan" }),
    );
  });

  it("AC-TEAM-005 shows every field message and calls no action", async () => {
    const { addAction } = setup();
    await userEvent.type(screen.getByLabelText("Nomor WhatsApp"), "12345");
    await userEvent.type(screen.getByLabelText(/^Email/), "rina@");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(await screen.findByText("Isi nama anggota.")).toBeInTheDocument();
    expect(screen.getByText("Nomor WhatsApp tidak valid")).toBeInTheDocument();
    expect(screen.getByText("Masukkan email yang valid.")).toBeInTheDocument();
    expect(screen.getByText("Pilih minimal satu peran.")).toBeInTheDocument();
    expect(addAction).not.toHaveBeenCalled();
  });

  it("AC-TEAM-005 asks for a number when it is blank", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(await screen.findByText("Nomor WhatsApp wajib diisi")).toBeInTheDocument();
  });

  it("AC-TEAM-005 limits the name to 100 characters", async () => {
    setup();
    await userEvent.click(screen.getByLabelText("Nama"));
    await userEvent.paste("a".repeat(101));
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(await screen.findByText("Nama paling banyak 100 karakter.")).toBeInTheDocument();
  });

  it("AC-TEAM-006 names the archived holder of a taken number and keeps the dialog open", async () => {
    const { onOpenChange } = setup({
      addAction: vi.fn().mockResolvedValue({
        ok: false,
        code: "VALIDATION_FAILED",
        fieldErrors: { whatsappNumber: "TAKEN" },
        numberHolder: { name: "Budi Hartono", isArchived: true },
      }),
    });
    await fillValid();
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(
      await screen.findByText("Nomor ini sudah dipakai Budi Hartono (diarsipkan)."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nomor WhatsApp")).toHaveValue("0812-3456-7890");
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("AC-TEAM-010 creates MUA from the Peran field, selects it and returns to the member dialog", async () => {
    const { addRoleAction } = setup();
    await pickRole("Fotografer");
    await userEvent.click(screen.getByRole("button", { name: /^Peran/ }));
    await userEvent.click(screen.getByRole("button", { name: "Tambah peran baru" }));
    const roleDialog = await screen.findByRole("dialog", { name: "Tambah peran" });
    await userEvent.type(within(roleDialog).getByLabelText("Nama peran"), "MUA");
    await userEvent.click(within(roleDialog).getByRole("button", { name: "Simpan" }));
    await waitFor(() => {
      expect(addRoleAction).toHaveBeenCalledWith("ws", { name: "MUA" });
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Tambah peran" })).not.toBeInTheDocument();
    });
    expect(screen.getByRole("dialog", { name: "Tambah anggota" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Peran/ })).toHaveTextContent("Fotografer, MUA");
    expect(screen.getByLabelText("Nama")).toBeInTheDocument();
  });

  it("AC-TEAM-023 keeps the input and shows the retryable danger toast when saving fails", async () => {
    setup({ addAction: vi.fn().mockRejectedValue(new Error("boom")) });
    await fillValid();
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: "danger",
          title: "Perubahan belum tersimpan",
          action: expect.objectContaining({ label: "Coba lagi" }) as unknown,
        }),
      );
    });
    expect(screen.getByLabelText("Nama")).toHaveValue("  Rina  ");
    expect(screen.getByRole("dialog", { name: "Tambah anggota" })).toBeInTheDocument();
  });

  it("AC-TEAM-004 shows the form in a phone sheet", () => {
    useMobileViewport.mockReturnValue(true);
    setup();
    expect(screen.getByRole("dialog", { name: "Tambah anggota" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nama")).toBeInTheDocument();
  });

  it("AC-TEAM-004 shows a placeholder in the WhatsApp field", () => {
    setup();
    expect(screen.getByRole("textbox", { name: /Nomor WhatsApp/ })).toHaveAttribute(
      "placeholder",
      "0812 3456 7890",
    );
  });
});
