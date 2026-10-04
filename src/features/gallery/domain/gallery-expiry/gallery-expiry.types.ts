import type { GalleryStatus } from "../gallery-status/gallery-status.types";

export type ExpiryInput =
  | { readonly type: "NONE" }
  | { readonly type: "DATE"; readonly date: string }
  | { readonly type: "DAYS"; readonly days: number };

export interface ResolvedExpiry {
  readonly expiresAt: Date | null;
  readonly expiryDays: number | null;
}

export type ExpiryResolution =
  | { readonly ok: true; readonly expiry: ResolvedExpiry }
  | { readonly ok: false; readonly code: "PAST_DATE" };

export interface StoredExpiry {
  readonly status: GalleryStatus;
  readonly expiresAt: Date | null;
  readonly expiryDays: number | null;
}
