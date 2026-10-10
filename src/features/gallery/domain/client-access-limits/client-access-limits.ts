import type { WindowRule } from "./client-access-limits.types";

export const PASSWORD_PER_TOKEN_AND_ADDRESS = { limit: 5, windowSeconds: 900 } as const;
export const PASSWORD_PER_TOKEN = { limit: 20, windowSeconds: 3600 } as const;
export const UNKNOWN_TOKEN_PER_ADDRESS = { limit: 30, windowSeconds: 3600 } as const;
export const SELECTION_WRITES_PER_SESSION = { limit: 120, windowSeconds: 60 } as const;
export const CLIENT_SESSION_DAYS = 30; // A-1
export const PICK_NOTE_MAX = 500; // BR-SEL-004

const MS_PER_MINUTE = 60_000;

/**
 * Whole minutes until a fixed counter window ends, for *Coba lagi dalam n menit* (D-5, A-2).
 * @param rule - the window size
 * @param now - the clock
 * @returns at least 1 minute
 */
export function minutesUntilWindowEnds(rule: WindowRule, now: Date): number {
  const size = rule.windowSeconds * 1000;
  const end = (Math.floor(now.getTime() / size) + 1) * size;
  return Math.max(1, Math.ceil((end - now.getTime()) / MS_PER_MINUTE));
}
