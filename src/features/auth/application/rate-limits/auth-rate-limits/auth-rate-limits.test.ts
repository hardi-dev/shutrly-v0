import { InMemoryRateLimiter } from "@tests/support/auth/in-memory-rate-limiter";
import { uniqueIp } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { allowLimitedAction, isLoginBlocked, recordLoginFailure } from "./auth-rate-limits";

const email = normaliseEmail("owner@example.com");
const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ip = uniqueIp();

async function attempts(count: number, run: (i: number) => Promise<boolean>): Promise<boolean[]> {
  const results: boolean[] = [];
  for (let i = 0; i < count; i++) results.push(await run(i));
  return results;
}

describe("auth rate limits (A-6)", () => {
  it("AC-AUTH-016 allows 3 per hour per email, then refuses", async () => {
    const limiter = new InMemoryRateLimiter();
    const results = await attempts(4, () =>
      allowLimitedAction(limiter, "FORGOT_PASSWORD", email, uniqueIp()),
    );
    expect(results).toEqual([true, true, true, false]);
  });

  it("AC-AUTH-016 allows 20 per hour per IP across different emails", async () => {
    const limiter = new InMemoryRateLimiter();
    const results = await attempts(21, (i) =>
      allowLimitedAction(limiter, "REGISTER", normaliseEmail(`o${String(i)}@x.dev`), ip),
    );
    expect(results.filter(Boolean)).toHaveLength(20);
  });

  it("AC-AUTH-016 counts each action separately", async () => {
    const limiter = new InMemoryRateLimiter();
    await attempts(3, () => allowLimitedAction(limiter, "REGISTER", email, ip));
    expect(await allowLimitedAction(limiter, "RESEND_VERIFICATION", email, ip)).toBe(true);
  });

  it("AC-AUTH-010 blocks login after 5 failures for the email, even from a new IP", async () => {
    const limiter = new InMemoryRateLimiter();
    for (let i = 0; i < 5; i++) await recordLoginFailure(limiter, email, uniqueIp());
    expect(await isLoginBlocked(limiter, email, ip)).toBe(true);
  });

  it("AC-AUTH-010 blocks login after 5 failures from one IP, even for another email", async () => {
    const limiter = new InMemoryRateLimiter();
    for (let i = 0; i < 5; i++) {
      await recordLoginFailure(limiter, normaliseEmail(`o${String(i)}@x.dev`), ip);
    }
    expect(await isLoginBlocked(limiter, email, ip)).toBe(true);
  });

  it("AC-AUTH-010 four failures do not block, and the window resets after 15 minutes", async () => {
    let now = Date.UTC(2026, 0, 1);
    const limiter = new InMemoryRateLimiter(() => now);
    for (let i = 0; i < 4; i++) await recordLoginFailure(limiter, email, ip);
    expect(await isLoginBlocked(limiter, email, ip)).toBe(false);
    await recordLoginFailure(limiter, email, ip);
    expect(await isLoginBlocked(limiter, email, ip)).toBe(true);
    now += FIFTEEN_MINUTES;
    expect(await isLoginBlocked(limiter, email, ip)).toBe(false);
  });

  it("AC-AUTH-021 ADR-013 keys never contain the raw email", async () => {
    const limiter = new InMemoryRateLimiter();
    await allowLimitedAction(limiter, "REGISTER", email, ip);
    expect(limiter.keys().join(" ")).not.toContain("owner@example.com");
  });
});
