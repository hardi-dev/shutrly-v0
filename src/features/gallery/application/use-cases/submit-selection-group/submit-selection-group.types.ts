export type SubmitFailureCode =
  "INVALID" | "NOT_FOUND" | "RATE_LIMITED" | "GROUP_NOT_OPEN" | "NO_PICKS";

export type SubmitSelectionGroupResult =
  | { readonly ok: true; readonly groupName: string; readonly usage: number }
  | { readonly ok: false; readonly code: "NEEDS_CONFIRMATION"; readonly remaining: number }
  | { readonly ok: false; readonly code: SubmitFailureCode };
