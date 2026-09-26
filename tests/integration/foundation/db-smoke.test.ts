import { sql } from "drizzle-orm";
import { afterEach, describe, expect, it, vi } from "vitest";

import { openTestDb } from "../helpers/test-db";

afterEach(() => vi.unstubAllEnvs());

describe("integration database", () => {
  it("AC-FND-006 connects to the shared non-prod database", async () => {
    const { db, close } = await openTestDb();
    try {
      const result = await db.execute(sql`select 1 as one`);
      expect(result.rows[0]).toEqual({ one: 1 });
    } finally {
      await close();
    }
  });

  it("AC-FND-006 refuses to connect unless APP_STAGE=test", async () => {
    vi.stubEnv("APP_STAGE", "production");
    await expect(openTestDb()).rejects.toThrow(/APP_STAGE must be "test"/);
  });
});
