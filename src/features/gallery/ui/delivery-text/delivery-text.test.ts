import { describe, expect, it } from "vitest";

import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";

import { deliveryNote, deliveryRows, finishedFiles } from "./delivery-text";

const CARD: DeliveryCardView = {
  state: "READY",
  projectTitle: "Wisuda Rina",
  editedCount: 24,
  printCount: 6,
  publishedAt: null,
  completedAt: null,
  canComplete: false,
  isShown: true,
};

describe("delivery text (hasilakhirowner-kartu)", () => {
  it("B: one ready row per finished kind", () => {
    expect(deliveryRows(CARD).map((row) => [row.title, row.meta, row.chip.label])).toEqual([
      ["Edited", "24 foto", "Siap"],
      ["Print", "6 file", "Siap"],
    ]);
  });

  it("C: the publication with its time and what the client can download", () => {
    const rows = deliveryRows({ ...CARD, state: "PUBLISHED", publishedAt: "2026-10-05T10:10:00Z" });
    expect(rows.map((row) => [row.title, row.meta, row.chip.label])).toEqual([
      [
        "Dipublikasikan 5 Okt 2026, 17.10",
        "Klien bisa mengunduh 24 foto Edited dan 6 file Print.",
        "Dipublikasikan",
      ],
    ]);
  });

  it("D: the completion date", () => {
    const rows = deliveryRows({ ...CARD, state: "COMPLETED", completedAt: "2026-10-12T03:00:00Z" });
    expect(rows[0]?.title).toBe("Selesai 12 Okt 2026");
  });

  it("A and E show a note instead of rows", () => {
    expect(deliveryNote({ ...CARD, state: "NO_FILES" })).toMatch(/^Belum ada file edited/);
    expect(deliveryNote({ ...CARD, state: "GALLERY_INACTIVE" })).toMatch(/^Galeri harus/);
    expect(deliveryRows({ ...CARD, state: "NO_FILES" })).toEqual([]);
  });

  it("leaves out a kind with no file", () => {
    expect(finishedFiles({ editedCount: 3, printCount: 0 })).toBe("3 foto Edited");
  });
});
