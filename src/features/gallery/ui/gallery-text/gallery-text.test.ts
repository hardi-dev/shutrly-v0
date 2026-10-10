import { describe, expect, it } from "vitest";

import {
  galleryExpiryFact,
  galleryMetaText,
  galleryStatusChip,
  galleryVisibilityText,
  photoCountsText,
} from "./gallery-text";

const BASE = {
  status: "DRAFT" as const,
  expiresAt: null,
  expiryDays: null,
  activeSourceCount: 0,
  counts: { proof: 0, edited: 0, print: 0, missing: 0 },
};

describe("gallery text", () => {
  it("AC-GAL-016 AC-GAL-020 labels each status", () => {
    expect(galleryStatusChip("DRAFT")).toEqual({ tone: "neutral", label: "Draf", hasDot: true });
    expect(galleryStatusChip("PUBLISHED").label).toBe("Dipublikasikan");
    expect(galleryStatusChip("EXPIRED")).toMatchObject({ tone: "warning", label: "Kedaluwarsa" });
  });

  it("AC-GAL-014 counts per kind with the missing ones", () => {
    expect(photoCountsText({ proof: 5, edited: 3, print: 1, missing: 1 })).toBe(
      "5 proof (1 hilang) · 4 hasil akhir",
    );
  });

  it("AC-GAL-018 AC-GAL-019 describes no expiry, a draft duration and a day", () => {
    expect(galleryExpiryFact(BASE, "id-ID")).toEqual({ text: "Tidak ada", isMuted: true });
    expect(galleryExpiryFact({ ...BASE, expiryDays: 30 }, "id-ID").text).toBe(
      "30 hari setelah dipublikasikan",
    );
    expect(galleryExpiryFact({ ...BASE, expiresAt: "2026-11-03T03:00:00Z" }, "id-ID").text).toBe(
      "Sel, 3 Nov 2026",
    );
  });

  it("design header meta: empty draft, published and expired", () => {
    expect(galleryMetaText(BASE, "Wisuda Basic — Rina", "id-ID")).toBe(
      "Wisuda Basic — Rina · Belum ada folder · Tanpa kedaluwarsa",
    );
    const published = {
      ...BASE,
      status: "PUBLISHED" as const,
      activeSourceCount: 2,
      counts: { proof: 8, edited: 2, print: 1, missing: 0 },
      expiresAt: "2026-11-03T03:00:00Z",
    };
    expect(galleryMetaText(published, null, "id-ID")).toBe(
      "2 folder · 8 proof · Kedaluwarsa Sel, 3 Nov 2026",
    );
    expect(galleryMetaText({ ...published, status: "EXPIRED" }, null, "id-ID")).toBe(
      "2 folder · 8 proof · Kedaluwarsa sejak Sel, 3 Nov 2026",
    );
    expect(galleryMetaText({ ...published, status: "ARCHIVED" }, null, "id-ID")).toBe(
      "2 folder · 8 proof",
    );
  });

  it("design marks a past expiry (lewat) and words visibility per status and project", () => {
    expect(
      galleryExpiryFact({ ...BASE, status: "EXPIRED", expiresAt: "2026-11-03T03:00:00Z" }, "id-ID")
        .text,
    ).toBe("Sel, 3 Nov 2026 (lewat)");
    expect(galleryVisibilityText("EXPIRED", "BOOKED")).toBe(
      "Tidak terlihat oleh klien selama galeri kedaluwarsa.",
    );
    expect(galleryVisibilityText("ARCHIVED", "BOOKED")).toBe("Tidak terlihat oleh klien.");
    expect(galleryVisibilityText("DRAFT", "CANCELLED")).toBe("Tidak akan terlihat oleh klien.");
    expect(galleryVisibilityText("PUBLISHED", "SHOOTING")).toBe("Terlihat oleh klien sekarang.");
  });
});
