import { describe, expect, it } from "vitest";

import type { GalleryCardView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import { isGalleryShareable } from "./gallery-share-eligibility";

const GALLERY = {
  id: "g-1",
  state: "OPEN" as const,
  password: "mawar-4821",
  expiresAt: null,
  expiryDays: null,
  activeSourceCount: 1,
  failedSourceCount: 0,
  failedSourceNames: [],
  counts: { proof: 1, edited: 0, print: 0, missing: 0 },
};

function card(overrides: Partial<NonNullable<GalleryCardView["gallery"]>>, status = "BOOKED") {
  return {
    project: { id: "p-1", title: "Wisuda Rina", status },
    canCreate: false,
    gallery: { ...GALLERY, ...overrides },
  } as GalleryCardView;
}

describe("isGalleryShareable (BR-GAL-010, AC-GFL-020)", () => {
  it("allows an open gallery with a folder on a booked project", () => {
    expect(isGalleryShareable(card({}))).toBe(true);
  });

  it("refuses an expired gallery, a gallery without folders and a draft project", () => {
    expect(isGalleryShareable(card({ state: "EXPIRED" }))).toBe(false);
    expect(isGalleryShareable(card({ activeSourceCount: 0 }))).toBe(false);
    expect(isGalleryShareable(card({}, "DRAFT"))).toBe(false);
  });

  it("refuses a project without a gallery", () => {
    expect(isGalleryShareable({ project: card({}).project, canCreate: false, gallery: null })).toBe(
      false,
    );
  });
});
