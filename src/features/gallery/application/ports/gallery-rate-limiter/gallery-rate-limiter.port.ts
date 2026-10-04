import "server-only";

export interface GalleryRateLimitRule {
  readonly limit: number;
  readonly windowSeconds: number;
}

// D-19: composition passes the existing Neon fixed-window limiter.
export interface GalleryRateLimiterPort {
  /** Counts one attempt; true while the count, this one included, is within the limit. */
  readonly hit: (key: string, rule: GalleryRateLimitRule) => Promise<boolean>;
}
