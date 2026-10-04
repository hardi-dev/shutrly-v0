import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { stubViewport } from "@tests/support/gallery/viewport";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BrowsePageView } from "@/features/gallery/application/use-cases/browse-gallery-photos/browse-gallery-photos.types";

import { GalleryPhotosSection } from "../gallery-photos-section/gallery-photos-section";

vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const SOURCE_ID = "77777777-7777-4777-8777-777777777777";
const PHOTO = {
  id: "p-1",
  fileName: "IMG_001.jpg",
  kind: "PROOF" as const,
  folderPath: "",
  browsePath: "",
  sourceId: SOURCE_ID,
  sourceName: "Rina-Wisuda",
  missing: false,
  driveUrl: null,
};
const PAGE = {
  project: { id: "p-1", title: "Wisuda Basic — Rina", status: "BOOKED" as const },
  gallery: {
    id: "g-1",
    status: "DRAFT" as const,
    password: "mawar-4821",
    expiresAt: null,
    expiryDays: null,
    activeSourceCount: 2,
    failedSourceCount: 0,
    counts: { proof: 312, edited: 40, print: 0, missing: 0 },
  },
  sources: [
    {
      id: SOURCE_ID,
      name: "Rina-Wisuda",
      workspaceSourceName: "Google Drive",
      removed: false,
      syncStatus: "SUCCEEDED" as const,
      syncErrorCode: null,
      lastSyncedAt: null,
      proofCount: 212,
      editedCount: 40,
      printCount: 0,
      ignoredCount: 0,
      missingCount: 0,
      tooDeepCount: 0,
    },
  ],
  linkableSources: [],
  previewPhotos: [PHOTO],
};
const TOTALS = { proof: 312, edited: 40, print: 0 };
const SOURCES: BrowsePageView = {
  mode: "SOURCES",
  totals: TOTALS,
  sourceId: null,
  isSingleSource: false,
  folders: [
    { name: "Rina-Wisuda", count: 212, sourceId: SOURCE_ID, path: "" },
    { name: "Rina-Keluarga", count: 100, sourceId: "s-2", path: "" },
  ],
  summary: null,
  photos: [],
  nextCursor: null,
};
const INSIDE: BrowsePageView = {
  ...SOURCES,
  mode: "FOLDER",
  sourceId: SOURCE_ID,
  folders: [],
  summary: { folderCount: 0, photoCount: 212 },
  photos: [PHOTO],
};

describe("AllPhotosModal", () => {
  beforeEach(() => {
    stubViewport(false);
  });

  it("AC-GAL-028 opens with tabs and source folders, then a folder with its breadcrumb", async () => {
    const browseAction = vi.fn((_ws: string, _g: string, query: { sourceId: string | null }) =>
      Promise.resolve(query.sourceId === null ? SOURCES : INSIDE),
    );
    render(<GalleryPhotosSection workspaceId="ws-1" page={PAGE} browseAction={browseAction} />);
    await userEvent.click(screen.getByRole("button", { name: "Lihat semua foto" }));
    const dialog = await screen.findByRole("dialog", { name: "Semua foto" });
    expect(within(dialog).getByRole("button", { name: "Proof (312)" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await userEvent.click(
      await within(dialog).findByRole("button", { name: "Rina-Wisuda, 212 foto" }),
    );
    expect(browseAction).toHaveBeenLastCalledWith(
      "ws-1",
      "g-1",
      expect.objectContaining({ sourceId: SOURCE_ID, path: "" }),
    );
    expect(await within(dialog).findByText("· 212 foto")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Semua folder" }));
    expect(browseAction).toHaveBeenLastCalledWith(
      "ws-1",
      "g-1",
      expect.objectContaining({ sourceId: null }),
    );
  });

  it("AC-GAL-029 searches by file name after typing", async () => {
    const browseAction = vi.fn(() => Promise.resolve(SOURCES));
    render(<GalleryPhotosSection workspaceId="ws-1" page={PAGE} browseAction={browseAction} />);
    await userEvent.click(screen.getByRole("button", { name: "Lihat semua foto" }));
    const dialog = await screen.findByRole("dialog", { name: "Semua foto" });
    await userEvent.type(
      within(dialog).getByRole("searchbox", { name: "Cari nama file" }),
      "IMG_02",
    );
    await waitFor(() => {
      expect(browseAction).toHaveBeenLastCalledWith(
        "ws-1",
        "g-1",
        expect.objectContaining({ search: "IMG_02" }),
      );
    });
  });

  it("AC-GAL-031 counts the preview position over the photos it can move through", async () => {
    const browseAction = vi.fn(() =>
      Promise.resolve({
        ...INSIDE,
        mode: "FOLDER" as const,
        summary: { folderCount: 1, photoCount: 212 },
      }),
    );
    render(<GalleryPhotosSection workspaceId="ws-1" page={PAGE} browseAction={browseAction} />);
    await userEvent.click(screen.getByRole("button", { name: "Lihat semua foto" }));
    const dialog = await screen.findByRole("dialog", { name: "Semua foto" });
    await userEvent.click(await within(dialog).findByRole("button", { name: "IMG_001.jpg" }));
    expect(await screen.findByText("Rina-Wisuda · Proof · 1 dari 1")).toBeInTheDocument();
  });
});
