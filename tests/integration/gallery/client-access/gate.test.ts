import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import { fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { createWebCryptoClientSessionSigner } from "@/adapters/crypto/client-session-signer/web-crypto-client-session-signer";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleClientAccessRepository } from "@/adapters/db/gallery-repository/drizzle-client-access-repository";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";
import { project } from "@/adapters/db/schema/booking/project";
import { gallery } from "@/adapters/db/schema/gallery/gallery";
import { rotateClientAccessToken } from "@/features/booking/application/use-cases/rotate-client-access-token/rotate-client-access-token";
import { resolveClientAccess } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access";
import type { ClientGateDeps } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access.types";
import { signInGallery } from "@/features/gallery/application/use-cases/sign-in-gallery/sign-in-gallery";
import type { SignInGalleryDeps } from "@/features/gallery/application/use-cases/sign-in-gallery/sign-in-gallery.types";

import { openTestDb } from "../../helpers/test-db";
import {
  type ClientAccessFixture,
  GALLERY_PASSWORD,
  randomIp,
  randomToken,
  seedClientAccess,
  seedProjectWithGallery,
} from "./fixture";

let db: Db;
let close: () => Promise<void>;
let fixture: ClientAccessFixture;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
  fixture = await seedClientAccess(db);
});
afterAll(() => close());

const signer = createWebCryptoClientSessionSigner(TEST_APP_ENV.CLIENT_SESSION_KEY);

function deps(now = new Date()): SignInGalleryDeps {
  return {
    repository: createDrizzleClientAccessRepository(db),
    rateLimiter: createNeonRateLimiter(db),
    signer,
    hasher: { hash: fakeHasher.hash, verify: vi.fn(fakeHasher.verify) },
    newSessionId: () => crypto.randomUUID().replaceAll("-", ""),
    now,
  };
}

async function signIn(token: string, ip: string, password = GALLERY_PASSWORD, d = deps()) {
  return signInGallery(d, { token, ip, values: { password } });
}

async function cookieFor(token: string): Promise<string> {
  const result = await signIn(token, randomIp());
  if (result.kind !== "SIGNED_IN") throw new Error(`not signed in: ${result.kind}`);
  return result.cookie;
}

function resolve(token: string, cookie: string | null, d: ClientGateDeps = deps()) {
  return resolveClientAccess(d, { token, ip: randomIp(), cookie });
}

