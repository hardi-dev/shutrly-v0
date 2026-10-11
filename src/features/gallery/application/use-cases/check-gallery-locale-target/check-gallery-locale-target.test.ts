import { describe, expect, it, vi } from "vitest";

import type { ClientAccessRecord } from "../../ports/client-access-repository/client-access-repository.port";
import { checkGalleryLocaleTarget } from "./check-gallery-locale-target";

const TOKEN = "A".repeat(43);
const RECORD: ClientAccessRecord = {
  workspaceId: "00000000-0000-4000-8000-0000000000aa",
  projectId: "00000000-0000-4000-8000-000000000001",
  projectStatus: "POST_PROCESSING",
  projectTitle: "Wisuda Rina",
  clientFirstName: "Rina",
  studioName: "Studio Senja",
  galleryId: "00000000-0000-4000-8000-000000000002",
  galleryStatus: "PUBLISHED",
  expiresAt: null,
  passwordHash: "hash(mawar-4821)",
  passwordVersion: 1,
  contentVersion: 1,
  finalDeliveryPublishedAt: null,
};

function deps(record: ClientAccessRecord | null) {
  return {
    repository: {
      findByTokenUnscoped: vi.fn(() => Promise.resolve(record)),
      findOwnerLocaleByTokenUnscoped: vi.fn(() => Promise.resolve(null)),
    },
    rateLimiter: {
      hit: vi.fn(() => Promise.resolve(true)),
      peek: vi.fn(() => Promise.resolve(true)),
    },
    now: new Date("2026-10-10T10:00:00Z"),
  };
}

describe("checkGalleryLocaleTarget", () => {
  it("C-104 an available gallery is a valid locale target", async () => {
    expect(await checkGalleryLocaleTarget(deps(RECORD), TOKEN, "203.0.113.7")).toBe(true);
  });

  it("C-104 an unknown token is not a target and counts toward the token limit", async () => {
    const fake = deps(null);
    expect(await checkGalleryLocaleTarget(fake, TOKEN, "203.0.113.7")).toBe(false);
    expect(fake.rateLimiter.hit).toHaveBeenCalledTimes(1);
  });

  it("AC-L10N-004 works on the locked password screen without a client session", async () => {
    // A gallery with a password is still a valid target: no password is checked here.
    expect(
      await checkGalleryLocaleTarget(deps({ ...RECORD, passwordHash: "x" }), TOKEN, "1.1.1.1"),
    ).toBe(true);
  });
});
