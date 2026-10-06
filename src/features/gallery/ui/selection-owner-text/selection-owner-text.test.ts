import { describe, expect, it } from "vitest";

import type { OwnerGroupView } from "@/features/gallery/application/use-cases/owner-selection-views/owner-selection-views.types";

import { cardDescription, groupMeta, groupStatusChip } from "./selection-owner-text";

const GROUP: OwnerGroupView = {
  id: "g",
  name: "Foto edit",
  unit: "foto",
  mode: "COUNT",
  status: "SUBMITTED",
  usage: 8,
  limit: 8,
  pickCount: 8,
  noteCount: 3,
  // 2026-10-05 07:20 UTC is 14.20 in Jakarta.
  submittedAt: "2026-10-05T07:20:00.000Z",
  lockedAt: null,
};

describe("selection owner text (owner exports)", () => {
  it("AC-SEL-010 writes usage, notes and the sent date on a submitted group", () => {
    expect(groupMeta(GROUP, false)).toBe("8 dari 8 foto · 3 catatan · dikirim 5 Okt 2026");
  });

  it("AC-SEL-010 says dipilih for an open group on the page only", () => {
    const open: OwnerGroupView = {
      ...GROUP,
      status: "OPEN",
      usage: 3,
      noteCount: 0,
      submittedAt: null,
    };
    expect(groupMeta(open, true)).toBe("3 dari 8 foto dipilih");
    expect(groupMeta(open, false)).toBe("3 dari 8 foto");
  });

  it("uses foto when the item names no unit", () => {
    expect(groupMeta({ ...GROUP, unit: null, status: "LOCKED", noteCount: 0 }, false)).toBe(
      "8 dari 8 foto",
    );
  });

  it("chips: Terbuka is info, Dikirim success, Dikunci neutral", () => {
    expect(groupStatusChip("OPEN")).toEqual({ label: "Terbuka", tone: "info" });
    expect(groupStatusChip("SUBMITTED")).toEqual({ label: "Dikirim", tone: "success" });
    expect(groupStatusChip("LOCKED")).toEqual({ label: "Dikunci", tone: "neutral" });
  });

  it("AC-SEL-010 describes the card by its state", () => {
    expect(cardDescription("NOT_PUBLISHED", 0)).toBe("Klien memilih foto lewat galeri.");
    expect(cardDescription("NO_ITEMS", 0)).toBeNull();
    expect(cardDescription("OPEN", 0)).toBe("Pilihan per bagian paket.");
    expect(cardDescription("REVIEW", 1)).toBe("Klien sudah mengirim satu bagian.");
    expect(cardDescription("REVIEW", 2)).toBe("Klien sudah mengirim 2 bagian.");
    expect(cardDescription("FINAL", 0)).toBe("Pilihan sudah final.");
  });
});
