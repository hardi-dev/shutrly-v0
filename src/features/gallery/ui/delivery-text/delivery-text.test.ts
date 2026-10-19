import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";

import { DELIVERY_COPY_NAMESPACE } from "../delivery-copy/delivery.copy";
import { deliveredHeaderMeta, deliveryNote, deliveryRows, finishedFiles } from "./delivery-text";

const t = copyTranslator(DELIVERY_COPY_NAMESPACE, "id");

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
  it("B F-21: one ready row per package item with files", () => {
    expect(
      deliveryRows(t, CARD, "id-ID").map((row) => [row.title, row.meta, row.chip.label]),
    ).toEqual([
      ["Foto edit", "24 file", "Siap diunduh"],
      ["Foto cetak", "6 file", "Siap diunduh"],
    ]);
  });

  it("AC-GFL-006 C: the delivery with its time and the finished files", () => {
    const rows = deliveryRows(
      t,
      { ...CARD, state: "DELIVERED", publishedAt: "2026-10-05T10:10:00Z" },
      "id-ID",
    );
    expect(rows.map((row) => [row.title, row.chip.label])).toEqual([
      ["Terkirim 5 Okt 2026, 17.10 · 24 Foto edit · 6 Foto cetak", "Terkirim"],
    ]);
  });

  it("D: the completion date", () => {
    const rows = deliveryRows(
      t,
      { ...CARD, state: "COMPLETED", completedAt: "2026-10-12T03:00:00Z" },
      "id-ID",
    );
    expect(rows[0]?.title).toBe("Terkirim 12 Okt 2026");
  });

  it("A shows a note instead of rows", () => {
    expect(deliveryNote(t, { ...CARD, state: "NO_FILES" })).toMatch(/^Belum ada hasil akhir/);
    expect(deliveryRows(t, { ...CARD, state: "NO_FILES" }, "id-ID")).toEqual([]);
  });

  it("leaves out an item with no file", () => {
    const items = [
      { id: "i-edit", name: "Foto edit", count: 3 },
      { id: "i-print", name: "Foto cetak", count: 0 },
    ];
    expect(finishedFiles(t, { items })).toBe("3 file Foto edit");
  });

  it("Owner 7: a delivered project's header says when the project was delivered", () => {
    const published = { ...CARD, state: "DELIVERED" as const, publishedAt: "2026-10-05T03:00:00Z" };
    expect(deliveredHeaderMeta(t, published, "id-ID")).toBe(
      "Hasil akhir dipublikasikan Sen, 5 Okt 2026",
    );
    expect(deliveredHeaderMeta(t, { ...published, state: "COMPLETED" }, "id-ID")).toBeNull();
    expect(deliveredHeaderMeta(t, CARD, "id-ID")).toBeNull();
  });
});
