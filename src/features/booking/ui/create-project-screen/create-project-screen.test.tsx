import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PROJECT_IDS,
  projectContext,
  projectFixture,
} from "@tests/support/booking/project-fixtures";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AssignableMember } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";

const push = vi.hoisted(() => vi.fn());
const showToast = vi.hoisted(() => vi.fn());
const useMobileViewport = vi.hoisted(() => vi.fn(() => false));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({ useMobileViewport }));
vi.mock("../use-client-search/use-client-search", () => ({
  useClientSearch: () => ({
    items: [
      { id: PROJECT_IDS.rina, name: "Rina", whatsappNumber: "6281234567890", projectCount: 2 },
      { id: PROJECT_IDS.sari, name: "Rina Kartika", whatsappNumber: null, projectCount: 0 },
    ],
    isLoading: false,
  }),
}));

const { CreateProjectScreen } = await import("./create-project-screen");

const serviceGroups = await projectFixture().listActiveServiceOptions(projectContext);
const searchClientsAction = vi.fn().mockResolvedValue([]);

function renderScreen(
  createAction = vi.fn().mockResolvedValue({ ok: true, projectId: "p-1" }),
  options: {
    groups?: typeof serviceGroups;
    hasActiveService?: boolean;
    members?: readonly AssignableMember[];
  } = {},
) {
  render(
    <CreateProjectScreen
      workspaceId="ws-1"
      serviceGroups={options.groups ?? serviceGroups}
      hasActiveService={options.hasActiveService ?? true}
      definitions={[]}
      assignableMembers={options.members ?? []}
      createAction={createAction}
      searchClientsAction={searchClientsAction}
    />,
  );
  return createAction;
}

const DIMAS: AssignableMember = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Dimas Pratama",
  roles: [
    { id: "22222222-2222-4222-8222-222222222222", name: "Fotografer" },
    { id: "33333333-3333-4333-8333-333333333333", name: "Videografer" },
  ],
};

async function addSessionWithTeam() {
  await userEvent.click(screen.getByRole("button", { name: "Tambah sesi" }));
  const dialog = await screen.findByRole("dialog", { name: "Tambah sesi" });
  await userEvent.type(within(dialog).getByRole("textbox", { name: /Nama sesi/ }), "Akad");
  await userEvent.click(within(dialog).getByRole("button", { name: /Tanggal/ }));
  await userEvent.click(within(screen.getByRole("grid")).getByText("15"));
  await userEvent.click(within(dialog).getByRole("button", { name: /Anggota tim/ }));
  await userEvent.click(screen.getByRole("option", { name: "Dimas Pratama" }));
  await userEvent.click(within(dialog).getByRole("button", { name: "Tambah anggota" }));
  await userEvent.click(within(dialog).getByRole("button", { name: "Tambah sesi" }));
}

async function pickClient() {
  await userEvent.click(screen.getByRole("combobox", { name: "Klien" }));
  await userEvent.click(screen.getByRole("option", { name: /^Rina \+62/ }));
}

async function pickService() {
  await userEvent.click(screen.getByRole("button", { name: /^Layanan/ }));
  await userEvent.click(screen.getByRole("option", { name: "Wisuda Basic" }));
}

