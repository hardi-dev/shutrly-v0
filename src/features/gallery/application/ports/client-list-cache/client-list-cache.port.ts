import "server-only";

/** A best-effort cache of client photo-list JSON (D-22): a miss or an error never changes behaviour. */
export interface ClientListCachePort {
  /** The stored JSON, or null on a miss. */
  readonly read: (key: string) => Promise<string | null>;
  readonly write: (key: string, json: string) => Promise<void>;
}
