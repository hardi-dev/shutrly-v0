import "server-only";

import { drizzleAdapter } from "better-auth/adapters/drizzle";

import type { Db } from "../client/client.types";
import * as authSchema from "../schema/auth/auth";

/**
 * Better Auth's database adapter over the request's Drizzle database. It lives in
 * `adapters/db` because only this adapter may touch the schema; `adapters/auth` receives it
 * from composition (an adapter never imports another adapter).
 * @param db - the request-scoped Drizzle database (ADR-009)
 * @returns the value for Better Auth's `database` option
 */
export function createBetterAuthDatabase(db: Db): ReturnType<typeof drizzleAdapter> {
  return drizzleAdapter(db, { provider: "pg", schema: authSchema });
}
