// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";

import { DeliveryCard } from "./delivery-card";
import type { DeliveryCardActions } from "./delivery-card.types";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const READY: DeliveryCardView = {
  state: "READY",
  projectTitle: "Wisuda Rina",
  editedCount: 24,
  printCount: 6,
  publishedAt: null,
  completedAt: null,
  canComplete: false,
  isShown: true,
};

function renderCard(card: DeliveryCardView, actions: Partial<DeliveryCardActions> = {}) {
  const all: DeliveryCardActions = {
    publishAction: vi.fn(() => Promise.resolve(undefined)),
    completeAction: vi.fn(() => Promise.resolve(undefined)),
    ...actions,
  };
  render(<DeliveryCard workspaceId="w1" projectId="p1" card={card} actions={all} />);
  return all;
}

describe("DeliveryCard (hasilakhirowner-kartu A–E)", () => {
  it("AC-DEL-001 B: confirms before publishing, naming the files and the new status", async () => {
    const actions = renderCard(READY);
    fireEvent.click(screen.getByRole("button", { name: "Publikasikan hasil akhir" }));
    expect(
      await screen.findByText(
        "24 foto Edited dan 6 file Print akan terlihat oleh klien. Status proyek menjadi Terkirim.",
      ),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Publikasikan" }));
    await vi.waitFor(() => {
      expect(actions.publishAction).toHaveBeenCalledWith("w1", "p1");
    });
  });

  it("AC-DEL-002 A: publishing asks the server and shows every reason", async () => {
    renderCard(
      { ...READY, state: "NO_FILES", editedCount: 0, printCount: 0 },
      {
        publishAction: vi.fn(() =>
          Promise.resolve({
            ok: false as const,
            code: "REFUSED" as const,
            reasons: ["NO_FINISHED_FILE", "GALLERY_NOT_PUBLISHED"] as const,
          }),
        ),
      },
    );
    expect(
      screen.getByText(/Belum ada file edited atau print yang tersinkron\. Buat/),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Publikasikan hasil akhir" }));
    expect(await screen.findByText("Hasil akhir belum bisa dipublikasikan")).toBeTruthy();
    expect(screen.getByText("Galeri harus berstatus dipublikasikan.")).toBeTruthy();
  });

  it("C: a published delivery shows its date and no button (Tandai selesai moved to the project header, A-34)", () => {
    renderCard({
      ...READY,
      state: "PUBLISHED",
      publishedAt: "2026-10-05T10:10:00Z",
      canComplete: true,
    });
    expect(screen.getByText("Dipublikasikan 5 Okt 2026, 17.10")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("D: a completed project shows the date and no button", () => {
    renderCard({ ...READY, state: "COMPLETED", completedAt: "2026-10-12T03:00:00Z" });
    expect(screen.getByText("Selesai 12 Okt 2026")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("E: an inactive gallery explains why", () => {
    renderCard({ ...READY, state: "GALLERY_INACTIVE" });
    expect(screen.getByText(/Galeri harus dipublikasikan lebih dulu/)).toBeTruthy();
  });
});
