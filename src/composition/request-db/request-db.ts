import "server-only";

import { createDb } from "@/adapters/db/client/client";
import type { Db } from "@/adapters/db/client/client.types";

import { getRequestContext } from "../request-context/request-context";
import type { RequestContext } from "../request-context/request-context.types";

/**
 * Run `work` with a request-scoped database. The pool is ended only after the work settles,
 * even when it throws (ADR-009).
 * @param work - the database work for this request
 * @returns whatever `work` resolves to
 */
export async function withRequestDb<T>(
  work: (db: Db, rc: RequestContext) => Promise<T>,
): Promise<T> {
  const rc = await getRequestContext();
  const { db, pool } = createDb(rc.env.DATABASE_URL);
  try {
    return await work(db, rc);
  } finally {
    rc.waitUntil(pool.end());
  }
}
