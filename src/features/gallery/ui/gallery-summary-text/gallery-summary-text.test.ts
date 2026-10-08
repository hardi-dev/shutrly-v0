import { describe, expect, it } from "vitest";

import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";
import type {
  OwnerGroupView,
  SelectionCardView,
} from "@/features/gallery/application/use-cases/owner-selection-views/owner-selection-views.types";

import { deliverySummary, selectionSummary } from "./gallery-summary-text";

function group(name: string, status: OwnerGroupView["status"], usage: number, limit: number) {
  return {
    id: name,
    name,
    unit: null,
    mode: "COUNT" as const,
    status,
    usage,
    limit,
    pickCount: usage,
    noteCount: 0,
    submittedAt: null,
    lockedAt: null,
  };
}

function selection(
  state: SelectionCardView["state"],
  statuses: OwnerGroupView["status"][] = [],
): SelectionCardView {
  const groups = statuses.map((status, index) =>
    index === 0 ? group("Foto edit", status, 10, 10) : group("Foto cetak", status, 5, 5),
  );
  return { projectTitle: "Wisuda Rina", state, groups, galleryExists: true };
}

const DELIVERY: DeliveryCardView = {
  state: "PUBLISHED",
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

describe("selectionSummary (Owner 7 Galeri card)", () => {
  it("r71J5/QUSVb: every group locked", () => {
    const card = selection("FINAL", ["LOCKED", "LOCKED"]);
    expect(selectionSummary(card, false)).toEqual({
      title: "Pilihan klien",
      meta: "Foto edit 10/10 · Foto cetak 5/5 · semua dikunci",
      chip: { label: "Dikunci", tone: "neutral" },
    });
    expect(selectionSummary(card, true)?.meta).toBe("Semua grup dikunci");
  });

  it("names the groups waiting for review and the open groups", () => {
    const review = selection("REVIEW", ["SUBMITTED", "OPEN"]);
    expect(selectionSummary(review, false)).toMatchObject({
      meta: "Foto edit 10/10 · Foto cetak 5/5 · 1 dikirim",
      chip: { label: "Dikirim", tone: "success" },
    });
    expect(selectionSummary(review, true)?.meta).toBe("1 grup dikirim");
    const open = selection("OPEN", ["OPEN", "OPEN"]);
    expect(selectionSummary(open, false)).toMatchObject({
      meta: "Foto edit 10/10 · Foto cetak 5/5 · terbuka",
      chip: { label: "Terbuka", tone: "info" },
    });
    expect(selectionSummary(open, true)?.meta).toBe("Klien sedang memilih");
  });

  it("explains an unpublished gallery without a chip, and hides the row without selection items", () => {
    expect(selectionSummary(selection("NOT_PUBLISHED"), false)).toEqual({
      title: "Pilihan klien",
      meta: "Klien baru bisa memilih setelah galeri dipublikasikan.",
      chip: null,
    });
    expect(selectionSummary(selection("NO_ITEMS"), false)).toBeNull();
  });
});

describe("deliverySummary (Owner 7 Galeri card)", () => {
  it("r71J5/QUSVb: published, with the kinds on desktop", () => {
    expect(deliverySummary(DELIVERY, false)).toEqual({
      title: "Hasil akhir",
      meta: "Dipublikasikan Sen, 5 Okt 2026 · 2 Foto edit · 1 Foto cetak",
      chip: { label: "Dipublikasikan", tone: "success" },
    });
    expect(deliverySummary(DELIVERY, true)?.meta).toBe("Dipublikasikan Sen, 5 Okt 2026");
    expect(deliverySummary({ ...DELIVERY, state: "COMPLETED" }, true)?.chip?.label).toBe(
      "Dipublikasikan",
    );
  });

  it("shows ready files, the card notes, and hides the row where delivery never applies", () => {
    const items = [{ id: "i-edit", name: "Foto edit", count: 2 }];
    const ready = { ...DELIVERY, state: "READY" as const, publishedAt: null, printCount: 0, items };
    expect(deliverySummary(ready, false)).toMatchObject({
      meta: "2 Foto edit siap",
      chip: { label: "Siap", tone: "info" },
    });
    expect(deliverySummary(ready, true)?.meta).toBe("Siap dipublikasikan");
    expect(deliverySummary({ ...DELIVERY, state: "NO_FILES" }, false)).toMatchObject({
      meta: "Belum ada hasil akhir yang tersinkron.",
      chip: null,
    });
    expect(deliverySummary({ ...DELIVERY, state: "GALLERY_INACTIVE" }, false)).toMatchObject({
      meta: "Galeri harus berstatus dipublikasikan.",
      chip: null,
    });
    expect(deliverySummary({ ...DELIVERY, isShown: false }, false)).toBeNull();
  });
});
