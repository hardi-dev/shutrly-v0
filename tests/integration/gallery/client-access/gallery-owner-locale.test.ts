import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleClientAccessRepository } from "@/adapters/db/gallery-repository/drizzle-client-access-repository";
import { user } from "@/adapters/db/schema/auth/auth";

import { openTestDb } from "../../helpers/test-db";
import { randomToken, seedClientAccess } from "./fixture";

let db: Db;
let close: () => Promise<void>;
beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

async function setOwnerLocale(ownerId: string, locale: "en" | "id") {
  await db.update(user).set({ locale }).where(eq(user.id, ownerId));
}

describe("gallery owner locale lookup", () => {
  it("AC-L10N-001 returns the gallery owner's current locale", async () => {
    const fixture = await seedClientAccess(db);
    await setOwnerLocale(fixture.ownerId, "id");
    const repository = createDrizzleClientAccessRepository(db);
    expect(await repository.findOwnerLocaleByTokenUnscoped(fixture.t1)).toBe("id");
  });

  it("AC-L10N-001 returns null for an unknown token", async () => {
    const repository = createDrizzleClientAccessRepository(db);
    expect(await repository.findOwnerLocaleByTokenUnscoped(randomToken())).toBeNull();
  });

  it("AC-L10N-001 follows an owner switch on the next read", async () => {
    const fixture = await seedClientAccess(db);
    const repository = createDrizzleClientAccessRepository(db);
    await setOwnerLocale(fixture.ownerId, "en");
    expect(await repository.findOwnerLocaleByTokenUnscoped(fixture.t1)).toBe("en");
    await setOwnerLocale(fixture.ownerId, "id");
    expect(await repository.findOwnerLocaleByTokenUnscoped(fixture.t1)).toBe("id");
  });
});
