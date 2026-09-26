import type {
  RateLimiterPort,
  RateLimitRule,
} from "@/features/auth/application/ports/rate-limiter/rate-limiter.port";

/** Test double for ADR-013's fixed-window limiter, with an injectable clock. */
export class InMemoryRateLimiter implements RateLimiterPort {
  private readonly counts = new Map<string, number>();

  constructor(private readonly now: () => number = () => Date.now()) {}

  peek(key: string, rule: RateLimitRule): Promise<boolean> {
    return Promise.resolve((this.counts.get(this.slot(key, rule)) ?? 0) < rule.limit);
  }

  hit(key: string, rule: RateLimitRule): Promise<boolean> {
    const slot = this.slot(key, rule);
    const next = (this.counts.get(slot) ?? 0) + 1;
    this.counts.set(slot, next);
    return Promise.resolve(next <= rule.limit);
  }

  keys(): string[] {
    return [...this.counts.keys()];
  }

  private slot(key: string, rule: RateLimitRule): string {
    return `${key}@${String(Math.floor(this.now() / (rule.windowSeconds * 1000)))}`;
  }
}
