export type PickNoteResult =
  | { readonly ok: true; readonly note: string | null }
  | { readonly ok: false; readonly code: "TOO_LONG" };
