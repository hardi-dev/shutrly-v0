import type { PickFailureCode } from "../set-pick/set-pick.types";

/** The bulk *Pilih untuk…* result: the new usage and how many photos were newly picked (F-19). */
export type SetPicksResult =
  | { readonly ok: true; readonly usage: number; readonly added: number }
  | { readonly ok: false; readonly code: Exclude<PickFailureCode, "LIMIT_REACHED"> }
  | { readonly ok: false; readonly code: "LIMIT_REACHED"; readonly remaining: number };
