import "server-only";

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "../schema";
import type { DbHandle } from "./client.types";

/**
 * Open a Drizzle database over a new Neon Pool. Workers can't share sockets across requests
 * (ADR-009), so the caller ends the pool with `waitUntil(pool.end())` after its work.
 * @param databaseUrl - the pooled Neon connection string
 * @returns the Drizzle `db` and the `pool` the caller must end
 */
export function createDb(databaseUrl: string): DbHandle {
  const pool = new Pool({ connectionString: databaseUrl });
  return { db: drizzle({ client: pool, schema }), pool };
}
