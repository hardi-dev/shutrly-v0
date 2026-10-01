import type { Pool } from "@neondatabase/serverless";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NeonDatabase, NeonQueryResultHKT } from "drizzle-orm/neon-serverless";
import type { PgDatabase } from "drizzle-orm/pg-core";

import type * as schema from "../schema";

export type Db = NeonDatabase<typeof schema>;

// The common base of `Db` and a `db.transaction` callback's `tx`: repositories accept it so
// composition can run several of them in one transaction (ADR-016).
export type DbExecutor = PgDatabase<
  NeonQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export interface DbHandle {
  db: Db;
  pool: Pool;
}
