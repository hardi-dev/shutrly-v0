import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PROJECT_IDS,
  projectContext,
  projectFixture,
} from "@tests/support/booking/project-fixtures";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));
vi.mock("../use-client-search/use-client-search", () => ({
  useClientSearch: () => ({
    items: [
      { id: PROJECT_IDS.rina, name: "Rina", whatsappNumber: "6281234567890", projectCount: 2 },
    ],
    isLoading: false,
  }),
}));

const { CreateProjectScreen } = await import("./create-project-screen");

const [wisuda] = await projectFixture().listActiveServiceOptions(projectContext);
const baseService = wisuda.services[0];
const prewed = {
  ...baseService,
  id: "00000000-0000-4000-8000-0000000000c9",
  name: "Prewed Basic",
  basePrice: "1500000",
  items: [],
  fields: [],
};
const groups = [{ ...wisuda, services: [baseService, prewed] }];
const definitions = [
  {
    id: PROJECT_IDS.fotoEdit,
    name: "Foto edit",
    unit: "foto",
    valueType: "NUMBER",
    selectionRequired: true,
    pickMode: "COUNT",
    allowsPickNotes: true,
  },
  {
    id: PROJECT_IDS.fotoCetak,
    name: "Foto cetak",
    unit: "foto",
    valueType: "NUMBER",
    selectionRequired: true,
    pickMode: "QUANTITY",
    allowsPickNotes: false,
  },
] as const;

function renderScreen() {
  render(
    <CreateProjectScreen
      workspaceId="ws-1"
      serviceGroups={groups}
      hasActiveService
      definitions={definitions}
      assignableMembers={[]}
      createAction={vi.fn()}
      searchClientsAction={vi.fn()}
    />,
  );
}

async function pickWisuda() {
  await userEvent.click(screen.getByRole("combobox", { name: "Klien" }));
  await userEvent.click(screen.getByRole("option", { name: /^Rina \+62/ }));
  await userEvent.click(screen.getByRole("button", { name: /^Layanan/ }));
  await userEvent.click(screen.getByRole("option", { name: "Wisuda Basic" }));
}

describe("Proyek baru package edits (AC-PRJ-030)", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("AC-PRJ-030 changes an item's value and shows it in the row", async () => {
    renderScreen();
    await pickWisuda();
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk item Foto edit" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Ubah nilai" }));
    const dialog = screen.getByRole("dialog", { name: "Ubah nilai · Foto edit" });
    const field = within(dialog).getByRole("textbox", { name: "Jumlah" });
    await userEvent.clear(field);
    await userEvent.type(field, "30");
    await userEvent.click(within(dialog).getByRole("button", { name: "Simpan" }));
    expect(screen.getByText("30 foto · hitung foto")).toBeInTheDocument();
  });

  it("AC-PRJ-017 refuses a decimal on a selection item and leaves the draft unchanged", async () => {
    renderScreen();
    await pickWisuda();
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk item Foto edit" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Ubah nilai" }));
    const dialog = screen.getByRole("dialog", { name: "Ubah nilai · Foto edit" });
    const field = within(dialog).getByRole("textbox", { name: "Jumlah" });
    await userEvent.clear(field);
    await userEvent.type(field, "2,5");
    await userEvent.click(within(dialog).getByRole("button", { name: "Simpan" }));
    expect(within(dialog).getByText("Harus angka bulat.")).toBeInTheDocument();
    expect(screen.getByText("25 foto · hitung foto")).toBeInTheDocument();
  });

  it("AC-PRJ-030 removes an item after confirming", async () => {
    renderScreen();
    await pickWisuda();
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk item Jumlah orang" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Hapus" }));
    expect(screen.getByText("Hapus Jumlah orang?")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Hapus item" }));
    expect(screen.queryByText("Jumlah orang")).not.toBeInTheDocument();
  });

  it("AC-PRJ-030 offers only definitions not in the draft and appends the added item", async () => {
    renderScreen();
    await pickWisuda();
    await userEvent.click(screen.getByRole("button", { name: "Tambah item" }));
    const dialog = screen.getByRole("dialog", { name: "Tambah item" });
    await userEvent.click(within(dialog).getByRole("button", { name: /Item/ }));
    const options = screen.getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(["Foto cetakfoto"]);
    await userEvent.click(options[0]);
    await userEvent.type(within(dialog).getByRole("textbox", { name: "Jumlah" }), "10");
    await userEvent.click(within(dialog).getByRole("button", { name: "Tambah item" }));
    expect(screen.getByText("Foto cetak")).toBeInTheDocument();
  });

  it("AC-PRJ-030 switches service at once while the package is untouched", async () => {
    renderScreen();
    await pickWisuda();
    await userEvent.click(screen.getByRole("button", { name: /^Layanan/ }));
    await userEvent.click(screen.getByRole("option", { name: "Prewed Basic" }));
    expect(screen.queryByText("Ganti layanan?")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Harga sepakat" })).toHaveValue("1.500.000");
  });

  it("AC-PRJ-030 asks before replacing an edited package and keeps the edits on Batal", async () => {
    renderScreen();
    await pickWisuda();
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk item Jumlah orang" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Hapus" }));
    await userEvent.click(screen.getByRole("button", { name: "Hapus item" }));
    await userEvent.click(screen.getByRole("button", { name: /^Layanan/ }));
    await userEvent.click(screen.getByRole("option", { name: "Prewed Basic" }));
    expect(screen.getByText("Ganti layanan?")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Perubahan isi paket akan hilang. Isi paket diganti dengan isi Prewed Basic.",
      ),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByText("Jumlah orang")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Harga sepakat" })).toHaveValue("750.000");
  });

  it("AC-PRJ-030 replaces the package, price and title when the change is confirmed", async () => {
    renderScreen();
    await pickWisuda();
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk item Jumlah orang" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Hapus" }));
    await userEvent.click(screen.getByRole("button", { name: "Hapus item" }));
    await userEvent.click(screen.getByRole("button", { name: /^Layanan/ }));
    await userEvent.click(screen.getByRole("option", { name: "Prewed Basic" }));
    await userEvent.click(screen.getByRole("button", { name: "Ganti layanan" }));
    expect(screen.getByRole("textbox", { name: "Harga sepakat" })).toHaveValue("1.500.000");
    expect(screen.getByRole("textbox", { name: "Judul proyek" })).toHaveValue(
      "Prewed Basic — Rina",
    );
    expect(screen.getByText("Layanan ini belum punya item paket")).toBeInTheDocument();
  });
});
