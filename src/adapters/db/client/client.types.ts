import type { Pool } from "@neondatabase/serverless";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";

import type * as schema from "../schema";

export type Db = NeonDatabase<typeof schema>;

export interface DbHandle {
  db: Db;
  pool: Pool;
}
