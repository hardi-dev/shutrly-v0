import "server-only";

import { logger } from "@/shared/logging/logger";

import type { AuthLogEvent, AuthLogLevel } from "./auth-log.types";

/**
 * Log one auth event through an allow-list, so no password, token, URL, cookie or email can
 * pass through (C-103, AC-AUTH-021). It is the only logger call in auth code.
 * @param event - operation, outcome category, request ID and optional user ID / link kind
 * @param level - defaults to `info`
 * @returns nothing
 */
export function authLog(event: AuthLogEvent, level: AuthLogLevel = "info"): void {
  const { operation, outcome, requestId, userId, detail } = event;
  logger[level]("auth", { operation, outcome, requestId, userId, detail });
}
