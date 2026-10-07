// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { ClientBrowsePageView } from "@/features/gallery/application/use-cases/browse-client-photos/browse-client-photos.types";

import type { ClientBrowseAction } from "../use-client-browse/use-client-browse.types";
import type { PhotosActions } from "../use-proof-downloads/use-proof-downloads.types";
import { ClientBrowseScreen } from "./client-browse-screen";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const GATE = { studioName: "Studio Senja", projectTitle: "Wisuda Rina", clientFirstName: "Rina" };
const photo = (n: number) => ({
  id: `p-${String(n)}`,
  fileName: `IMG_00${String(n)}.jpg`,
  folderPath: "",
  thumb: { src: `/g/T1/media/p-${String(n)}/thumb` },
  preview: { src: `/g/T1/media/p-${String(n)}/preview` },
  missing: false,
});
const ROOT: ClientBrowsePageView = {
  mode: "FOLDER",
  proofTotal: 24,
  editedTotal: 0,
  printTotal: 0,
  sourceId: "s-1",
  isSingleSource: true,
  folders: [{ name: "Akad", count: 12, sourceId: "s-1", path: "Akad" }],
  summary: { folderCount: 1, photoCount: 2 },
  photos: [photo(1), photo(2)],
  nextCursor: null,
};

const EDIT_GROUP = {
  id: "g-edit",
  name: "Foto edit",
  unit: "foto",
  mode: "COUNT" as const,
  allowsPickNotes: false,
  limit: 3,
  usage: 0,
  status: "OPEN" as const,
};

function renderScreen(
  action: ClientBrowseAction,
  initialPage: ClientBrowsePageView | null = ROOT,
  photosActions: Partial<PhotosActions> = {},
) {
  const all = {
    listDownloads: vi.fn(() =>
      Promise.resolve(
        [1, 2].map((n) => ({
          id: `p-${String(n)}`,
          fileName: `IMG_00${String(n)}.jpg`,
          downloadUrl: `/g/T1/download/p-${String(n)}`,
        })),
      ),
    ),
    setPicks: vi.fn(() => Promise.resolve({ ok: true as const, usage: 2, added: 2 })),
    ...photosActions,
  };
  render(
    <ClientBrowseScreen
      gate={GATE}
      token="T1"
      hasHome
      initialPage={initialPage}
      browseAction={action}
      targets={{ groups: [EDIT_GROUP], picks: [] }}
      pickActions={{
        setPick: vi.fn(),
        setNote: vi.fn(),
        reload: vi.fn(() => Promise.resolve({ groups: [EDIT_GROUP], picks: [] })),
      }}
      photosActions={all}
    />,
  );
  return all;
}

describe("ClientBrowseScreen (D-15, A-26)", () => {
  it("AC-ACC-011 shows the root folder and photos with a way back to Beranda", () => {
    renderScreen(vi.fn());
    expect(screen.getByText("24 foto · 1 folder")).toBeVisible();
    expect(screen.getByText("Semua folder · 1 folder, 2 foto")).toBeVisible();
    expect(screen.getByRole("button", { name: /Akad/ })).toBeVisible();
    expect(screen.getAllByRole("link", { name: "Beranda" })[0]).toHaveAttribute("href", "/g/T1");
  });

  it("opens a folder through the action and shows its trail", async () => {
    const action = vi.fn<ClientBrowseAction>().mockResolvedValue({
      ...ROOT,
      folders: [],
      summary: { folderCount: 0, photoCount: 12 },
      photos: [photo(3)],
    });
    renderScreen(action);
    await userEvent.setup().click(screen.getByRole("button", { name: /Akad/ }));
    expect(action).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "PROOF", sourceId: "s-1", path: "Akad" }),
    );
    expect((await screen.findAllByText("Akad · 12 foto")).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Semua folder" })).toBeVisible();
  });

  it("shows the failed state with a retry when the first page couldn't load", async () => {
    const action = vi.fn<ClientBrowseAction>().mockResolvedValue(ROOT);
    renderScreen(action, null);
    expect(screen.getByText("Foto gagal dimuat")).toBeVisible();
    await userEvent.setup().click(screen.getByRole("button", { name: "Coba lagi" }));
    await waitFor(() => {
      expect(screen.queryByText("Foto gagal dimuat")).toBeNull();
    });
  });

  it("opens the read-only viewer on a photo", async () => {
    renderScreen(vi.fn());
    await userEvent.setup().click(screen.getByRole("button", { name: /IMG_002\.jpg/ }));
    expect(await screen.findByRole("dialog")).toBeVisible();
  });

  it("F-19 each tile downloads its original", () => {
    renderScreen(vi.fn());
    expect(screen.getByRole("link", { name: "Unduh IMG_001.jpg" })).toHaveAttribute(
      "href",
      "/g/T1/download/p-1",
    );
  });

  it("F-19 Unduh semua lists every proof and asks first", async () => {
    const all = renderScreen(vi.fn());
    await userEvent.click(screen.getByRole("button", { name: "Unduh" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Unduh semua" }));
    expect(await screen.findByRole("dialog", { name: "Unduh semua 2 foto?" })).toBeVisible();
    expect(all.listDownloads).toHaveBeenCalledTimes(1);
  });

  it("F-19 Pilih foto then Masukkan ke… picks the selection for a group", async () => {
    const all = renderScreen(vi.fn());
    await userEvent.click(screen.getByRole("button", { name: "Pilih foto" }));
    await userEvent.click(screen.getByRole("button", { name: "IMG_001.jpg", pressed: false }));
    await userEvent.click(screen.getByRole("button", { name: "IMG_002.jpg", pressed: false }));
    expect(screen.getAllByText("2 foto dipilih").length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole("button", { name: "Masukkan ke…" }));
    await userEvent.click(screen.getByRole("menuitem", { name: /Foto edit/ }));
    await waitFor(() => {
      expect(all.setPicks).toHaveBeenCalledWith({ groupId: "g-edit", photoIds: ["p-1", "p-2"] });
    });
  });
});
