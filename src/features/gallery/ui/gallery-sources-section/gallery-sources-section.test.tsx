import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fakePageActions } from "@tests/support/gallery/fake-page-actions";
import { stubViewport } from "@tests/support/gallery/viewport";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GallerySourcesSection } from "./gallery-sources-section";

vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const SOURCE = {
  id: "s-1",
  name: "Rina-Wisuda",
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
});
