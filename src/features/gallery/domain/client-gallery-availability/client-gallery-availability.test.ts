import { describe, expect, it } from "vitest";

import { isAvailableToClient } from "./client-gallery-availability";
import type { AvailabilityInput } from "./client-gallery-availability.types";

const now = new Date("2026-10-06T10:00:00Z");
const open: AvailabilityInput = {
  projectStatus: "POST_PROCESSING",
  galleryStatus: "PUBLISHED",
  expiresAt: null,
  now,
};

describe("client gallery availability (BR-ACC-001, BR-GAL-005, A-3)", () => {
  it("AC-ACC-001 opens a published gallery without expiry", () => {
    expect(isAvailableToClient(open)).toBe(true);
    expect(isAvailableToClient({ ...open, expiresAt: new Date("2026-10-07T00:00:00Z") })).toBe(
      true,
    );
  });

  it.each([
    ["a draft gallery", { galleryStatus: "DRAFT" }],
    ["an archived gallery", { galleryStatus: "ARCHIVED" }],
    ["a project without gallery", { galleryStatus: null }],
    ["a cancelled project", { projectStatus: "CANCELLED" }],
    ["AC-ACC-010 a gallery at its expiry", { expiresAt: now }],
  ] as const)("AC-ACC-004 closes %s", (_case, change) => {
    expect(isAvailableToClient({ ...open, ...change })).toBe(false);
  });
});
