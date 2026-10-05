import "server-only";

import type { SyncCursor } from "@/features/gallery/domain/sync-step/sync-step.types";

import { syncCursorSchema } from "./sync-cursor.schema";

/** Reads the stored cursor of an open sync run at the trust boundary (TD D-20). @param raw - the JSONB value read from the source row @returns the cursor, or null when it is not a valid cursor */
export function parseSyncCursor(raw: unknown): SyncCursor | null {
  const parsed = syncCursorSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
