import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fakePageActions } from "@tests/support/gallery/fake-page-actions";
import { stubViewport } from "@tests/support/gallery/viewport";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GalleryPageScreen } from "../gallery-page-screen/gallery-page-screen";

vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
// The header actions portal into the shell's slot, which these tests don't render.
vi.mock("@/ui/patterns/page-actions/page-actions", () => ({
  PageActions: ({ children }: Readonly<{ children: React.ReactNode }>) => <div>{children}</div>,
}));

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

function pageWith(
  status: "DRAFT" | "PUBLISHED" | "EXPIRED" | "ARCHIVED",
  extra: { expiresAt?: string } = {},
) {
  return {
    project: { id: "p-1", title: "Wisuda Rina", status: "BOOKED" as const },
    gallery: {
      id: "g-1",
      status,
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
    previewPhotos: [],
  };
}

describe("GalleryLifecycle", () => {
  beforeEach(() => {
    stubViewport(false);
  });

  it("AC-GAL-016 a draft shows Publikasikan, which confirms and publishes", async () => {
    const publishAction = vi.fn(() => Promise.resolve({ ok: true as const }));
    render(
      <GalleryPageScreen
        workspaceId="ws-1"
        page={pageWith("DRAFT")}
        actions={fakePageActions({ publishAction })}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Publikasikan" }));
    const dialog = await screen.findByRole("dialog", { name: "Publikasikan galeri?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Publikasikan" }));
    await waitFor(() => {
      expect(publishAction).toHaveBeenCalledWith("ws-1", "g-1");
    });
  });

  it("AC-GAL-017 a refused publish names the failing folder", async () => {
    const publishAction = vi.fn(() =>
      Promise.resolve({
        ok: false as const,
        code: "PUBLISH_REFUSED" as const,
        failures: [{ name: "Rina-Keluarga", code: "NOT_PUBLIC" as const }],
      }),
    );
    render(
      <GalleryPageScreen
        workspaceId="ws-1"
        page={pageWith("DRAFT")}
        actions={fakePageActions({ publishAction })}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Publikasikan" }));
    const dialog = await screen.findByRole("dialog", { name: "Publikasikan galeri?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Publikasikan" }));
    const refused = await screen.findByRole("dialog", { name: "Galeri belum bisa dipublikasikan" });
    expect(within(refused).getByText("Rina-Keluarga")).toBeInTheDocument();
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

  it("AC-GAL-022 an archived gallery is read-only: no actions, no source menu", () => {
    render(
      <GalleryPageScreen
        workspaceId="ws-1"
        page={pageWith("ARCHIVED")}
        actions={fakePageActions()}
      />,
    );
    expect(screen.getByText("Galeri diarsipkan")).toBeInTheDocument();
    for (const name of [
      "Publikasikan",
      "Ubah kedaluwarsa",
      "Menu galeri",
      "Sinkronkan semua",
      "Tambah folder",
    ]) {
      expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
    }
  });

  it("AC-GAL-022 the menu of a published gallery archives it after confirming", async () => {
    const archiveAction = vi.fn(() => Promise.resolve({ ok: true as const }));
    render(
      <GalleryPageScreen
        workspaceId="ws-1"
        page={pageWith("PUBLISHED")}
        actions={fakePageActions({ archiveAction })}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Menu galeri" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Arsipkan galeri" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Arsipkan galeri?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Arsipkan galeri" }));
    await waitFor(() => {
      expect(archiveAction).toHaveBeenCalledWith("ws-1", "g-1");
    });
  });

  it("AC-GAL-021 Ganti password opens with a proposal and rotates it", async () => {
    const rotatePasswordAction = vi.fn(() => Promise.resolve({ ok: true as const }));
    const proposeAction = vi.fn(() => Promise.resolve("melati-2759"));
    render(
      <GalleryPageScreen
        workspaceId="ws-1"
        page={pageWith("PUBLISHED")}
        actions={fakePageActions({ rotatePasswordAction, proposeAction })}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Menu galeri" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Ganti password" }));
    const dialog = await screen.findByRole("dialog", { name: "Ganti password galeri" });
    expect(within(dialog).getByLabelText("Password baru")).toHaveValue("melati-2759");
    await userEvent.click(within(dialog).getByRole("button", { name: "Ganti password" }));
    await waitFor(() => {
      expect(rotatePasswordAction).toHaveBeenCalledWith("ws-1", "g-1", { password: "melati-2759" });
    });
  });

  it("AC-GAL-013 the last folder of a published gallery can't be removed", async () => {
    render(
      <GalleryPageScreen
        workspaceId="ws-1"
        page={pageWith("PUBLISHED")}
        actions={fakePageActions()}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Menu Rina-Wisuda" }));
    expect(await screen.findByRole("menuitem", { name: /Lepas folder/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
