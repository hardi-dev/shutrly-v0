import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";
import type {
  OwnerGroupView,
  SelectionCardView,
} from "@/features/gallery/application/use-cases/owner-selection-views/owner-selection-views.types";

import { DELIVERY_COPY_NAMESPACE } from "../delivery-copy/delivery.copy";
import { SELECTION_OWNER_COPY_NAMESPACE } from "../selection-owner-text/selection-owner.copy";
import { GALLERY_SUMMARY_COPY_NAMESPACE } from "./gallery-summary.copy";
import { deliverySummary, selectionSummary } from "./gallery-summary-text";

const t = copyTranslator(GALLERY_SUMMARY_COPY_NAMESPACE, "id");
const selT = copyTranslator(SELECTION_OWNER_COPY_NAMESPACE, "id");
const delT = copyTranslator(DELIVERY_COPY_NAMESPACE, "id");

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
  state: "DELIVERED",
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
    expect(selectionSummary(t, selT, card, false)).toEqual({
      title: "Pilihan klien",
      meta: "Foto edit 10/10 · Foto cetak 5/5 · semua dikunci",
      chip: { label: "Dikunci", tone: "neutral" },
    });
    expect(selectionSummary(t, selT, card, true)?.meta).toBe("Semua grup dikunci");
  });

  it("names the groups waiting for review and the open groups", () => {
    const review = selection("REVIEW", ["SUBMITTED", "OPEN"]);
    expect(selectionSummary(t, selT, review, false)).toMatchObject({
      meta: "Foto edit 10/10 · Foto cetak 5/5 · 1 dikirim",
      chip: { label: "Dikirim", tone: "success" },
    });
    expect(selectionSummary(t, selT, review, true)?.meta).toBe("1 grup dikirim");
    const open = selection("OPEN", ["OPEN", "OPEN"]);
    expect(selectionSummary(t, selT, open, false)).toMatchObject({
      meta: "Foto edit 10/10 · Foto cetak 5/5 · terbuka",
      chip: { label: "Terbuka", tone: "info" },
    });
    expect(selectionSummary(t, selT, open, true)?.meta).toBe("Klien sedang memilih");
  });

  it("explains an unpublished gallery without a chip, and hides the row without selection items", () => {
    expect(selectionSummary(t, selT, selection("NOT_PUBLISHED"), false)).toEqual({
      title: "Pilihan klien",
      meta: "Klien baru bisa memilih setelah galeri dipublikasikan.",
      chip: null,
    });
    expect(selectionSummary(t, selT, selection("NO_ITEMS"), false)).toBeNull();
  });
});

describe("deliverySummary (F-27 P4, P7 Galeri card)", () => {
  it("AC-GFL-006 a delivery shows its date, the kinds and the Terkirim chip", () => {
    expect(deliverySummary(delT, DELIVERY, "id-ID")).toEqual({
      title: "Hasil akhir",
      meta: "Terkirim Sen, 5 Okt 2026 · 2 Foto edit · 1 Foto cetak",
      chip: { label: "Terkirim", tone: "success" },
    });
  });

  it("AC-GFL-019 ready files show their kinds and Siap diunduh", () => {
    const ready = { ...DELIVERY, state: "READY" as const, publishedAt: null };
    expect(deliverySummary(delT, ready, "id-ID")).toMatchObject({
      meta: "2 Foto edit · 1 Foto cetak · terlihat oleh klien",
      chip: { label: "Siap diunduh", tone: "info" },
    });
  });

  it("AC-GFL-017 without a finished file, the row names the reason", () => {
    expect(deliverySummary(delT, { ...DELIVERY, state: "NO_FILES" }, "id-ID")).toMatchObject({
      meta: "Belum ada hasil akhir yang tersinkron.",
      chip: null,
    });
  });

  it("hides the row where final delivery never applies", () => {
    expect(deliverySummary(delT, { ...DELIVERY, isShown: false }, "id-ID")).toBeNull();
  });
});