describe("client gate (D-4, D-5)", () => {
  it("AC-ACC-001 signs in with link and password and stays signed in for 30 days", async () => {
    const result = await signIn(fixture.t1, randomIp());
    if (result.kind !== "SIGNED_IN") throw new Error("expected a session");
    expect(result.maxAgeSeconds).toBe(30 * 86_400);
    const gate = await resolve(fixture.t1, result.cookie);
    expect(gate).toMatchObject({
      kind: "SIGNED_IN",
      gate: { studioName: "Studio Senja", projectTitle: "Wisuda Rina", clientFirstName: "Rina" },
      context: { projectId: fixture.projectId, galleryId: fixture.galleryId },
    });
    const later = new Date(Date.now() + 29 * 86_400_000);
    expect((await resolve(fixture.t1, result.cookie, deps(later))).kind).toBe("SIGNED_IN");
  });

  it("AC-ACC-002 refuses a wrong password and returns no gallery data", async () => {
    const result = await signIn(fixture.t1, randomIp(), "mawar-0000");
    expect(result).toEqual({ kind: "WRONG_PASSWORD" });
  });

  it("AC-ACC-003 refuses the 6th attempt from one address without checking the hash", async () => {
    const ip = randomIp();
    const { token } = await freshProject();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect((await signIn(token, ip, "mawar-0000")).kind).toBe("WRONG_PASSWORD");
    }
    const d = deps();
    const sixth = await signIn(token, ip, GALLERY_PASSWORD, d);
    expect(sixth.kind).toBe("TOO_MANY_ATTEMPTS");
    if (sixth.kind === "TOO_MANY_ATTEMPTS") expect(sixth.minutes).toBeGreaterThanOrEqual(1);
    expect(d.hasher.verify).not.toHaveBeenCalled();
    expect((await signIn(token, randomIp())).kind).toBe("SIGNED_IN");
  });

  it.each([
    ["an unknown token", () => Promise.resolve(randomToken())],
    ["a malformed token", () => Promise.resolve("not-a-token")],
    ["a draft gallery", () => withGallery({ status: "DRAFT", publishedAt: null })],
    ["an expired gallery", () => withGallery({ expiresAt: new Date(Date.now() - 60_000) })],
    [
      "an archived gallery",
      () => withGallery({ status: "ARCHIVED", archivedAt: new Date(), archivedBy: null }),
    ],
    ["a project without gallery", () => withoutGallery()],
    ["a cancelled project", () => withProject({ status: "CANCELLED", cancelledAt: new Date() })],
  ])("AC-ACC-004 shows the same neutral result for %s", async (_case, tokenFor) => {
    const token = await tokenFor();
    expect(await resolve(token, null)).toEqual({ kind: "NEUTRAL" });
    expect((await signIn(token, randomIp())).kind).toBe("NEUTRAL");
  });

  it("AC-ACC-005 refuses the 31st unknown token from one address without a lookup", async () => {
    const ip = randomIp();
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await resolveClientAccess(deps(), { token: randomToken(), ip, cookie: null });
    }
    const d = deps();
    const lookup = vi.spyOn(d.repository, "findByTokenUnscoped");
    expect(await resolveClientAccess(d, { token: fixture.t1, ip, cookie: null })).toEqual({
      kind: "NEUTRAL",
    });
    expect(lookup).not.toHaveBeenCalled();
  });

  it("AC-ACC-006 AC-ACC-007 a session of T1 opens neither T2 nor T3", async () => {
    const cookie = await cookieFor(fixture.t1);
    expect((await resolve(fixture.t2, cookie)).kind).toBe("PASSWORD");
    expect((await resolve(fixture.t3, cookie)).kind).toBe("PASSWORD");
    expect((await resolve(fixture.t1, null)).kind).toBe("PASSWORD");
  });

  it("AC-ACC-008 a password rotation sends the client back to the password screen", async () => {
    const { token, galleryId } = await freshProject();
    const cookie = await cookieFor(token);
    await db
      .update(gallery)
      .set({ passwordVersion: 2, passwordHash: await fakeHasher.hash("melati-1234") })
      .where(eq(gallery.id, galleryId));
    expect((await resolve(token, cookie)).kind).toBe("PASSWORD");
    expect((await signIn(token, randomIp())).kind).toBe("WRONG_PASSWORD");
    expect((await signIn(token, randomIp(), "melati-1234")).kind).toBe("SIGNED_IN");
  });

  it("AC-ACC-009 Ganti link ends the old link and its sessions; the new link opens with the same password", async () => {
    const { token, projectId } = await freshProject();
    const cookie = await cookieFor(token);
    const at = new Date("2026-10-07T10:00:00Z");
    const fresh = randomToken();
    const result = await rotateClientAccessToken(
      { projects: createDrizzleProjectRepository(db), generateToken: () => fresh, now: at },
      fixture.context,
      fixture.ownerId,
      projectId,
    );
    expect(result).toEqual({ ok: true, token: fresh });
    const [row] = await db
      .select({ by: project.tokenRotatedBy, at: project.tokenRotatedAt })
      .from(project)
      .where(eq(project.id, projectId));
    expect([row.by, row.at?.toISOString()]).toEqual([fixture.ownerId, at.toISOString()]);
    expect(await resolve(token, cookie)).toEqual({ kind: "NEUTRAL" });
    expect((await resolve(fresh, cookie)).kind).toBe("PASSWORD");
    expect((await signIn(fresh, randomIp())).kind).toBe("SIGNED_IN");
  });

  it("R-3 a token already used by another project is retried, never shared", async () => {
    const { projectId } = await freshProject();
    const taken = (await freshProject()).token;
    const fresh = randomToken();
    const tokens = [taken, fresh];
    const result = await rotateClientAccessToken(
      {
        projects: createDrizzleProjectRepository(db),
        generateToken: () => tokens.shift() ?? randomToken(),
        now: new Date(),
      },
      fixture.context,
      fixture.ownerId,
      projectId,
    );
    expect(result).toEqual({ ok: true, token: fresh });
  });

  it("D-19 a cancelled project's link is not rotated", async () => {
    const { token, projectId } = await freshProject();
    await db
      .update(project)
      .set({ status: "CANCELLED", cancelledAt: new Date() })
      .where(eq(project.id, projectId));
    const result = await rotateClientAccessToken(
      { projects: createDrizzleProjectRepository(db), generateToken: randomToken, now: new Date() },
      fixture.context,
      fixture.ownerId,
      projectId,
    );
    expect(result).toEqual({ ok: false, code: "PROJECT_CANCELLED" });
    const [row] = await db
      .select({ token: project.clientAccessToken })
      .from(project)
      .where(eq(project.id, projectId));
    expect(row.token).toBe(token);
  });

  it("AC-ACC-010 expiry closes a signed-in session; removing it reopens the same session", async () => {
    const { token, galleryId } = await freshProject();
    const cookie = await cookieFor(token);
    const setExpiry = (expiresAt: Date | null) =>
      db.update(gallery).set({ expiresAt }).where(eq(gallery.id, galleryId));
    await setExpiry(new Date(Date.now() - 1000));
    expect(await resolve(token, cookie)).toEqual({ kind: "NEUTRAL" });
    await setExpiry(null);
    expect((await resolve(token, cookie)).kind).toBe("SIGNED_IN");
  });
});

async function freshProject() {
  return seedProjectWithGallery(db, {
    workspaceId: fixture.context.workspaceId,
    serviceId: fixture.serviceId,
    clientName: "Rina",
    title: "Wisuda Rina",
    status: "POST_PROCESSING",
  });
}

async function withGallery(change: Partial<typeof gallery.$inferInsert>): Promise<string> {
  const created = await freshProject();
  await db.update(gallery).set(change).where(eq(gallery.id, created.galleryId));
  return created.token;
}

async function withProject(change: Partial<typeof project.$inferInsert>): Promise<string> {
  const created = await freshProject();
  await db.update(project).set(change).where(eq(project.id, created.projectId));
  return created.token;
}

async function withoutGallery(): Promise<string> {
  const created = await freshProject();
  await db.delete(gallery).where(eq(gallery.id, created.galleryId));
  return created.token;
}
