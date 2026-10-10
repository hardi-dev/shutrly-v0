import "server-only";

import { SELECTION_WRITES_PER_SESSION } from "@/features/gallery/domain/client-access-limits/client-access-limits";

import type { GalleryRateLimiterPort } from "../../ports/gallery-rate-limiter/gallery-rate-limiter.port";

/** Counts one selection write for the client session (D-6, BR-ACC-004). @param rateLimiter - the counters @param sessionId - the session's random id @returns true while within the limit */
export function countSelectionWrite(
  rateLimiter: GalleryRateLimiterPort,
  sessionId: string,
): Promise<boolean> {
  return rateLimiter.hit(`client:sel:${sessionId}`, SELECTION_WRITES_PER_SESSION);
}
