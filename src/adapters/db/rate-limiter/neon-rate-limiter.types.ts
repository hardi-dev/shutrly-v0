import type { RateLimiterPort } from "@/features/auth/application/ports/rate-limiter/rate-limiter.port";

export interface PurgeableRateLimiter extends RateLimiterPort {
  /** Deletes windows that started before `cutoff`; returns how many were removed. */
  purgeBefore: (cutoff: Date) => Promise<number>;
}
