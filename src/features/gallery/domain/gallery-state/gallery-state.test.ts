import { describe, expect, it } from "vitest";

import { canShareGallery, galleryState, isWritable } from "./gallery-state";

const NOW = new Date("2026-10-18T03:00:00Z");

describe("galleryState (BR-GAL-005, D-1)", () => {
  it("BR-GAL-005 is OPEN for a live project with no expiry", () => {
    expect(galleryState("BOOKED", null, NOW)).toBe("OPEN");
  });

  it("BR-GAL-005 is OPEN while the expiry is in the future", () => {
    expect(galleryState("SHOOTING", new Date("2026-10-18T03:00:01Z"), NOW)).toBe("OPEN");
  });

  it("BR-GAL-005 is EXPIRED once the expiry has passed", () => {
    expect(galleryState("DELIVERED", new Date("2026-10-18T02:59:59Z"), NOW)).toBe("EXPIRED");
  });

  it("A-2 closes at the expiry instant when the Owner chooses today", () => {
    expect(galleryState("BOOKED", NOW, NOW)).toBe("EXPIRED");
  });

  it("BR-GAL-005 is CLOSED for a cancelled project, and CLOSED wins over EXPIRED", () => {
    expect(galleryState("CANCELLED", null, NOW)).toBe("CLOSED");
    expect(galleryState("CANCELLED", new Date("2020-01-01T00:00:00Z"), NOW)).toBe("CLOSED");
  });

  it("BR-GAL-005 keeps an expired gallery of a completed project EXPIRED, not CLOSED", () => {
    expect(galleryState("COMPLETED", new Date("2020-01-01T00:00:00Z"), NOW)).toBe("EXPIRED");
  });
});

describe("isWritable (BR-GAL-005)", () => {
  it.each([
    ["OPEN", true],
    ["EXPIRED", true],
    ["CLOSED", false],
  ] as const)("BR-GAL-005 treats %s as writable=%s", (state, writable) => {
    expect(isWritable(state)).toBe(writable);
  });
});

describe("canShareGallery (BR-GAL-010)", () => {
  const shareable = { projectStatus: "BOOKED", state: "OPEN", activeSourceCount: 1 } as const;

  it("BR-GAL-010 allows sharing from BOOKED to COMPLETED on an open gallery with a source", () => {
    for (const projectStatus of [
      "BOOKED",
      "SHOOTING",
      "POST_PROCESSING",
      "DELIVERED",
      "COMPLETED",
    ] as const) {
      expect(canShareGallery({ ...shareable, projectStatus })).toBe(true);
    }
  });

  it("BR-GAL-010 refuses a draft or cancelled project", () => {
    expect(canShareGallery({ ...shareable, projectStatus: "DRAFT" })).toBe(false);
    expect(canShareGallery({ ...shareable, projectStatus: "CANCELLED" })).toBe(false);
  });

  it("BR-GAL-010 refuses an expired or closed gallery", () => {
    expect(canShareGallery({ ...shareable, state: "EXPIRED" })).toBe(false);
    expect(canShareGallery({ ...shareable, state: "CLOSED" })).toBe(false);
  });

  it("BR-GAL-010 needs at least one active source", () => {
    expect(canShareGallery({ ...shareable, activeSourceCount: 0 })).toBe(false);
  });
});
