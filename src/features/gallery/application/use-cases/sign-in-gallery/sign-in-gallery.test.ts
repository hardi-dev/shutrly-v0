import { fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import { describe, expect, it, vi } from "vitest";

import type { ClientSessionPayload } from "@/features/gallery/domain/client-session/client-session.types";

import type { ClientAccessRecord } from "../../ports/client-access-repository/client-access-repository.port";
import { resolveClientAccess } from "../resolve-client-access/resolve-client-access";
import { signInGallery } from "./sign-in-gallery";
import type { SignInGalleryDeps } from "./sign-in-gallery.types";

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

function deps(isOver: (key: string) => boolean = () => false): SignInGalleryDeps {
  return {
    repository: { findByTokenUnscoped: vi.fn(() => Promise.resolve(RECORD)) },
    rateLimiter: {
      hit: vi.fn((key: string) => Promise.resolve(!isOver(key))),
      peek: vi.fn(() => Promise.resolve(true)),
    },
    // A transparent fake: the MAC is covered by the signer adapter's own tests.
    signer: {
      sign: (payload) => Promise.resolve(JSON.stringify(payload)),
      verify: (value) => Promise.resolve(JSON.parse(value) as ClientSessionPayload),
    },
    hasher: { hash: fakeHasher.hash, verify: vi.fn(fakeHasher.verify) },
    newSessionId: () => "0123456789abcdef0123456789abcdef",
    now: new Date("2026-10-06T10:00:00Z"),
  };
}

describe("signInGallery (D-5)", () => {
  it("AC-ACC-001 issues a cookie the gate accepts", async () => {
    const d = deps();
    const result = await signInGallery(d, {
      token: TOKEN,
      ip: "10.0.0.1",
      values: { password: "mawar-4821" },
    });
    if (result.kind !== "SIGNED_IN") throw new Error("expected a session");
    const gate = await resolveClientAccess(d, {
      token: TOKEN,
      ip: "10.0.0.1",
      cookie: result.cookie,
    });
    expect(gate.kind).toBe("SIGNED_IN");
  });

  it("AC-ACC-003 counts before the hash and skips it when over the per-address limit", async () => {
    // client:pw:<token-hash>:<address-hash> is the per-address key.
    const d = deps((key) => key.split(":").length === 4);
    const result = await signInGallery(d, {
      token: TOKEN,
      ip: "10.0.0.1",
      values: { password: "mawar-4821" },
    });
    expect(result).toEqual({ kind: "TOO_MANY_ATTEMPTS", minutes: 15 });
    expect(d.hasher.verify).not.toHaveBeenCalled();
  });

  it("refuses an empty password without a lookup", async () => {
    const d = deps();
    expect(
      await signInGallery(d, { token: TOKEN, ip: "10.0.0.1", values: { password: " " } }),
    ).toEqual({ kind: "INVALID" });
    expect(d.repository.findByTokenUnscoped).not.toHaveBeenCalled();
  });
});
