import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { stubViewport } from "@tests/support/gallery/viewport";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GalleryCardView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import { ProjectGalleryActionsProvider } from "@/ui/hooks/use-project-gallery-actions/use-project-gallery-actions";

import { GalleryCard } from "./gallery-card";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const PROJECT = { id: "p-1", title: "Wisuda Rina", status: "BOOKED" as const };
const GALLERY = {
  id: "g-1",
  state: "OPEN" as const,
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
  state: "DELIVERED" as const,
  projectTitle: "Wisuda Rina",
  editedCount: 2,
  printCount: 1,
  items: [
    { id: "i-edit", name: "Foto edit", count: 2 },
    { id: "i-print", name: "Foto cetak", count: 1 },
  ],
  publishedAt: "2026-10-05T03:00:00Z",
  completedAt: null,
  canComplete: false,
  isShown: true,
};

function renderCard(
  card: GalleryCardView,
  overrides: Partial<Parameters<typeof GalleryCard>[0]> = {},
) {
  const props = {
    workspaceId: "ws-1",
    card,
    ...overrides,
  };
  render(<GalleryCard {...props} />);
  return props;
}

describe("GalleryCard (F-27 P1–P6)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubViewport(false);
  });

  it("AC-GFL-004 a draft project says the gallery is created at booking", () => {
    renderCard({ project: { ...PROJECT, status: "DRAFT" }, canCreate: false, gallery: null });
    expect(screen.getByText("Galeri dibuat saat proyek dibooking")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("AC-GFL-007 an open gallery without a folder asks for one", async () => {
    renderCard({
      project: PROJECT,
      canCreate: false,
      gallery: { ...GALLERY, activeSourceCount: 0 },
    });
    expect(screen.getByText("Belum ada folder")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tambah folder Drive" }));
    expect(push).toHaveBeenCalledWith("/w/ws-1/projects/p-1/gallery");
  });

  it("AC-GFL-001 an open gallery shows its password and no status chip", async () => {
    renderCard({ project: PROJECT, canCreate: false, gallery: GALLERY });
    expect(screen.getByText("mawar-4821")).toBeInTheDocument();
    expect(screen.getByText("2 folder")).toBeInTheDocument();
    expect(screen.getByText("8 foto pilihan · 3 hasil akhir")).toBeInTheDocument();
    expect(screen.getByText("Tanpa kedaluwarsa")).toBeInTheDocument();
    expect(screen.queryByText("Dipublikasikan")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Kelola galeri" }));
    expect(push).toHaveBeenCalledWith("/w/ws-1/projects/p-1/gallery");
  });

  it("AC-GFL-012 an expired gallery shows its status", () => {
    renderCard({
      project: PROJECT,
      canCreate: false,
      gallery: { ...GALLERY, state: "EXPIRED", expiresAt: "2026-11-03T16:59:59.999Z" },
    });
    expect(screen.getAllByText("Kedaluwarsa").length).toBeGreaterThan(0);
  });

  it("AC-GFL-016 a closed gallery says it is closed, offers View and hides the expiry", async () => {
    renderCard({ project: PROJECT, canCreate: false, gallery: { ...GALLERY, state: "CLOSED" } });
    expect(screen.getByText("Ditutup")).toBeInTheDocument();
    expect(screen.queryByText("Tanpa kedaluwarsa")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Lihat galeri" }));
    expect(push).toHaveBeenCalledWith("/w/ws-1/projects/p-1/gallery");
  });

  it("A-34 summarises Pilihan klien and Hasil akhir (r71J5)", () => {
    renderCard(
      { project: PROJECT, canCreate: false, gallery: GALLERY },
      { selection: SELECTION, delivery: DELIVERY },
    );
    expect(screen.getByText("Foto edit 10/10 · semua dikunci")).toBeInTheDocument();
    expect(screen.getByText("Dikunci")).toBeInTheDocument();
    expect(
      screen.getByText("Terkirim Sen, 5 Okt 2026 · 2 Foto edit · 1 Foto cetak"),
    ).toBeInTheDocument();
    expect(screen.getByText("Terkirim")).toBeInTheDocument();
  });

  it("A-34 shows only Status and Foto, then the short summaries, on phones", () => {
    stubViewport(true);
    renderCard(
      { project: PROJECT, canCreate: false, gallery: { ...GALLERY, state: "EXPIRED" } },
      { selection: SELECTION, delivery: DELIVERY },
    );
    expect(screen.getByText("8 foto pilihan · 3 hasil akhir")).toBeInTheDocument();
    expect(screen.getByText("Kedaluwarsa")).toBeInTheDocument();
    expect(screen.queryByText(/2 folder/)).not.toBeInTheDocument();
    expect(screen.getByText("Semua grup dikunci")).toBeInTheDocument();
    expect(
      screen.getByText("Terkirim Sen, 5 Okt 2026 · 2 Foto edit · 1 Foto cetak"),
    ).toBeInTheDocument();
  });

  it("AC-GAL-008 the card names the folder that failed to sync", () => {
    const failed = { ...GALLERY, failedSourceCount: 1, failedSourceNames: ["Rina-Keluarga"] };
    renderCard({ project: PROJECT, canCreate: false, gallery: failed });
    expect(screen.getByText("1 folder gagal disinkronkan")).toBeInTheDocument();
    expect(
      screen.getByText("Rina-Keluarga belum bisa dibaca. Buka galeri untuk melihat penyebabnya."),
    ).toBeInTheDocument();
  });
});

describe("GalleryCard share entry (AC-GFL-020)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubViewport(false);
  });

  function renderWithHost(card: GalleryCardView, openShare = vi.fn()) {
    render(
      <ProjectGalleryActionsProvider value={{ openShare, openMarkDelivered: vi.fn() }}>
        <GalleryCard workspaceId="ws-1" card={card} />
      </ProjectGalleryActionsProvider>,
    );
    return openShare;
  }

  it("offers Kirim link ke klien beside Kelola on desktop and asks the host to open the share", async () => {
    const openShare = renderWithHost({ project: PROJECT, canCreate: false, gallery: GALLERY });
    await userEvent.click(screen.getByRole("button", { name: "Kirim link ke klien" }));
    expect(openShare).toHaveBeenCalledWith("p-1");
  });

  it("hides the share when the gallery is expired (BR-GAL-010)", () => {
    renderWithHost({
      project: PROJECT,
      canCreate: false,
      gallery: { ...GALLERY, state: "EXPIRED" },
    });
    expect(screen.queryByRole("button", { name: "Kirim link ke klien" })).not.toBeInTheDocument();
  });

  it("shows the share as a full-width block under the facts on phones (design P4, P7)", () => {
    stubViewport(true);
    renderWithHost({ project: PROJECT, canCreate: false, gallery: GALLERY });
    expect(screen.getByRole("button", { name: "Kirim link ke klien" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kelola" })).toBeInTheDocument();
  });
});
