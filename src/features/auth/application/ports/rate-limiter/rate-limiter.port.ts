import "server-only";

export interface RateLimitRule {
  limit: number;
  windowSeconds: number;
}

/** Fixed-window counters (ADR-013). Keys never contain a raw email. */
export interface RateLimiterPort {
  /** True while the current window's count is below the limit. Does not count. */
  peek: (key: string, rule: RateLimitRule) => Promise<boolean>;
  /** Counts one attempt; true if the count, including this one, is within the limit. */
  hit: (key: string, rule: RateLimitRule) => Promise<boolean>;
}
