import type { GalleryRateLimiterPort } from "../../ports/gallery-rate-limiter/gallery-rate-limiter.port";
import type { SelectionRepositoryPort } from "../../ports/selection-repository/selection-repository.port";

export interface SelectionWriteDeps {
  readonly selections: SelectionRepositoryPort;
  readonly rateLimiter: GalleryRateLimiterPort;
}

export type PickFailureCode =
  | "INVALID"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "GROUP_NOT_OPEN"
  | "PHOTO_NOT_SELECTABLE"
  | "LIMIT_REACHED";

export type SetPickResult =
  | { readonly ok: true; readonly usage: number; readonly quantity: number }
  | { readonly ok: false; readonly code: PickFailureCode };

export type SetPickNoteResult =
  | { readonly ok: true; readonly note: string | null }
  | {
      readonly ok: false;
      readonly code:
        | Exclude<PickFailureCode, "LIMIT_REACHED" | "PHOTO_NOT_SELECTABLE">
        | "NOTES_OFF"
        | "NOT_PICKED"
        | "TOO_LONG";
    };

export interface PickChangeRequest {
  readonly photoId: string;
  readonly quantity: number;
}
