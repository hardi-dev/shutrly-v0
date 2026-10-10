import { uniqueEmail } from "@tests/support/auth/unique";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { user } from "@/adapters/db/schema/auth/auth";

import { openTestDb } from "../helpers/test-db";

let db: Db;
let close: () => Promise<void>;
beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

const base = () => ({ id: crypto.randomUUID(), name: "Owner", email: uniqueEmail() });

describe("auth schema", () => {
  it("BR-AUTH-002 defaults a new user to ACTIVE and unverified", async () => {
    const row = base();
    await db.insert(user).values(row);
    const [saved] = await db.select().from(user).where(eq(user.id, row.id));
    expect(saved).toMatchObject({ status: "ACTIVE", emailVerified: false, emailVerifiedAt: null });
  });

  it("BR-AUTH-005 rejects an unknown status", async () => {
    await expect(db.insert(user).values({ ...base(), status: "BANNED" })).rejects.toThrow();
  });

  it("BR-AUTH-002 keeps email_verified and email_verified_at consistent", async () => {
    await expect(db.insert(user).values({ ...base(), emailVerified: true })).rejects.toThrow();
    const verified = { ...base(), emailVerified: true, emailVerifiedAt: new Date() };
    await expect(db.insert(user).values(verified)).resolves.toBeDefined();
  });

  it("BR-AUTH-002 allows one identity per email regardless of case", async () => {
    const email = uniqueEmail();
    await db.insert(user).values({ ...base(), email });
    const upper = { ...base(), email: email.toUpperCase() };
    await expect(db.insert(user).values(upper)).rejects.toThrow();
  });

  it("BR-L10N-001 a new user row defaults to locale en", async () => {
    const row = base();
    await db.insert(user).values(row);
    const [saved] = await db.select().from(user).where(eq(user.id, row.id));
    expect(saved).toMatchObject({ locale: "en" });
  });

  it("BR-L10N-001 the database refuses a locale outside en and id", async () => {
    await expect(db.insert(user).values({ ...base(), locale: "fr" })).rejects.toThrow();
  });
});
