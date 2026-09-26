import "server-only";

import { sql } from "drizzle-orm";

import type { Db } from "../client/client.types";

/**
 * Run `select 1` to prove the connection works in this runtime. Returns no data.
 * @param db - a request-scoped Drizzle database
 */
export async function pingDatabase(db: Db): Promise<void> {
  await db.execute(sql`select 1`);
}
