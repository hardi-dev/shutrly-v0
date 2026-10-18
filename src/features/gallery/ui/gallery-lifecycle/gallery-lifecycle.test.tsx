import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fakePageActions } from "@tests/support/gallery/fake-page-actions";
import { stubViewport } from "@tests/support/gallery/viewport";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GalleryPageScreen } from "../gallery-page-screen/gallery-page-screen";

vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/w/ws-1/projects/p-1/gallery",
}));
// The header actions portal into the shell's slot, which these tests don't render.
vi.mock("@/ui/patterns/page-actions/page-actions", () => ({
  PageActions: ({ children }: Readonly<{ children: React.ReactNode }>) => <div>{children}</div>,
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

function pageWith(state: "OPEN" | "EXPIRED" | "CLOSED", extra: { expiresAt?: string } = {}) {
  return {
    project: { id: "p-1", title: "Wisuda Rina", status: "BOOKED" as const },
    gallery: {
      id: "g-1",
      state,
      password: "mawar-4821",
      expiresAt: extra.expiresAt ?? null,
      expiryDays: null,
      activeSourceCount: 1,
      failedSourceCount: 0,
      failedSourceNames: [],
      counts: { proof: 4, edited: 3, print: 1, missing: 0 },
    },
    sources: [SOURCE],
    linkableSources: [],
    directImages: false,
    previewPhotos: [],
  };
}

describe("GalleryLifecycle", () => {
  beforeEach(() => {
    stubViewport(false);
  });

  it("AC-GAL-020 an expired gallery shows the Alert and Ubah kedaluwarsa", () => {
    render(
      <GalleryPageScreen
        workspaceId="ws-1"
        page={pageWith("EXPIRED", { expiresAt: "2026-11-03T03:00:00Z" })}
        actions={fakePageActions()}
      />,
    );
    expect(screen.getByText("Galeri kedaluwarsa sejak Sel, 3 Nov 2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ubah kedaluwarsa" })).toBeInTheDocument();
  });

  it("AC-GAL-022 a closed gallery is read-only: no actions, no source menu", () => {
    render(
      <GalleryPageScreen
        workspaceId="ws-1"
        page={pageWith("CLOSED")}
        actions={fakePageActions()}
      />,
    );
    expect(screen.getByText("Proyek dibatalkan, galeri ditutup")).toBeInTheDocument();
    for (const name of ["Ubah kedaluwarsa", "Menu galeri", "Sinkronkan semua", "Tambah folder"]) {
      expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
    }
  });

  it("AC-GAL-021 Ganti password opens with a proposal and rotates it", async () => {
    const rotatePasswordAction = vi.fn(() => Promise.resolve({ ok: true as const }));
    const proposeAction = vi.fn(() => Promise.resolve("melati-2759"));
    render(
      <GalleryPageScreen
        workspaceId="ws-1"
        page={pageWith("OPEN")}
        actions={fakePageActions({ rotatePasswordAction, proposeAction })}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Menu galeri" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Ganti kata sandi" }));
    const dialog = await screen.findByRole("dialog", { name: "Ganti kata sandi galeri" });
    expect(within(dialog).getByLabelText("Kata sandi baru")).toHaveValue("melati-2759");
    await userEvent.click(within(dialog).getByRole("button", { name: "Ganti kata sandi" }));
    await waitFor(() => {
      expect(rotatePasswordAction).toHaveBeenCalledWith("ws-1", "g-1", { password: "melati-2759" });
    });
  });

  it("AC-GFL-015 the last folder of an open gallery can be removed", async () => {
    render(
      <GalleryPageScreen workspaceId="ws-1" page={pageWith("OPEN")} actions={fakePageActions()} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Tindakan untuk Rina-Wisuda" }));
    expect(await screen.findByRole("menuitem", { name: /Lepas folder/ })).not.toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
