import { uniqueEmail } from "@tests/support/auth/unique";
import { count, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createDrizzleAccountDirectory } from "@/adapters/db/account-directory/drizzle-account-directory";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleLinkRegistry } from "@/adapters/db/link-registry/drizzle-link-registry";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";
import { account, session, user } from "@/adapters/db/schema/auth/auth";
import { asAuthUserId } from "@/features/auth/domain/account/account";
import type { AuthUserId } from "@/features/auth/domain/account/account.types";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { openTestDb } from "../helpers/test-db";

let db: Db;
let close: () => Promise<void>;
beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

interface SeedOptions {
  verified: boolean;
  password: boolean;
  sessions: number;
}

async function seedOwner({ verified, password, sessions }: SeedOptions) {
  const id = crypto.randomUUID();
  const email = uniqueEmail();
  const verifiedAt = verified ? new Date() : null;
  await db
    .insert(user)
    .values({ id, name: "Owner", email, emailVerified: verified, emailVerifiedAt: verifiedAt });
  if (password) {
    const credential = { id: crypto.randomUUID(), accountId: id, providerId: "credential" };
    await db.insert(account).values({ ...credential, userId: id, password: "hash" });
  }
  for (let i = 0; i < sessions; i++) {
    const expiresAt = new Date(Date.now() + 3_600_000);
    await db
      .insert(session)
      .values({ id: crypto.randomUUID(), token: crypto.randomUUID(), userId: id, expiresAt });
  }
  return { id: asAuthUserId(id), email: normaliseEmail(email) };
}

async function sessionCount(id: AuthUserId): Promise<number> {
  const rows = await db.select({ n: count() }).from(session).where(eq(session.userId, id));
  return rows.at(0)?.n ?? 0;
}

describe("Drizzle account directory", () => {
  it("BR-AUTH-008 reports whether the account has a password", async () => {
    const accounts = createDrizzleAccountDirectory(db);
    const withPassword = await seedOwner({ verified: true, password: true, sessions: 0 });
    const googleOnly = await seedOwner({ verified: true, password: false, sessions: 0 });
    expect((await accounts.getById(withPassword.id))?.hasPassword).toBe(true);
    expect((await accounts.findByEmail(googleOnly.email))?.hasPassword).toBe(false);
  });

  it("AC-AUTH-015 a status change revokes every session in the same transaction", async () => {
    const accounts = createDrizzleAccountDirectory(db);
    const owner = await seedOwner({ verified: true, password: true, sessions: 2 });
    await accounts.setStatusAndRevokeSessions(owner.id, "SUSPENDED");
    expect(await sessionCount(owner.id)).toBe(0);
    expect((await accounts.getById(owner.id))?.status).toBe("SUSPENDED");
  });

  it("AC-AUTH-027 the takeover guard verifies, removes the password and revokes sessions", async () => {
    const accounts = createDrizzleAccountDirectory(db);
    const owner = await seedOwner({ verified: false, password: true, sessions: 2 });
    await accounts.applyGoogleTakeoverGuard(owner.id);
    expect(await accounts.getById(owner.id)).toMatchObject({
      emailVerified: true,
      hasPassword: false,
    });
    expect(await sessionCount(owner.id)).toBe(0);
  });
});

describe("Drizzle latest-link registry (A-3)", () => {
  it("AC-AUTH-005 accepts only the latest link, once", async () => {
    const links = createDrizzleLinkRegistry(db);
    const { id } = await seedOwner({ verified: false, password: true, sessions: 0 });
    const ttlSeconds = 3600;
    await links.record({ userId: id, purpose: "VERIFY_EMAIL", token: "first", ttlSeconds });
    await links.record({ userId: id, purpose: "VERIFY_EMAIL", token: "second", ttlSeconds });
    expect(await links.consume("VERIFY_EMAIL", "first")).toBeNull();
    expect(await links.consume("VERIFY_EMAIL", "second")).toBe(id);
    expect(await links.consume("VERIFY_EMAIL", "second")).toBeNull();
  });

  it("AC-AUTH-018 an expired link is not current", async () => {
    const { id } = await seedOwner({ verified: true, password: true, sessions: 0 });
    await createDrizzleLinkRegistry(db).record({
      userId: id,
      purpose: "RESET_PASSWORD",
      token: "t",
      ttlSeconds: 3600,
    });
    const inTwoHours = createDrizzleLinkRegistry(db, () => new Date(Date.now() + 7_200_000));
    expect(await inTwoHours.isCurrent("RESET_PASSWORD", "t")).toBe(false);
  });

  it("AC-AUTH-005 two concurrent consumes cannot both succeed", async () => {
    const links = createDrizzleLinkRegistry(db);
    const { id } = await seedOwner({ verified: false, password: true, sessions: 0 });
    await links.record({ userId: id, purpose: "VERIFY_EMAIL", token: "race", ttlSeconds: 3600 });
    const results = await Promise.all([
      links.consume("VERIFY_EMAIL", "race"),
      links.consume("VERIFY_EMAIL", "race"),
    ]);
    expect(results.filter((userId) => userId !== null)).toHaveLength(1);
  });
});

describe("Neon rate limiter (ADR-013)", () => {
  const rule = { limit: 2, windowSeconds: 60 };
  const key = () => `test:${crypto.randomUUID()}`;

  it("AC-AUTH-010 counts hits atomically and refuses after the limit", async () => {
    const limiter = createNeonRateLimiter(db);
    const k = key();
    const results = await Promise.all([
      limiter.hit(k, rule),
      limiter.hit(k, rule),
      limiter.hit(k, rule),
    ]);
    expect(results.filter(Boolean)).toHaveLength(2);
    expect(await limiter.peek(k, rule)).toBe(false);
  });

  it("AC-AUTH-010 peek does not count", async () => {
    const limiter = createNeonRateLimiter(db);
    const k = key();
    await limiter.peek(k, rule);
    await limiter.peek(k, rule);
    expect(await limiter.hit(k, rule)).toBe(true);
  });

  it("AC-AUTH-010 starts a new window after windowSeconds", async () => {
    let now = new Date("2000-01-01T00:00:00Z");
    const limiter = createNeonRateLimiter(db, () => now);
    const k = key();
    await limiter.hit(k, rule);
    await limiter.hit(k, rule);
    expect(await limiter.peek(k, rule)).toBe(false);
    now = new Date("2000-01-01T00:01:00Z");
    expect(await limiter.peek(k, rule)).toBe(true);
  });

  it("AC-AUTH-021 ADR-013 purges windows older than the cutoff", async () => {
    const limiter = createNeonRateLimiter(db, () => new Date("2000-01-01T00:00:00Z"));
    await limiter.hit(key(), rule);
    expect(await limiter.purgeBefore(new Date("2000-01-01T01:00:00Z"))).toBeGreaterThanOrEqual(1);
  });
});
