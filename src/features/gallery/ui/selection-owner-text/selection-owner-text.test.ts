import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import type { OwnerGroupView } from "@/features/gallery/application/use-cases/owner-selection-views/owner-selection-views.types";

import { SELECTION_OWNER_COPY_NAMESPACE } from "../selection-owner-text/selection-owner.copy";
import { cardDescription, groupMeta, groupStatusChip } from "./selection-owner-text";

const t = copyTranslator(SELECTION_OWNER_COPY_NAMESPACE, "id");

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
    expect(groupMeta(t, GROUP, false, "id-ID")).toBe(
      "8 dari 8 foto · 3 catatan · dikirim 5 Okt 2026",
    );
  });

  it("AC-SEL-010 says dipilih for an open group on the page only", () => {
    const open: OwnerGroupView = {
      ...GROUP,
      status: "OPEN",
      usage: 3,
      noteCount: 0,
      submittedAt: null,
    };
    expect(groupMeta(t, open, true, "id-ID")).toBe("3 dari 8 foto dipilih");
    expect(groupMeta(t, open, false, "id-ID")).toBe("3 dari 8 foto");
  });

  it("uses foto when the item names no unit", () => {
    expect(
      groupMeta(t, { ...GROUP, unit: null, status: "LOCKED", noteCount: 0 }, false, "id-ID"),
    ).toBe("8 dari 8 foto");
  });

  it("chips: Terbuka is info, Dikirim success, Dikunci neutral", () => {
    expect(groupStatusChip(t, "OPEN")).toEqual({ label: "Terbuka", tone: "info" });
    expect(groupStatusChip(t, "SUBMITTED")).toEqual({ label: "Dikirim", tone: "success" });
    expect(groupStatusChip(t, "LOCKED")).toEqual({ label: "Dikunci", tone: "neutral" });
  });

  it("AC-SEL-010 describes the card by its state", () => {
    expect(cardDescription(t, "NOT_PUBLISHED", 0)).toBe("Klien memilih foto lewat galeri.");
    expect(cardDescription(t, "NO_ITEMS", 0)).toBeNull();
    expect(cardDescription(t, "OPEN", 0)).toBe("Pilihan per bagian paket.");
    expect(cardDescription(t, "REVIEW", 1)).toBe("Klien sudah mengirim 1 bagian.");
    expect(cardDescription(t, "REVIEW", 2)).toBe("Klien sudah mengirim 2 bagian.");
    expect(cardDescription(t, "FINAL", 0)).toBe("Pilihan sudah final.");
  });
});
