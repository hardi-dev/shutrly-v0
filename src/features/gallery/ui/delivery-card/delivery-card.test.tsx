// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";

import { DeliveryCard } from "./delivery-card";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

const READY: DeliveryCardView = {
  state: "READY",
  projectTitle: "Wisuda Rina",
  editedCount: 24,
  printCount: 6,
  items: [
    { id: "i-edit", name: "Foto edit", count: 24 },
    { id: "i-print", name: "Foto cetak", count: 6 },
  ],
  publishedAt: null,
  completedAt: null,
  canComplete: false,
  isShown: true,
};

describe("DeliveryCard (F-27 AC-GFL-006, 017, 019)", () => {
  it("AC-GFL-019 lists the synced finished files as ready, with no publish action", () => {
    render(<DeliveryCard card={READY} />);
    expect(screen.getAllByText("Siap diunduh")).toHaveLength(2);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("AC-GFL-017 says no finished file is synced yet", () => {
    render(<DeliveryCard card={{ ...READY, state: "NO_FILES", editedCount: 0, printCount: 0 }} />);
    expect(screen.getByText(/^Belum ada hasil akhir/)).toBeInTheDocument();
  });

  it("AC-GFL-006 shows a delivered project as Terkirim", () => {
    render(
      <DeliveryCard card={{ ...READY, state: "DELIVERED", publishedAt: "2026-10-05T03:00:00Z" }} />,
    );
    expect(screen.getAllByText("Terkirim")).toHaveLength(1);
  });
});
