import "server-only";

import { pingDatabase } from "@/adapters/db/ping-database/ping-database";

import { withRequestDb } from "../request-db/request-db";

/**
 * Prove Neon over WebSocket works in this runtime (`next dev` and workerd).
 * @returns nothing; throws when the database can't be reached
 */
export async function checkDatabase(): Promise<void> {
  await withRequestDb(pingDatabase);
}
