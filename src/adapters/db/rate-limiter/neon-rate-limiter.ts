import "server-only";

import { and, eq, lt, sql } from "drizzle-orm";

import type { RateLimitRule } from "@/features/auth/application/ports/rate-limiter/rate-limiter.port";

import type { Db } from "../client/client.types";
import { authRateLimit } from "../schema/auth/auth";
import type { PurgeableRateLimiter } from "./neon-rate-limiter.types";

/**
 * ADR-013 fixed-window counters in Neon. `hit` is one atomic upsert, so concurrent requests
 * cannot both slip under the limit.
 * @param db - the request-scoped Drizzle database
 * @param now - the clock, for tests
 * @returns the rate limiter, plus `purgeBefore` for the cleanup script
 */
export function createNeonRateLimiter(
  db: Db,
  now: () => Date = () => new Date(),
): PurgeableRateLimiter {
  const windowStart = (rule: RateLimitRule): Date => {
    const size = rule.windowSeconds * 1000;
    return new Date(Math.floor(now().getTime() / size) * size);
  };
  return {
    async peek(key, rule) {
      const rows = await db
        .select({ count: authRateLimit.count })
        .from(authRateLimit)
        .where(and(eq(authRateLimit.key, key), eq(authRateLimit.windowStart, windowStart(rule))));
      return (rows.at(0)?.count ?? 0) < rule.limit;
    },
    async hit(key, rule) {
      const rows = await db
        .insert(authRateLimit)
        .values({ key, windowStart: windowStart(rule), count: 1 })
        .onConflictDoUpdate({
          target: [authRateLimit.key, authRateLimit.windowStart],
          set: { count: sql`${authRateLimit.count} + 1` },
        })
        .returning({ count: authRateLimit.count });
      const row = rows.at(0);
      // An upsert with RETURNING yields exactly one row; no row means the insert failed.
      if (!row) throw new Error("rate-limit upsert returned no row");
      return row.count <= rule.limit;
    },
    async purgeBefore(cutoff) {
      const removed = await db
        .delete(authRateLimit)
        .where(lt(authRateLimit.windowStart, cutoff))
        .returning({ key: authRateLimit.key });
      return removed.length;
    },
  };
}
