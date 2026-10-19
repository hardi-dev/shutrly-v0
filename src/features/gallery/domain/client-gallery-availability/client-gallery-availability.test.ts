import { describe, expect, it } from "vitest";

import { isAvailableToClient } from "./client-gallery-availability";
import type { AvailabilityInput } from "./client-gallery-availability.types";

const now = new Date("2026-10-06T10:00:00Z");
const open: AvailabilityInput = {
  projectStatus: "POST_PROCESSING",
  expiresAt: null,
  now,
};

describe("client gallery availability (BR-ACC-001, BR-GAL-005)", () => {
  it("AC-GFL-008 opens a booked project's gallery without a publish step", () => {
    expect(isAvailableToClient({ ...open, projectStatus: "BOOKED" })).toBe(true);
    expect(isAvailableToClient(open)).toBe(true);
  });

  it("AC-GFL-008 opens a gallery whose expiry is in the future", () => {
    expect(isAvailableToClient({ ...open, expiresAt: new Date("2026-10-07T00:00:00Z") })).toBe(
      true,
    );
  });

  it.each([
    ["a cancelled project", { projectStatus: "CANCELLED" }],
    ["AC-GFL-012 a gallery at its expiry", { expiresAt: now }],
    ["a gallery past its expiry", { expiresAt: new Date("2026-10-05T00:00:00Z") }],
  ] as const)("AC-GFL-016 closes %s", (_case, change) => {
    expect(isAvailableToClient({ ...open, ...change })).toBe(false);
  });

  it("BR-ACC-001 fails closed on a project status the domain does not know", () => {
    expect(isAvailableToClient({ ...open, projectStatus: "ARCHIVED_BY_LEGACY" })).toBe(false);
  });
});
