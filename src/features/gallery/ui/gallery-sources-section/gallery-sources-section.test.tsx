import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fakePageActions } from "@tests/support/gallery/fake-page-actions";
import { stubViewport } from "@tests/support/gallery/viewport";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { showToast } from "@/ui/patterns/toast/toast";

import { GallerySourcesSection } from "./gallery-sources-section";

vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/w/ws-1/projects/p-1/gallery",
}));

const SOURCE = {
  id: "s-1",
  name: "Rina-Wisuda",
  label: null,
  workspaceSourceName: "Google Drive",
  removed: false,
  removedAt: null,
  syncStatus: "SUCCEEDED" as const,
  syncErrorCode: null,
  lastSyncedAt: "2026-10-04T04:02:00Z",
  proofCount: 4,
  editedCount: 3,
  printCount: 1,
  ignoredCount: 2,
  missingCount: 0,
  tooDeepCount: 0,
};

const PAGE = {
  project: { id: "p-1", title: "Wisuda Rina", status: "BOOKED" as const },
  gallery: {
    id: "g-1",
    status: "DRAFT" as const,
    password: "mawar-4821",
    expiresAt: null,
    expiryDays: null,
    activeSourceCount: 2,
    failedSourceCount: 1,
    failedSourceNames: [],
    counts: { proof: 5, edited: 3, print: 1, missing: 0 },
  },
  sources: [
    SOURCE,
    {
      ...SOURCE,
      id: "s-2",
      name: "Rina-Keluarga",
      syncStatus: "FAILED" as const,
      syncErrorCode: "NOT_PUBLIC" as const,
    },
  ],
  linkableSources: [],
  directImages: false,
  previewPhotos: [],
};

