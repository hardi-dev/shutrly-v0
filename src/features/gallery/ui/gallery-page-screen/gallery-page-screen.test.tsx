import { render, screen } from "@testing-library/react";
import { fakePageActions } from "@tests/support/gallery/fake-page-actions";
import { stubViewport } from "@tests/support/gallery/viewport";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GalleryPageScreen } from "./gallery-page-screen";

vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

const ACTIONS = fakePageActions();

const PAGE = {
  project: { id: "p-1", title: "Wisuda Basic — Rina", status: "BOOKED" as const },
  gallery: {
    id: "g-1",
    status: "DRAFT" as const,
    password: "mawar-4821",
    expiresAt: null,
    expiryDays: null,
    activeSourceCount: 0,
    failedSourceCount: 0,
    failedSourceNames: [],
    counts: { proof: 0, edited: 0, print: 0, missing: 0 },
  },
  sources: [],
  linkableSources: [{ id: "src-1", name: "Google Drive" }],
  directImages: false,
  previewPhotos: [],
};

describe("GalleryPageScreen", () => {
  beforeEach(() => {
    stubViewport(false);
  });

  it("AC-GAL-014 shows an empty Sumber foto and no photos yet", () => {
    render(<GalleryPageScreen workspaceId="ws-1" page={PAGE} actions={ACTIONS} />);
    expect(screen.getByText("Belum ada folder")).toBeInTheDocument();
    expect(screen.getByText("Belum ada foto")).toBeInTheDocument();
  });

  it("A-34 puts Akses klien, Pilihan klien and Hasil akhir before Sumber foto in the 720 column", () => {
    render(
      <GalleryPageScreen
        workspaceId="ws-1"
        page={PAGE}
        actions={ACTIONS}
        accessCard={<section>Akses klien</section>}
        selectionCard={<section>Pilihan klien</section>}
        deliveryCard={<section>Hasil akhir</section>}
      />,
    );
    const main = screen.getByRole("main");
    expect(main.className).toContain("max-w-(--size-content-narrow)");
    const order = ["Akses klien", "Pilihan klien", "Hasil akhir", "Sumber foto"].map((text) =>
      main.textContent.indexOf(text),
    );
    expect(order.every((at) => at >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(screen.queryByRole("button", { name: "Salin password" })).not.toBeInTheDocument();
  });

  it("design shows the status and meta in the phone header block", () => {
    stubViewport(true);
    render(<GalleryPageScreen workspaceId="ws-1" page={PAGE} actions={ACTIONS} />);
    expect(screen.getByText("Draf")).toBeInTheDocument();
    expect(screen.getByText("Belum ada folder · Tanpa kedaluwarsa")).toBeInTheDocument();
  });
});
