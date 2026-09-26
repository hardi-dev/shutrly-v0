import { createDb } from "@/adapters/db/client/client";
import type { Db } from "@/adapters/db/client/client.types";

/**
 * Open the shared non-prod database for an integration test (ADR-009): seed unique rows, assert
 * only on them, never truncate. Refuses to connect unless `APP_STAGE` is `test`.
 * @returns the Drizzle `db` and `close()`, which ends the pool
 */
export function openTestDb(): Promise<{ db: Db; close(): Promise<void> }> {
  if (process.env.APP_STAGE !== "test") {
    return Promise.reject(
      new Error('openTestDb: APP_STAGE must be "test" (set it in .env.test); refusing to connect.'),
    );
  }
  const url = process.env.DATABASE_URL;
  if (!url) return Promise.reject(new Error("openTestDb: DATABASE_URL is missing in .env.test."));
  const { db, pool } = createDb(url);
  return Promise.resolve({ db, close: () => pool.end() });
}
