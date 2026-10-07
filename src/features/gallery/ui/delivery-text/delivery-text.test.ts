import { describe, expect, it } from "vitest";

import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";

import { deliveredHeaderMeta, deliveryNote, deliveryRows, finishedFiles } from "./delivery-text";

const CARD: DeliveryCardView = {
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

describe("delivery text (hasilakhirowner-kartu)", () => {
  it("B F-20: one ready row per package item with files", () => {
    expect(deliveryRows(CARD).map((row) => [row.title, row.meta, row.chip.label])).toEqual([
      ["Foto edit", "24 file", "Siap"],
      ["Foto cetak", "6 file", "Siap"],
    ]);
  });

  it("C: the publication with its time and what the client can download", () => {
    const rows = deliveryRows({ ...CARD, state: "PUBLISHED", publishedAt: "2026-10-05T10:10:00Z" });
    expect(rows.map((row) => [row.title, row.meta, row.chip.label])).toEqual([
      [
        "Dipublikasikan 5 Okt 2026, 17.10",
        "Klien bisa mengunduh 24 file Foto edit dan 6 file Foto cetak.",
        "Dipublikasikan",
      ],
    ]);
  });

  it("D: the completion date", () => {
    const rows = deliveryRows({ ...CARD, state: "COMPLETED", completedAt: "2026-10-12T03:00:00Z" });
    expect(rows[0]?.title).toBe("Selesai 12 Okt 2026");
  });

  it("A and E show a note instead of rows", () => {
    expect(deliveryNote({ ...CARD, state: "NO_FILES" })).toMatch(/^Belum ada hasil akhir/);
    expect(deliveryNote({ ...CARD, state: "GALLERY_INACTIVE" })).toMatch(/^Galeri harus/);
    expect(deliveryRows({ ...CARD, state: "NO_FILES" })).toEqual([]);
  });

  it("leaves out an item with no file", () => {
    const items = [
      { id: "i-edit", name: "Foto edit", count: 3 },
      { id: "i-print", name: "Foto cetak", count: 0 },
    ];
    expect(finishedFiles({ items })).toBe("3 file Foto edit");
  });

  it("Owner 7: a delivered project's header says when final delivery was published", () => {
    const published = { ...CARD, state: "PUBLISHED" as const, publishedAt: "2026-10-05T03:00:00Z" };
    expect(deliveredHeaderMeta(published)).toBe("Hasil akhir dipublikasikan Sen, 5 Okt 2026");
    expect(deliveredHeaderMeta({ ...published, state: "COMPLETED" })).toBeNull();
    expect(deliveredHeaderMeta(CARD)).toBeNull();
  });
});
