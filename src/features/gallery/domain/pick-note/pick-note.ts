import { PICK_NOTE_MAX } from "../client-access-limits/client-access-limits";
import type { PickNoteResult } from "./pick-note.types";

/**
 * Normalises a client's note on a pick (BR-SEL-004, A-32): trimmed, at most 500 characters,
 * and an empty note clears it.
 * @param raw - the typed note
 * @returns the note to store (null clears it), or TOO_LONG
 */
export function normalisePickNote(raw: string): PickNoteResult {
  const note = raw.trim();
  if (note === "") return { ok: true, note: null };
  if (Array.from(note).length > PICK_NOTE_MAX) return { ok: false, code: "TOO_LONG" };
  return { ok: true, note };
}
