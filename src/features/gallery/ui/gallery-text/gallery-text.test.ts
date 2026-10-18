import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import { GALLERY_COPY_NAMESPACE } from "../gallery-copy/gallery-copy.copy";
import {
  galleryExpiryFact,
  galleryMetaText,
  galleryStatusChip,
  galleryVisibilityText,
  photoCountsText,
} from "./gallery-text";

const t = copyTranslator(GALLERY_COPY_NAMESPACE, "id");

const BASE = {
  state: "OPEN" as const,
  expiresAt: null,
  expiryDays: null,
  activeSourceCount: 0,
  counts: { proof: 0, edited: 0, print: 0, missing: 0 },
};

describe("gallery text", () => {
  it("AC-GAL-016 AC-GAL-020 labels each derived state", () => {
    expect(galleryStatusChip(t, "OPEN").label).toBe("Dipublikasikan");
    expect(galleryStatusChip(t, "EXPIRED")).toMatchObject({
      tone: "warning",
      label: "Kedaluwarsa",
    });
    expect(galleryStatusChip(t, "CLOSED")).toMatchObject({ tone: "neutral" });
  });

  it("AC-GAL-014 counts per kind with the missing ones", () => {
    expect(photoCountsText(t, { proof: 5, edited: 3, print: 1, missing: 1 })).toBe(
      "5 foto pilihan (1 hilang) · 4 hasil akhir",
    );
  });

  it("AC-GAL-018 AC-GAL-019 describes no expiry, a draft duration and a day", () => {
    expect(galleryExpiryFact(t, BASE, "id-ID")).toEqual({
      text: "Tanpa kedaluwarsa",
      isMuted: true,
    });
    expect(galleryExpiryFact(t, { ...BASE, expiryDays: 30 }, "id-ID").text).toBe(
      "30 hari setelah dipublikasikan",
    );
    expect(galleryExpiryFact(t, { ...BASE, expiresAt: "2026-11-03T03:00:00Z" }, "id-ID").text).toBe(
      "Sel, 3 Nov 2026",
    );
  });

  it("design header meta: empty draft, published and expired", () => {
    expect(galleryMetaText(t, BASE, "Wisuda Basic — Rina", "id-ID")).toBe(
      "Wisuda Basic — Rina · Belum ada folder · Tanpa kedaluwarsa",
    );
    const published = {
      ...BASE,
      state: "OPEN" as const,
      activeSourceCount: 2,
      counts: { proof: 8, edited: 2, print: 1, missing: 0 },
      expiresAt: "2026-11-03T03:00:00Z",
    };
    expect(galleryMetaText(t, published, null, "id-ID")).toBe(
      "2 folder · 8 foto pilihan · Kedaluwarsa pada Sel, 3 Nov 2026",
    );
    expect(galleryMetaText(t, { ...published, state: "EXPIRED" }, null, "id-ID")).toBe(
      "2 folder · 8 foto pilihan · Kedaluwarsa sejak Sel, 3 Nov 2026",
    );
    expect(galleryMetaText(t, { ...published, state: "CLOSED" }, null, "id-ID")).toBe(
      "2 folder · 8 foto pilihan",
    );
  });

  it("design marks a past expiry (kedaluwarsa) and words visibility per derived state", () => {
    expect(
      galleryExpiryFact(
        t,
        { ...BASE, state: "EXPIRED", expiresAt: "2026-11-03T03:00:00Z" },
        "id-ID",
      ).text,
    ).toBe("Sel, 3 Nov 2026 (kedaluwarsa)");
    expect(galleryVisibilityText(t, "EXPIRED")).toBe(
      "Disembunyikan dari klien selama galeri kedaluwarsa.",
    );
    expect(galleryVisibilityText(t, "CLOSED")).toBe("Disembunyikan dari klien.");
    expect(galleryVisibilityText(t, "OPEN")).toBe("Terlihat oleh klien sekarang.");
  });
});
