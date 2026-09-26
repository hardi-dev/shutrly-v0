import "server-only";

import type { NormalisedEmail } from "@/features/auth/domain/credentials/credentials.types";
import { sha256Hex } from "@/shared/crypto/sha256-hex/sha256-hex";

import type { RateLimiterPort, RateLimitRule } from "../../ports/rate-limiter/rate-limiter.port";
import type { LimitedAction } from "./auth-rate-limits.types";

const MINUTE = 60;
const HOUR = 60 * MINUTE;

/** A-6: failed logins per email and per IP; register/forgot/resend per email and per IP. */
export const AUTH_RATE_RULES = {
  LOGIN_FAILURE: { limit: 5, windowSeconds: 15 * MINUTE },
  PER_EMAIL: { limit: 3, windowSeconds: HOUR },
  PER_IP: { limit: 20, windowSeconds: HOUR },
} as const satisfies Record<string, RateLimitRule>;

// ADR-013: keys hash the email so the table never holds a raw address.
async function emailKey(scope: string, email: NormalisedEmail): Promise<string> {
  return `${scope}:email:${await sha256Hex(email)}`;
}

function ipKey(scope: string, ip: string): string {
  return `${scope}:ip:${ip}`;
}

/**
 * Count one register, forgot-password or resend attempt against both A-6 limits.
 * @param limiter - the rate limiter port
 * @param action - which limited action this is
 * @param email - the normalised email the action targets
 * @param ip - the client IP
 * @returns true when both the per-email and the per-IP limit still allow it
 */
export async function allowLimitedAction(
  limiter: RateLimiterPort,
  action: LimitedAction,
  email: NormalisedEmail,
  ip: string,
): Promise<boolean> {
  const [byEmail, byIp] = await Promise.all([
    limiter.hit(await emailKey(action, email), AUTH_RATE_RULES.PER_EMAIL),
    limiter.hit(ipKey(action, ip), AUTH_RATE_RULES.PER_IP),
  ]);
  return byEmail && byIp;
}

/**
 * Tell whether login is blocked by earlier failures for this email or this IP (A-6).
 * @param limiter - the rate limiter port
 * @param email - the normalised email being signed in
 * @param ip - the client IP
 * @returns true once either failure count has reached the limit
 */
export async function isLoginBlocked(
  limiter: RateLimiterPort,
  email: NormalisedEmail,
  ip: string,
): Promise<boolean> {
  const [byEmail, byIp] = await Promise.all([
    limiter.peek(await emailKey("LOGIN_FAILURE", email), AUTH_RATE_RULES.LOGIN_FAILURE),
    limiter.peek(ipKey("LOGIN_FAILURE", ip), AUTH_RATE_RULES.LOGIN_FAILURE),
  ]);
  return !(byEmail && byIp);
}

/**
 * Count one failed login for the email and for the IP; only failures count (A-6).
 * @param limiter - the rate limiter port
 * @param email - the normalised email that failed
 * @param ip - the client IP
 * @returns nothing
 */
export async function recordLoginFailure(
  limiter: RateLimiterPort,
  email: NormalisedEmail,
  ip: string,
): Promise<void> {
  await Promise.all([
    limiter.hit(await emailKey("LOGIN_FAILURE", email), AUTH_RATE_RULES.LOGIN_FAILURE),
    limiter.hit(ipKey("LOGIN_FAILURE", ip), AUTH_RATE_RULES.LOGIN_FAILURE),
  ]);
}
