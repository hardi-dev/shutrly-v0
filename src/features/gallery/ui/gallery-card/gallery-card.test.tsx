import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { stubViewport } from "@tests/support/gallery/viewport";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GalleryCardView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import { GalleryCard } from "./gallery-card";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const PROJECT = { id: "p-1", title: "Wisuda Rina", status: "BOOKED" as const };
const GALLERY = {
  id: "g-1",
  status: "DRAFT" as const,
  password: "mawar-4821",
  expiresAt: null,
  expiryDays: null,
  activeSourceCount: 2,
  failedSourceCount: 0,
  failedSourceNames: [],
  counts: { proof: 8, edited: 2, print: 1, missing: 0 },
};

const SELECTION = {
  projectTitle: "Wisuda Rina",
  state: "FINAL" as const,
  galleryExists: true,
  groups: [
    {
      id: "g-edit",
      name: "Foto edit",
      unit: null,
      mode: "COUNT" as const,
      status: "LOCKED" as const,
      usage: 10,
      limit: 10,
      pickCount: 10,
      noteCount: 0,
      submittedAt: null,
      lockedAt: null,
    },
  ],
};
const DELIVERY = {
  state: "PUBLISHED" as const,
  projectTitle: "Wisuda Rina",
  editedCount: 2,
  printCount: 1,
  items: [
    { id: "i-edit", name: "Foto edit", count: 2 },
    { id: "i-print", name: "Foto cetak", count: 1 },
  ],
  publishedAt: "2026-10-05T03:00:00Z",
  completedAt: null,
  canComplete: true,
  isShown: true,
};

function renderCard(
  card: GalleryCardView,
  overrides: Partial<Parameters<typeof GalleryCard>[0]> = {},
) {
  const props = {
    workspaceId: "ws-1",
    card,
    createAction: vi.fn(() =>
      Promise.resolve({ ok: true as const, galleryId: "g-1", sourceId: null }),
    ),
    proposeAction: vi.fn(() => Promise.resolve("mawar-4821")),
    checkFolderAction: vi.fn(),
    ...overrides,
  };
  render(<GalleryCard {...props} />);
  return props;
}

describe("GalleryCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubViewport(false);
  });

  it("AC-GAL-001 offers Buat galeri and opens the dialog with a proposal", async () => {
    const props = renderCard({ project: PROJECT, canCreate: true, gallery: null });
    expect(screen.getByText("Belum ada galeri")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Buat galeri" }));
    expect(props.proposeAction).toHaveBeenCalledWith("ws-1", "p-1");
    expect(await screen.findByRole("dialog", { name: "Buat galeri" })).toBeInTheDocument();
    expect(screen.getByLabelText("Password galeri")).toHaveValue("mawar-4821");
  });

  it("AC-GAL-003 shows the booking hint and no Buat galeri on a draft project", () => {
    renderCard({ project: { ...PROJECT, status: "DRAFT" }, canCreate: false, gallery: null });
    expect(screen.getByText("Galeri tersedia setelah booking")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Buat galeri" })).not.toBeInTheDocument();
  });

  it("AC-GAL-001 shows the draft gallery facts without the password (Owner 7: it is on the gallery page)", async () => {
    renderCard({ project: PROJECT, canCreate: false, gallery: GALLERY });
    expect(screen.getByText("Draf")).toBeInTheDocument();
    expect(screen.getByText("2 folder")).toBeInTheDocument();
    expect(screen.getByText("8 proof · 3 hasil akhir")).toBeInTheDocument();
    expect(screen.getByText("Tidak ada")).toBeInTheDocument();
    expect(screen.queryByText("mawar-4821")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Kelola galeri" }));
    expect(push).toHaveBeenCalledWith("/w/ws-1/projects/p-1/gallery");
  });

  it("A-34 summarises Pilihan klien and Hasil akhir with chips (r71J5)", () => {
    renderCard(
      { project: PROJECT, canCreate: false, gallery: { ...GALLERY, status: "PUBLISHED" } },
      { selection: SELECTION, delivery: DELIVERY },
    );
    expect(screen.getByText("Foto edit 10/10 · semua dikunci")).toBeInTheDocument();
    expect(screen.getByText("Dikunci")).toBeInTheDocument();
    expect(
      screen.getByText("Dipublikasikan Sen, 5 Okt 2026 · 2 Foto edit · 1 Foto cetak"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Dipublikasikan")).toHaveLength(2);
  });

  it("A-34 shows only Status and Foto, then the short summaries, on phones (QUSVb)", () => {
    stubViewport(true);
    renderCard(
      { project: PROJECT, canCreate: false, gallery: { ...GALLERY, status: "PUBLISHED" } },
      { selection: SELECTION, delivery: DELIVERY },
    );
    expect(screen.getByText("8 proof · 3 hasil akhir")).toBeInTheDocument();
    expect(screen.queryByText("Kedaluwarsa")).not.toBeInTheDocument();
    expect(screen.queryByText(/2 folder/)).not.toBeInTheDocument();
    expect(screen.getByText("Semua grup dikunci")).toBeInTheDocument();
    expect(screen.getByText("Dipublikasikan Sen, 5 Okt 2026")).toBeInTheDocument();
  });

  it("AC-GAL-001 creates the gallery and opens its page", async () => {
    const props = renderCard({ project: PROJECT, canCreate: true, gallery: null });
    await userEvent.click(screen.getByRole("button", { name: "Buat galeri" }));
    const dialog = await screen.findByRole("dialog", { name: "Buat galeri" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Buat galeri" }));
    await waitFor(() => {
      expect(props.createAction).toHaveBeenCalledWith("ws-1", "p-1", {
        password: "mawar-4821",
        expiry: { type: "NONE" },
      });
    });
    expect(push).toHaveBeenCalledWith("/w/ws-1/projects/p-1/gallery");
  });

  it("AC-GAL-008 the card names the folder that failed to sync", () => {
    const failed = { ...GALLERY, failedSourceCount: 1, failedSourceNames: ["Rina-Keluarga"] };
    renderCard({ project: PROJECT, canCreate: false, gallery: failed });
    expect(screen.getByText("1 folder gagal disinkronkan")).toBeInTheDocument();
    expect(
      screen.getByText("Rina-Keluarga tidak bisa dibaca. Buka galeri untuk melihat penyebabnya."),
    ).toBeInTheDocument();
  });
});