describe("GallerySourcesSection", () => {
  beforeEach(() => {
    stubViewport(false);
  });

  it("AC-GAL-005 AC-GAL-008 shows each source's status", () => {
    const actions = fakePageActions();
    render(<GallerySourcesSection workspaceId="ws-1" page={PAGE} actions={actions} />);
    expect(screen.getByText("Berhasil")).toBeInTheDocument();
    expect(screen.getByText("Gagal")).toBeInTheDocument();
    expect(screen.getByText(/Bagikan folder sebagai/)).toBeInTheDocument();
  });

  it("AC-GAL-012 Sinkronkan semua syncs each source in order", async () => {
    const syncSourceAction = vi.fn(() =>
      Promise.resolve({ ok: true as const, status: "SUCCEEDED" as const }),
    );
    const actions = fakePageActions({ syncSourceAction });
    render(<GallerySourcesSection workspaceId="ws-1" page={PAGE} actions={actions} />);
    await userEvent.click(screen.getByRole("button", { name: "Sinkronkan semua" }));
    await waitFor(() => {
      expect(syncSourceAction).toHaveBeenCalledTimes(2);
    });
    expect(syncSourceAction.mock.calls.map((call) => (call as unknown as string[])[1])).toEqual([
      "s-1",
      "s-2",
    ]);
  });

  it("AC-GAL-032 keeps asking for steps until the run ends and shows the progress", async () => {
    const answers = [
      { ok: true as const, status: "CONTINUE" as const, foldersDone: 40, foldersTotal: 95 },
      { ok: true as const, status: "CONTINUE" as const, foldersDone: 80, foldersTotal: 95 },
      { ok: true as const, status: "SUCCEEDED" as const },
    ];
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const syncSourceAction = vi.fn(async () => {
      const next = answers.shift();
      if (answers.length === 1) await gate;
      return next ?? { ok: true as const, status: "SUCCEEDED" as const };
    });
    const actions = fakePageActions({ syncSourceAction });
    render(<GallerySourcesSection workspaceId="ws-1" page={PAGE} actions={actions} />);
    await userEvent.click(
      screen.getAllByRole("button", { name: /Sinkronkan semua|Menyinkronkan/ })[0],
    );
    expect(await screen.findByText(/Menyinkronkan… 40 dari 95 folder/)).toBeInTheDocument();
    release();
    await waitFor(() => {
      expect(
        syncSourceAction.mock.calls.filter((call) => (call as unknown as string[])[1] === "s-1"),
      ).toHaveLength(3);
    });
  });

  it("D-9 stops a run whose steps never end after 500 calls", async () => {
    const syncSourceAction = vi.fn(() =>
      Promise.resolve({
        ok: true as const,
        status: "CONTINUE" as const,
        foldersDone: 1,
        foldersTotal: 2,
      }),
    );
    const actions = fakePageActions({ syncSourceAction });
    render(<GallerySourcesSection workspaceId="ws-1" page={PAGE} actions={actions} />);
    await userEvent.click(screen.getByRole("button", { name: "Sinkronkan semua" }));
    await waitFor(
      () => {
        expect(syncSourceAction).toHaveBeenCalledTimes(1000);
      },
      { timeout: 10_000 },
    );
  });

  it("AC-GAL-022 offers no source changes on an archived gallery", () => {
    const actions = fakePageActions();
    const archived = { ...PAGE, gallery: { ...PAGE.gallery, status: "ARCHIVED" as const } };
    render(<GallerySourcesSection workspaceId="ws-1" page={archived} actions={actions} />);
    expect(screen.queryByRole("button", { name: "Sinkronkan semua" })).not.toBeInTheDocument();
    expect(screen.getAllByText("Arsip")).toHaveLength(2);
  });

  it("Revision OT #4 F-20 the folder menu offers Sinkronkan, Edit folder and Hapus", async () => {
    const user = userEvent.setup();
    render(<GallerySourcesSection workspaceId="ws-1" page={PAGE} actions={fakePageActions()} />);
    await user.click(screen.getByRole("button", { name: "Menu Rina-Wisuda" }));
    const items = screen.getAllByRole("menuitem").map((item) => item.textContent);
    expect(items).toEqual([
      expect.stringContaining("Sinkronkan"),
      expect.stringContaining("Edit folder"),
      expect.stringContaining("Hapus"),
    ]);
    expect(screen.queryByText("Lepas folder")).not.toBeInTheDocument();
  });

  it("AC-GAL-013 Hapus asks first, deletes the folder and toasts", async () => {
    const user = userEvent.setup();
    const deleteSourceAction = vi.fn(() => Promise.resolve({ ok: true as const }));
    const actions = fakePageActions({ deleteSourceAction });
    render(<GallerySourcesSection workspaceId="ws-1" page={PAGE} actions={actions} />);
    await user.click(screen.getByRole("button", { name: "Menu Rina-Wisuda" }));
    await user.click(screen.getByRole("menuitem", { name: /Hapus/ }));
    const dialog = screen.getByRole("alertdialog", { name: "Hapus Rina-Wisuda?" });
    expect(dialog).toHaveTextContent("8 fotonya dihapus dari galeri");
    await user.click(screen.getByRole("button", { name: "Hapus" }));
    await waitFor(() => {
      expect(deleteSourceAction).toHaveBeenCalledWith("ws-1", "s-1");
    });
    expect(showToast).toHaveBeenCalledWith({ tone: "success", title: "Folder dihapus" });
  });

  it("AC-GAL-013 BR-GAL-009 a refused Hapus explains the client picks", async () => {
    const user = userEvent.setup();
    const deleteSourceAction = vi.fn(() =>
      Promise.resolve({ ok: false as const, code: "HAS_PICKS" as const }),
    );
    const actions = fakePageActions({ deleteSourceAction });
    render(<GallerySourcesSection workspaceId="ws-1" page={PAGE} actions={actions} />);
    await user.click(screen.getByRole("button", { name: "Menu Rina-Wisuda" }));
    await user.click(screen.getByRole("menuitem", { name: /Hapus/ }));
    await user.click(screen.getByRole("button", { name: "Hapus" }));
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith({
        tone: "danger",
        title: "Ada foto dari folder ini yang sudah dipilih klien.",
      });
    });
  });

  it("AC-GAL-037 Ganti nama saves the new label", async () => {
    const user = userEvent.setup();
    const renameSourceAction = vi.fn(() => Promise.resolve({ ok: true as const }));
    const actions = fakePageActions({ renameSourceAction });
    render(<GallerySourcesSection workspaceId="ws-1" page={PAGE} actions={actions} />);
    await user.click(screen.getByRole("button", { name: "Menu Rina-Wisuda" }));
    await user.click(screen.getByRole("menuitem", { name: /Edit folder/ }));
    const dialog = screen.getByRole("dialog", { name: "Edit folder" });
    await user.type(within(dialog).getByRole("textbox", { name: /Label/ }), "Softball");
    await user.click(within(dialog).getByRole("button", { name: "Simpan" }));
    await waitFor(() => {
      expect(renameSourceAction).toHaveBeenCalledWith("ws-1", "s-1", { label: "Softball" });
    });
  });

  it("Revision OT #3 syncs the folder linked in Buat galeri once when the page opens", async () => {
    const syncSourceAction = vi.fn(() =>
      Promise.resolve({ ok: true as const, status: "SUCCEEDED" as const }),
    );
    const actions = fakePageActions({ syncSourceAction });
    render(
      <GallerySourcesSection
        workspaceId="ws-1"
        page={PAGE}
        actions={actions}
        initialSyncSourceId="s-1"
      />,
    );
    await waitFor(() => {
      expect(syncSourceAction).toHaveBeenCalledWith("ws-1", "s-1");
    });
    expect(syncSourceAction).toHaveBeenCalledTimes(1);
  });

  it("F-20 Edit folder picks a subfolder for each package item and saves it with the name", async () => {
    const user = userEvent.setup();
    const renameSourceAction = vi.fn(() => Promise.resolve({ ok: true as const }));
    const setFolderMappingAction = vi.fn(() => Promise.resolve({ ok: true as const }));
    const folderMappingAction = vi.fn(() =>
      Promise.resolve({
        folders: ["Akad", "Hasil Edit"],
        items: [
          { id: "item-edit", name: "Foto edit", pickMode: "COUNT" as const },
          { id: "item-print", name: "Foto cetak", pickMode: "QUANTITY" as const },
        ],
        mappings: [],
      }),
    );
    const actions = fakePageActions({
      renameSourceAction,
      setFolderMappingAction,
      folderMappingAction,
    });
    render(<GallerySourcesSection workspaceId="ws-1" page={PAGE} actions={actions} />);
    await user.click(screen.getByRole("button", { name: "Menu Rina-Wisuda" }));
    await user.click(screen.getByRole("menuitem", { name: /Edit folder/ }));
    await user.click(await screen.findByRole("button", { name: /Foto edit/ }));
    await user.click(screen.getByRole("option", { name: "Hasil Edit" }));
    await user.click(screen.getByRole("button", { name: /Foto cetak/ }));
    expect(screen.queryByRole("option", { name: "Hasil Edit" })).toBeNull();
    await user.click(screen.getByRole("option", { name: "Akad" }));
    await user.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => {
      expect(setFolderMappingAction).toHaveBeenCalledWith("ws-1", "s-1", {
        mappings: [
          { path: "Hasil Edit", projectItemId: "item-edit" },
          { path: "Akad", projectItemId: "item-print" },
        ],
      });
    });
    expect(renameSourceAction).toHaveBeenCalledWith("ws-1", "s-1", { label: "" });
  });

  it("F-20 Edit folder shows a skeleton while the subfolders load", async () => {
    const user = userEvent.setup();
    const folderMappingAction = vi.fn(() => new Promise<never>(() => undefined));
    const actions = fakePageActions({ folderMappingAction });
    render(<GallerySourcesSection workspaceId="ws-1" page={PAGE} actions={actions} />);
    await user.click(screen.getByRole("button", { name: "Menu Rina-Wisuda" }));
    await user.click(screen.getByRole("menuitem", { name: /Edit folder/ }));
    expect(await screen.findByTestId("folder-mapping-skeleton")).toBeInTheDocument();
  });

  it("F-20 Edit folder points to Isi paket when the package has no selection item", async () => {
    const user = userEvent.setup();
    render(<GallerySourcesSection workspaceId="ws-1" page={PAGE} actions={fakePageActions()} />);
    await user.click(screen.getByRole("button", { name: "Menu Rina-Wisuda" }));
    await user.click(screen.getByRole("menuitem", { name: /Edit folder/ }));
    expect(
      await screen.findByText("Paket proyek ini belum punya item untuk pilihan foto"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buka Isi paket" })).toBeInTheDocument();
  });

  it("F-20 a sync that finds new subfolders says so with Petakan", async () => {
    const user = userEvent.setup();
    const syncSourceAction = vi.fn(() =>
      Promise.resolve({
        ok: true as const,
        status: "SUCCEEDED" as const,
        newFolders: ["Hasil Edit"],
      }),
    );
    render(
      <GallerySourcesSection
        workspaceId="ws-1"
        page={PAGE}
        actions={fakePageActions({ syncSourceAction })}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Menu Rina-Wisuda" }));
    await user.click(screen.getByRole("menuitem", { name: /Sinkronkan/ }));
    await waitFor(() => {
      const info = vi
        .mocked(showToast)
        .mock.calls.map(([content]) => content)
        .find((content) => content.tone === "info");
      expect(info?.title).toBe("1 subfolder baru di Rina-Wisuda");
      expect(info?.action?.label).toBe("Petakan");
    });
  });
});