describe("CreateProjectScreen (S2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMobileViewport.mockReturnValue(false);
  });

  it("AC-PRJ-006 starts empty: pickers, placeholders, no package and no booking fields", () => {
    renderScreen();
    expect(screen.getByText("Klien & layanan")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Klien" })).toHaveAttribute(
      "placeholder",
      "Cari atau tambah klien",
    );
    expect(screen.getByRole("textbox", { name: "Judul proyek" })).toHaveAttribute(
      "placeholder",
      "Terisi otomatis setelah memilih layanan",
    );
    expect(screen.getByRole("textbox", { name: "Harga sepakat" })).toHaveAttribute(
      "placeholder",
      "0",
    );
    expect(screen.getByText("Belum ada sesi")).toBeInTheDocument();
    expect(screen.queryByText("Isi paket")).not.toBeInTheDocument();
    expect(screen.queryByText("Field booking")).not.toBeInTheDocument();
  });

  it("AC-PRJ-006 shows the client matches with their number and project count", async () => {
    renderScreen();
    await userEvent.click(screen.getByRole("combobox", { name: "Klien" }));
    expect(
      screen.getByRole("option", { name: /Rina \+62 812-3456-7890 · 2 proyek/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /Rina Kartika Belum ada nomor WhatsApp/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("KLIEN · 2 COCOK")).toBeInTheDocument();
  });

  it("AC-PRJ-007 picking a client and a service fills title, price, items and fields", async () => {
    renderScreen();
    await pickClient();
    await pickService();
    expect(screen.getByRole("textbox", { name: "Judul proyek" })).toHaveValue(
      "Wisuda Basic — Rina",
    );
    expect(screen.getByRole("textbox", { name: "Harga sepakat" })).toHaveValue("750.000");
    expect(screen.getByText("Harga dasar layanan: Rp 750.000")).toBeInTheDocument();
    expect(screen.getByText("Wisuda · harga dasar Rp 750.000")).toBeInTheDocument();
    expect(screen.getByText("25 foto · hitung foto")).toBeInTheDocument();
    expect(screen.getByText("1–3 orang")).toBeInTheDocument();
    expect(screen.getByText("Isi paket")).toBeInTheDocument();
    expect(screen.getByText("Field booking")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Nama kampus/ })).toBeInTheDocument();
    expect(screen.getByText("+62 812-3456-7890")).toBeInTheDocument();
  });

  it("AC-PRJ-007 an edited title survives a service or client change", async () => {
    renderScreen();
    await pickClient();
    await pickService();
    const title = screen.getByRole("textbox", { name: "Judul proyek" });
    await userEvent.clear(title);
    await userEvent.type(title, "Wisuda Rina UI");
    await userEvent.click(screen.getByRole("combobox", { name: "Klien" }));
    await userEvent.click(screen.getByRole("option", { name: /Rina Kartika/ }));
    expect(title).toHaveValue("Wisuda Rina UI");
  });

  it("AC-PRJ-009 BOOKED without a session shows the error line and sends nothing", async () => {
    const createAction = renderScreen();
    await pickClient();
    await pickService();
    await userEvent.click(screen.getByRole("button", { name: "Buat proyek" }));
    expect(await screen.findByText("Tambahkan minimal satu sesi.")).toBeInTheDocument();
    expect(createAction).not.toHaveBeenCalled();
  });

  it("AC-PRJ-010 reports the empty title and the required booking field", async () => {
    const createAction = renderScreen();
    await pickClient();
    await pickService();
    await userEvent.clear(screen.getByRole("textbox", { name: "Judul proyek" }));
    await userEvent.click(screen.getByRole("button", { name: "Simpan draf" }));
    expect(await screen.findByText("Isi judul proyek.")).toBeInTheDocument();
    expect(screen.getByText("Isi Nama kampus.")).toBeInTheDocument();
    expect(createAction).not.toHaveBeenCalled();
  });

  it("AC-PRJ-029 a draft with the required values saves without a session and opens the project", async () => {
    const createAction = renderScreen();
    await pickClient();
    await pickService();
    await userEvent.type(
      screen.getByRole("textbox", { name: /Nama kampus/ }),
      "Universitas Indonesia",
    );
    await userEvent.click(screen.getByRole("button", { name: /Tanggal wisuda/ }));
    await userEvent.click(within(screen.getByRole("grid")).getByText("15"));
    await userEvent.click(screen.getByRole("button", { name: "Simpan draf" }));
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/w/ws-1/projects/p-1?state=draft-saved");
    });
    expect(createAction).toHaveBeenCalledWith(
      "ws-1",
      expect.objectContaining({ mode: "DRAFT", clientId: PROJECT_IDS.rina, sessions: [] }),
    );
  });

  it("AC-PRJ-008 shows the pending label on the pressed button only", async () => {
    let finish: (value: { ok: true; projectId: string }) => void = vi.fn();
    const createAction = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    renderScreen(createAction);
    await pickClient();
    await pickService();
    await userEvent.type(screen.getByRole("textbox", { name: /Nama kampus/ }), "UI");
    await userEvent.click(screen.getByRole("button", { name: /Tanggal wisuda/ }));
    await userEvent.click(within(screen.getByRole("grid")).getByText("15"));
    await userEvent.click(screen.getByRole("button", { name: "Simpan draf" }));
    expect(await screen.findByText("Menyimpan draf…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buat proyek" })).toBeDisabled();
    expect(screen.queryByText("Membuat proyek…")).not.toBeInTheDocument();
    finish({ ok: true, projectId: "p-1" });
    await waitFor(() => {
      expect(push).toHaveBeenCalled();
    });
  });

  it("AC-PRJ-010 puts a server field error back on its field", async () => {
    const createAction = vi.fn().mockResolvedValue({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { serviceId: "SERVICE_INACTIVE" },
    });
    renderScreen(createAction);
    await pickClient();
    await pickService();
    await userEvent.type(screen.getByRole("textbox", { name: /Nama kampus/ }), "UI");
    await userEvent.click(screen.getByRole("button", { name: /Tanggal wisuda/ }));
    await userEvent.click(within(screen.getByRole("grid")).getByText("15"));
    await userEvent.click(screen.getByRole("button", { name: "Simpan draf" }));
    expect(
      await screen.findByText("Layanan ini sudah tidak aktif. Pilih layanan lain."),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("AC-PRJ-008 a failed request shows the danger toast with a retry and keeps the input", async () => {
    const createAction = vi.fn().mockRejectedValue(new Error("down"));
    renderScreen(createAction);
    await pickClient();
    await pickService();
    await userEvent.type(screen.getByRole("textbox", { name: /Nama kampus/ }), "UI");
    await userEvent.click(screen.getByRole("button", { name: /Tanggal wisuda/ }));
    await userEvent.click(within(screen.getByRole("grid")).getByText("15"));
    await userEvent.click(screen.getByRole("button", { name: "Simpan draf" }));
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: "danger",
          title: "Perubahan belum tersimpan",
          action: { label: "Coba lagi", onAction: expect.any(Function) as () => void },
        }),
      );
    });
    expect(screen.getByRole("textbox", { name: /Nama kampus/ })).toHaveValue("UI");
  });

  it("AC-PRJ-014 shows the no-active-service state and blocks both submit buttons", () => {
    renderScreen(undefined, { groups: [], hasActiveService: false });
    expect(screen.getByRole("button", { name: /^Layanan/ })).toBeDisabled();
    expect(
      screen.getByText(
        "Proyek dibuat dari layanan. Buat atau aktifkan layanan dulu, lalu kembali ke sini.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buka Layanan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simpan draf" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Buat proyek" })).toBeDisabled();
    expect(screen.queryByText("Isi paket")).not.toBeInTheDocument();
    expect(screen.queryByText("Field booking")).not.toBeInTheDocument();
  });

  it("AC-PRJ-012 shows SERVICE_INACTIVE under Layanan, keeps the form and focuses Layanan", async () => {
    const createAction = vi.fn().mockResolvedValue({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { serviceId: "SERVICE_INACTIVE" },
    });
    renderScreen(createAction);
    await pickClient();
    await pickService();
    await userEvent.type(screen.getByRole("textbox", { name: /Nama kampus/ }), "UI");
    await userEvent.click(screen.getByRole("button", { name: /Tanggal wisuda/ }));
    await userEvent.click(within(screen.getByRole("grid")).getByText("15"));
    await userEvent.type(
      screen.getByPlaceholderText("Hanya kamu yang bisa melihat catatan ini."),
      "Catatan",
    );
    await userEvent.click(screen.getByRole("button", { name: "Simpan draf" }));
    expect(
      await screen.findByText("Layanan ini sudah tidak aktif. Pilih layanan lain."),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Hanya kamu yang bisa melihat catatan ini.")).toHaveValue(
      "Catatan",
    );
    expect(screen.getByRole("textbox", { name: "Judul proyek" })).toHaveValue(
      "Wisuda Basic — Rina",
    );
    expect(screen.getByRole("button", { name: /^Layanan/ })).toHaveFocus();
  });

  it("AC-TEAM-028 picks a member and role in the session dialog and sends the team with the form", async () => {
    const createAction = renderScreen(undefined, { members: [DIMAS] });
    await pickClient();
    await pickService();
    await addSessionWithTeam();
    expect(screen.getByRole("button", { name: "Tim Akad: 1 anggota" })).toHaveTextContent("DP");
    await userEvent.type(screen.getByRole("textbox", { name: /Nama kampus/ }), "UI");
    await userEvent.click(screen.getByRole("button", { name: /Tanggal wisuda/ }));
    await userEvent.click(within(screen.getByRole("grid")).getByText("15"));
    await userEvent.click(screen.getByRole("button", { name: "Simpan draf" }));
    await waitFor(() => {
      expect(createAction).toHaveBeenCalled();
    });
    const sessions = (createAction.mock.calls[0]?.[1] as { sessions: { team: unknown[] }[] })
      .sessions;
    expect(sessions[0]?.team).toEqual([{ memberId: DIMAS.id, roleId: DIMAS.roles[0]?.id }]);
  });

  it("AC-TEAM-028 shows the refused team under the schedule when the server rejects it", async () => {
    const createAction = vi.fn().mockResolvedValue({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { "sessions.0.team": "TEAM_INVALID" },
    });
    renderScreen(createAction, { members: [DIMAS] });
    await pickClient();
    await pickService();
    await addSessionWithTeam();
    await userEvent.type(screen.getByRole("textbox", { name: /Nama kampus/ }), "UI");
    await userEvent.click(screen.getByRole("button", { name: /Tanggal wisuda/ }));
    await userEvent.click(within(screen.getByRole("grid")).getByText("15"));
    await userEvent.click(screen.getByRole("button", { name: "Simpan draf" }));
    expect(
      await screen.findByText("Tim sesi ini perlu diperbarui. Periksa anggota dan perannya."),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
